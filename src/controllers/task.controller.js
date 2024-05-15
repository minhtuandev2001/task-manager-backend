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
    res.status(200).json({
      messages: "Create task success",
      data: task
    })

  } catch (error) {
    console.log("check ", error)
    res.status(500).json({
      messages: "Create task failed"
    })
  }
}

// [GET] /task
const getTask = async (req, res) => {
  const { id } = req.user;
  const { statusAction, idProjects } = req.query;
  try {
    let tasks = [];
    let projects = [];
    let projectSelected = null;
    // lấy ra thông tin của project đang được chọn hiện tại
    if (idProjects) {
      projectSelected = await Project.findOne({
        $and: [
          { _id: idProjects },
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
    // console.log("check ", idProjects)
    // console.log("check ", projects)
    // console.log("check ", projects[0].id)
    if (projects.length > 0) {
      const regexStatus = new RegExp(statusAction, 'i')
      tasks = await Task.find({
        $and: [
          { deleted: false },
          { project_id: idProjects || projects[0].id },
          {
            $or: [
              { member: { $elemMatch: { id: id } } },
              { "createdBy.user_id": id }
            ]
          },
          { status: regexStatus },
        ]
      }).lean()
      for (const task of tasks) {
        const infoProject = await Project.findOne({ _id: task.project_id, deleted: false });
        task.infoProject = infoProject
      }
    }
    res.status(200).json({
      tasks: tasks,
      length: tasks.length,
      projects: projects,
      ProjectSelected: idProjects ? projectSelected : projects[0] || null
    })
  } catch (err) {
    console.log("check ", err)
    res.status(500).json({
      messages: "Get task failed"
    })
  }
}
module.exports = {
  create,
  getTask
}