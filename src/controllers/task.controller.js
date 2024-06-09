const Notification = require("../models/notification.model");
const Project = require("../models/project.mode");
const Task = require("../models/task.model")

// [POST] /task/create
const create = async (req, res) => {
  try {
    const { id } = req.user
    const existProject = await Project.findOne({ _id: req.body.project_id })
    if (!existProject) {
      res.status(404).json({
        messages: "Project not found"
      })
      return
    }
    const permissionCreate = await Project.findOne({
      _id: req.body.project_id,
      leader: { $elemMatch: { id: id } }
    })
    if (!permissionCreate) {
      res.status(401).json({
        messages: "Only leaders can create"
      })
      return
    }
    const task = new Task({
      title: req.body.title,
      status: req.body.status,
      severity: req.body.severity,
      project_id: req.body.project_id,
      date: {
        timeStart: JSON.parse(req.body.date).timeStart,
        timeEnd: JSON.parse(req.body.date).timeEnd,
      },
      time: {
        timeStart: JSON.parse(req.body.time).timeStart,
        timeEnd: JSON.parse(req.body.time).timeEnd,
      },
      description: req.body.description,
      member: JSON.parse(req.body.member),
      taskList: JSON.parse(req.body.taskList),
      images: req.body.images,
      files: req.body.fileDrive,
      createdBy: {
        user_id: id
      },
    });
    await task.save();
    let idsMember = task.member.map(item => item.id);
    // tạo, gửi thông báo
    let noti = {
      user_id_send: id,
      user_id_receiver: idsMember,
      content: `added a new task in the project ${existProject.title}`,
    }
    const notification = new Notification(noti)
    await notification.save();
    // đính kèm thông tin người tạo project
    noti.infoUser = req.user;
    // gửi thông báo đến các member có trong task
    idsMember.forEach(idMember => {
      if (idMember !== id) {
        _io.in(idMember).emit("CREATE TASK", noti)
      }
    });
    // kết thúc gửi thông báo đến các member có trong task

    res.status(200).json({
      messages: "Create task success",
    })
  } catch (error) {
    console.log("check ", error)
    res.status(500).json({
      messages: "Create task failed"
    })
  }
}

// [GET] /tasks
const getTasks = async (req, res) => {
  const { id } = req.user;
  const { statusAction, idProject, keyword } = req.query;
  try {
    let tasks = [];
    let projects = [];
    let projectCurrent = null;
    // lấy ra thông tin của project đang được chọn hiện tại
    if (idProject) {
      projectCurrent = await Project.findOne({
        $and: [
          { _id: idProject },
          { deleted: false },
          {
            $or: [
              { member: { $elemMatch: { id: id } } },
              { leader: { $elemMatch: { id: id } } },
              { client: { $elemMatch: { id: id } } },
              { "createdBy.user_id": id }
            ]
          }
        ]
      })
    }
    // lấy ra các project mà user có tham gia
    projects = await Project.find({
      $and: [
        { deleted: false },
        {
          $or: [
            { member: { $elemMatch: { id: id } } },
            { leader: { $elemMatch: { id: id } } },
            { client: { $elemMatch: { id: id } } }
          ]
        }
      ]
    })
    if (projects.length > 0) {
      const regexStatus = new RegExp(statusAction, 'i')
      const regexSearch = new RegExp(keyword, 'i')
      tasks = await Task.find({
        $and: [
          { deleted: false },
          { project_id: idProject || projects[0].id },
          {
            $or: [
              { member: { $elemMatch: { id: id } } },
              { "createdBy.user_id": id }
            ]
          },
          { status: regexStatus },
          { title: regexSearch },
        ]
      }).sort({ star: "desc", createdAt: "desc", }).lean();
      for (const task of tasks) {
        const infoProject = await Project.findOne({ _id: task.project_id, deleted: false });
        task.infoProject = infoProject
      }
    }
    res.status(200).json({
      tasks: tasks,
      length: tasks.length,
      projects: projects,
      projectCurrent: idProject ? projectCurrent : projects[0] || null
    })
  } catch (err) {
    res.status(500).json({
      messages: "Get task failed"
    })
  }
}

// [PATCH] /task/update
const update = async (req, res) => {
  try {
    const { id } = req.user; // trả về từ middleware xác thực
    const existTask = await Task.findOne({ _id: req.params.id, deleted: false })
    if (!existTask) {
      res.status(404).json({
        messages: "Task not found"
      })
      return
    }
    const permissionUpdate = await Task.findOne({
      _id: req.params.id,
      deleted: false,
      "createdBy.user_id": id
    })
    if (!permissionUpdate) {
      res.status(401).json({
        messages: "Only leaders can update"
      })
      return
    }
    let task = {
      title: req.body.title,
      status: req.body.status,
      severity: req.body.severity,
      project_id: req.body.project_id,
      date: {
        timeStart: JSON.parse(req.body.date).timeStart,
        timeEnd: JSON.parse(req.body.date).timeEnd,
      },
      time: {
        timeStart: JSON.parse(req.body.time).timeStart,
        timeEnd: JSON.parse(req.body.time).timeEnd,
      },
      description: req.body.description,
      member: JSON.parse(req.body.member),
      taskList: JSON.parse(req.body.taskList),
      images: req.body.images ?
        (JSON.parse(req.body.imagesOld) ? JSON.parse(req.body.imagesOld) : []).concat(req.body.images)
        : (JSON.parse(req.body.imagesOld) ? JSON.parse(req.body.imagesOld) : []),
      files: req.body.fileDrive ?
        (JSON.parse(req.body.filesOld) ? JSON.parse(req.body.filesOld) : []).concat(req.body.fileDrive)
        : (JSON.parse(req.body.filesOld) ? JSON.parse(req.body.filesOld) : []),
      createdBy: {
        user_id: id
      },
    }
    const newTask = await Task.updateOne({ _id: req.params.id }, task)

    let idsMemberNew = task.member.map(item => item.id); // các member sẽ có trong project sau khi tạo
    let idsMemberRemoveTask = existTask.member.filter(item => !idsMemberNew.includes(item.id)); // các member sẽ có trong project sau khi tạo

    // tạo, gửi thông báo cho member trong task
    let noti = {
      user_id_send: id,
      user_id_receiver: idsMemberNew,
      content: `updated the mission ${existTask.title}`,
    }
    const notification = new Notification(noti);
    await notification.save();
    // đính kèm thông tin người tạo project
    noti.infoUser = req.user;
    // gửi thông báo đến các member có trong task
    idsMemberNew.forEach(idMember => {
      if (idMember !== id) {
        _io.in(idMember).emit("UPDATE TASK", noti)
      }
    });
    // kết thúc gửi thông báo đến các member có trong task
    // tạo, gửi thông báo cho member trong task
    let noti2 = {
      user_id_send: id,
      user_id_receiver: idsMemberRemoveTask,
      content: `removes you from the mission ${existTask.title}`,
    }
    const notification2 = new Notification(noti2);
    await notification2.save();
    // đính kèm thông tin người tạo project
    noti2.infoUser = req.user;
    // gửi thông báo đến các member có trong task
    idsMemberRemoveTask.forEach(idMember => {
      if (idMember !== id) {
        _io.in(idMember).emit("UPDATE TASK", noti2);
      }
    });
    // kết thúc gửi thông báo đến các member có trong task

    res.status(200).json({
      messages: "Update task success",
      data: newTask
    })
  } catch (error) {
    console.log("check ", error)
    res.status(500).json({
      messages: "Update task failed"
    })
  }
}

// [GET] /task/:id
const taskDetail = async (req, res) => {
  try {
    const { id } = req.user; // trả về từ middleware xác thực
    const existTask = await Task.findOne({ _id: req.params.id, deleted: false })
    if (!existTask) {
      res.status(404).json({
        messages: "Task not found"
      })
      return
    }
    let task = await Task.findOne({
      $and: [
        { _id: req.params.id },
        {
          deleted: false,
        },
        {
          $or: [
            { "createdBy.user_id": id },
            { member: { $elemMatch: { id: id } } },
          ]
        }
      ]
    }).lean()
    if (!task) {
      res.status(401).json({
        messages: "Only members and leaders have the right to view"
      })
      return
    }
    // lấy thông tin project của task
    const infoProject = await Project.findOne({ _id: task.project_id });
    task.infoProject = infoProject

    res.status(200).json({
      data: task
    })
  } catch (error) {
    res.status(500).json({
      messages: "Get task failed"
    })
  }
}

// [DELETE] /task/:id
const deleteTask = async (req, res) => {
  try {
    const { id } = req.user;
    const existTask = await Task.findOne({ _id: req.params.id, deleted: false })
    if (!existTask) {
      res.status(404).json({
        messages: "Task not found"
      })
      return;
    }
    const permission = await Task.findOne({
      $and: [
        { _id: req.params.id },
        { deleted: false },
        { "createdBy.user_id": req.user.id }
      ]
    })
    if (!permission) {
      res.status(401).json({
        messages: "Only the leader can edit"
      })
      return
    }
    await Task.updateOne({ _id: req.params.id }, { deleted: true })

    // tạo, gửi thông báo
    let idsMember = existTask.member.map(item => item.id);
    let noti = {
      user_id_send: id,
      user_id_receiver: idsMember,
      content: `deleted the quest ${existTask.title}`,
    }
    const notification = new Notification(noti)
    await notification.save();
    // đính kèm thông tin người tạo project
    noti.infoUser = req.user;
    // gửi thông báo đến các member có trong task
    idsMember.forEach(idMember => {
      if (idMember !== id) {
        _io.in(idMember).emit("DELETE TASK", noti);
      }
    });
    // kết thúc gửi thông báo đến các member có trong task

    res.status(200).json({
      messages: "Delete task success"
    })
  } catch (error) {
    console.log("check ", error);
    res.status(500).json({
      messages: "Delete task failed"
    })
  }
}

// [PATCH] /task/change-star/:id
const changeStar = async (req, res) => {
  try {
    const { id } = req.user;
    const existTask = await Task.findOne({ _id: req.params.id, deleted: false })
    if (!existTask) {
      res.status(404).json({
        messages: "Task not found"
      })
      return
    }
    const permission = await Task.findOne({
      $and: [
        { _id: req.params.id },
        { deleted: false },
        { "createdBy.user_id": req.user.id }
      ]
    })
    if (!permission) {
      res.status(401).json({
        messages: "Only the leader can edit"
      })
      return
    }
    await Task.updateOne({ _id: req.params.id, deleted: false }, req.body)

    // tạo, gửi thông báo
    let idsMember = existTask.member.map(item => item.id);
    let noti = {
      user_id_send: id,
      user_id_receiver: idsMember,
      content: `changed the star of the mission ${existTask.title}`,
    }
    const notification = new Notification(noti)
    await notification.save();
    // đính kèm thông tin người tạo project
    noti.infoUser = req.user;
    // gửi thông báo đến các member có trong task
    idsMember.forEach(idMember => {
      if (idMember !== id) {
        _io.in(idMember).emit("UPDATE TASK", noti);
      }
    });
    // kết thúc gửi thông báo đến các member có trong task

    res.status(200).json({
      messages: "Change star task success"
    })
  } catch (error) {
    res.status(500).json({
      messages: "Task change star failed"
    })
  }
}

module.exports = {
  create,
  getTasks,
  taskDetail,
  update,
  deleteTask,
  changeStar
}