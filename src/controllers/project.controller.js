
// [POST] /project/create

const Chat = require("../models/chat.model");
const Notification = require("../models/notification.model");
const Project = require("../models/project.mode");
const User = require("../models/user.model");
const checkIsObjectId = require("../utiliti/checkId.JS");

const create = async (req, res) => {
  try {
    const { id } = req.user;
    const { client, leader, member } = req.body;
    // tạo nhóm chat cho project
    // lấy id của thành viên
    let combineArray = client.concat(leader, member);
    // lọc những user bị trùng
    let uniqueMap = new Map();
    combineArray.forEach((item) => {
      if (!uniqueMap.has(item.id)) {
        uniqueMap.set(item.id, item.id)
      }
    })
    // Chuyển đổi Map trở lại thành mảng các đối tượng
    let uniqueArray = Array.from(uniqueMap.values());

    const newChat = new Chat({
      chatName: req.body.title,
      isGroupChat: true,
      users: uniqueArray,
      groupAdmin: [id, leader],
      createdBy: { user_id: id }
    })
    await newChat.save();

    // tạo project
    req.body.room_chat_id = newChat.id;
    console.log("check ", newChat.id)
    const project = new Project(req.body);
    await project.save();
    // end tạo project

    await User.updateMany({ _id: { $in: uniqueArray } }, {
      $push: {
        rooms: {
          $each: [newChat.id],
          $position: 0,
        }
      }
    })
    // lấy về thông tin chat dầy đủ 
    // lấy thông tin của các member trong nhóm chat
    const chat = await Chat.findOne({ _id: newChat.id }).lean();
    const infoUsers = await User.find({ _id: { $in: newChat.users } }).select("username avatar statusOnline").lean();
    chat.infoUsers = infoUsers;
    // kết thúc lấy về thông tin chat dầy đủ 
    // kết thúc tạo nhóm chat cho project

    // tạo, gửi thông báo
    let noti = {
      user_id_send: id,
      user_id_receiver: uniqueArray,
      content: "Added you to a project",
    }
    const notification = new Notification(noti)
    await notification.save();
    // đính kèm thông tin người tạo project
    noti.infoUser = req.user;

    uniqueArray.forEach((IDmember) => {
      // gửi đến các client là member trong projetc 
      _io.in(IDmember).emit("CREATE PROJECT", project,
        noti,
        chat
      );
    })
    // kết thúc tạo, gửi thông báo

    res.status(200).json({
      messages: "Create project success",
      data: project
    })
  } catch (error) {
    console.log("check ", error)
    res.status(500).json({
      messages: "Create project failed"
    })
  }
}

// [GET] /project
const getProject = async (req, res) => {
  const { id } = req.user // trả về từ việc xác thực authMiddleware
  const { keyword } = req.query;
  try {
    const regex = new RegExp(keyword, "i")
    const projects = await Project.find({
      $and: [
        { deleted: false },
        { title: regex },
        {
          $or: [
            { client: { $elemMatch: { id: id } } },
            { leader: { $elemMatch: { id: id } } },
            { member: { $elemMatch: { id: id } } },
            { "createdBy.user_id": id },
          ]
        }
      ]
    }).sort({ star: "desc", createdAt: "desc", });
    res.status(200).json({
      data: projects,
      length: projects.length
    })
  } catch (error) {
    console.log("check ", error)
    res.status(500).json({
      messages: "Create project failed"
    })
  }
}

// [POST] /project/update/:id
const update = async (req, res) => {
  const { id } = req.user // lấy từ middleware auth
  const { client, leader, member } = req.body;
  try {
    if (!checkIsObjectId(req.params.id)) {
      res.status(400).json({
        messages: "Id project error"
      })
      return
    }
    const checkProject = await Project.findOne({ _id: req.params.id })
    if (!checkProject) {
      res.status(404).json({
        messages: "Project not found"
      })
      return
    }
    // check quyền update cho createdBy, leader
    const project = await Project.findOne({
      $and: [
        { _id: req.params.id },
        {
          $or: [
            { "createdBy.user_id": id },
            { leader: { $elemMatch: { id: id } } }
          ]
        }
      ]
    })
    if (!project) {
      res.status(401).json({
        messages: "Only leaders and creators can edit"
      })
      return
    }
    // update 
    await Project.updateOne({ _id: req.params.id }, req.body);

    // Cập nhật thông tin cho những người còn tồn tại trong project 
    // lấy id của thành viên được update
    let combineArray = client.concat(leader, member);
    // lọc những user bị trùng
    let uniqueMap = new Map();
    combineArray.forEach((item) => {
      if (!uniqueMap.has(item.id)) {
        uniqueMap.set(item.id, item.id)
      }
    })
    // Chuyển đổi Map trở lại thành mảng các đối tượng
    let uniqueArray = Array.from(uniqueMap.values());

    // tạo, gửi thông báo
    let noti = {
      user_id_send: id,
      user_id_receiver: uniqueArray,
      content: `updated the project ${req.body.title}`,
    }
    const notification = new Notification(noti)
    await notification.save();
    // đính kèm thông tin người tạo project
    noti.infoUser = req.user;
    // thêm room chat cho những người mới được thêm vào project
    await User.updateMany({ _id: { $in: uniqueArray } }, {
      $addToSet: { rooms: project.room_chat_id }
    })
    uniqueArray.forEach((IDmember) => {
      // gửi đến các client là member trong projetc 
      _io.in(IDmember).emit("UPDATE PROJECT", noti);
    })
    // kết thúc tạo, gửi thông báo
    // kết thúc cập nhật thông tin cho những người còn tồn tại trong project 

    // Cập nhật thông tin cho những người bị loại khỏi project tồn tại trong project 
    // lấy id của thành viên
    let combineArray2 = project.client.concat(project.leader, project.member);
    // lọc những user bị trùng
    let uniqueMap2 = new Map();
    combineArray2.forEach((item) => {
      if (!uniqueMap2.has(item.id)) {
        uniqueMap2.set(item.id, item.id);
      }
    })
    // Chuyển đổi Map trở lại thành mảng các đối tượng
    let uniqueArray2 = Array.from(uniqueMap2.values());

    // tạo, gửi thông báo
    let noti2 = {
      user_id_send: id,
      user_id_receiver: uniqueArray2,
      content: `removed you from the project ${req.body.title}`,
    }
    const notification2 = new Notification(noti2);
    await notification2.save();
    // đính kèm thông tin người tạo project
    noti.infoUser = req.user;
    // chỉ lấy nhưng id của user bị loại , gửi thong báo cho người bị loại
    uniqueArray2 = uniqueArray2.filter(item => !uniqueArray.includes(item));
    console.log("check ", uniqueArray2);
    // xóa room chat của những người bị loại bỏ
    await User.updateMany({ _id: { $in: uniqueArray2 } }, {
      $pull: { rooms: project.room_chat_id }
    })
    uniqueArray2.forEach((IDmember) => {
      // gửi đến các client là bị xóa khỏi project
      _io.in(IDmember).emit("UPDATE PROJECT", noti);
    })
    // kết thúc tạo, gửi thông báo
    // kết thúc cập nhật thông tin cho những người bị loại khỏi project tồn tại trong project 

    res.status(200).json({
      messages: 'Project update success',
    })

  } catch (error) {
    console.log("check ", error)
    res.status(500).json({
      messages: "Update project failed"
    })
  }
}

// [PATCH] /project/change-star/:id
const changeStarProject = async (req, res) => {
  const { id } = req.user;
  try {
    if (!checkIsObjectId(req.params.id)) {
      res.status(400).json({
        messages: "Id project error"
      })
      return
    }
    const checkUserHasPermissionInProject = await Project.findOne({
      $and: [
        { _id: req.params.id },
        {
          $or: [
            { "createdBy.user_id": id },
            { leader: { $elemMatch: { id: id } } }
          ]
        }
      ]
    })
    if (!checkUserHasPermissionInProject) {
      res.status(401).json({
        messages: "Only leaders and creators can edit"
      })
      return
    }
    await Project.updateOne({ _id: req.params.id }, req.body)

    // lấy id của thành viên
    let combineArray = checkUserHasPermissionInProject.client.concat(checkUserHasPermissionInProject.leader, checkUserHasPermissionInProject.member);
    // lọc những user bị trùng
    let uniqueMap = new Map();
    combineArray.forEach((item) => {
      if (!uniqueMap.has(item.id)) {
        uniqueMap.set(item.id, item.id)
      }
    })
    // Chuyển đổi Map trở lại thành mảng các đối tượng
    let uniqueArray = Array.from(uniqueMap.values());

    // tạo, gửi thông báo
    let noti = {
      user_id_send: id,
      user_id_receiver: uniqueArray,
      content: `updated star the project ${checkUserHasPermissionInProject.title}`,
    }
    const notification = new Notification(noti)
    await notification.save();
    // đính kèm thông tin người tạo project
    noti.infoUser = req.user;

    uniqueArray.forEach((IDmember) => {
      // gửi đến các client là member trong projetc 
      _io.in(IDmember).emit("UPDATE STAR", noti);
    })
    // kết thúc tạo, gửi thông báo

    res.status(200).json({
      messages: "Star project success"
    })
  } catch (error) {
    res.status(500).json({
      messages: "Change star project failed"
    })
  }

}
// [PATCH] /project/done-project/:id
const doneProject = async (req, res) => {
  const { id } = req.user;
  try {
    if (!checkIsObjectId(req.params.id)) {
      res.status(400).json({
        messages: "Id project error"
      })
      return
    }
    const checkUserHasPermissionInProject = await Project.findOne({
      $and: [
        { _id: req.params.id },
        {
          $or: [
            { "createdBy.user_id": id },
            { leader: { $elemMatch: { id: id } } }
          ]
        }
      ]
    })
    if (!checkUserHasPermissionInProject) {
      res.status(401).json({
        messages: "Only leaders and creators can edit"
      })
      return
    }
    // lấy id của thành viên
    let combineArray = checkUserHasPermissionInProject.client.concat(checkUserHasPermissionInProject.leader, checkUserHasPermissionInProject.member);
    // lọc những user bị trùng
    let uniqueMap = new Map();
    combineArray.forEach((item) => {
      if (!uniqueMap.has(item.id)) {
        uniqueMap.set(item.id, item.id)
      }
    })
    // Chuyển đổi Map trở lại thành mảng các đối tượng
    let uniqueArray = Array.from(uniqueMap.values());

    // tạo, gửi thông báo
    let noti = {
      user_id_send: id,
      user_id_receiver: uniqueArray,
      content: `marked the project ${checkUserHasPermissionInProject.title} completed`,
    }
    const notification = new Notification(noti)
    await notification.save();
    // đính kèm thông tin người tạo project
    noti.infoUser = req.user;

    uniqueArray.forEach((IDmember) => {
      // gửi đến các client là member trong projetc 
      _io.in(IDmember).emit("DONE PROJECT", noti);
    })
    // kết thúc tạo, gửi thông báo
    await Project.updateOne({ _id: req.params.id }, req.body)
    res.status(200).json({
      messages: "Done project success"
    })
  } catch (error) {
    res.status(500).json({
      messages: "Done project failed"
    })
  }
}

// [GET] /project/detail/:id
const detailProject = async (req, res) => {
  const { id } = req.user // trả về từ việc xác thực authMiddleware
  try {
    const Existproject = await Project.findOne({ _id: req.params.id, deleted: false });
    if (!Existproject) {
      res.status(404).json({
        messages: "Project not found"
      })
      return
    }
    const project = await Project.findOne({
      $and: [
        { _id: req.params.id },
        { deleted: false },
        {
          $or: [
            { "createdBy.user_id": id },
            { leader: { $elemMatch: { id: id } } },
          ]
        }
      ]
    });
    if (!project) {
      res.status(401).json({
        messages: "You do not have access"
      })
      return
    }
    res.status(200).json({
      data: project,
    })
  } catch (error) {
    console.log("check ", error)
    res.status(500).json({
      messages: "get detail project failed"
    })
  }
}

// [PATCH] /project/delete/:id
const deleteProject = async (req, res) => {
  const { id } = req.user // trả về từ việc xác thực authMiddleware
  try {
    const Existproject = await Project.findOne({ _id: req.params.id, deleted: false });
    if (!Existproject) {
      res.status(404).json({
        messages: "Project not found"
      })
      return
    }
    const project = await Project.findOne({
      $and: [
        { _id: req.params.id },
        { deleted: false },
        {
          $or: [
            { "createdBy.user_id": id },
            { leader: { $elemMatch: { id: id } } },
          ]
        }
      ]
    });
    if (!project) {
      res.status(401).json({
        messages: "Only leaders and creators can"
      })
      return
    }
    await Project.updateOne({ _id: req.params.id }, {
      deleted: true
    })

    // lấy id của thành viên
    let combineArray = project.client.concat(project.leader, project.member);
    // lọc những user bị trùng
    let uniqueMap = new Map();
    combineArray.forEach((item) => {
      if (!uniqueMap.has(item.id)) {
        uniqueMap.set(item.id, item.id)
      }
    })
    // Chuyển đổi Map trở lại thành mảng các đối tượng
    let uniqueArray = Array.from(uniqueMap.values());

    // tạo, gửi thông báo
    let noti = {
      user_id_send: id,
      user_id_receiver: uniqueArray,
      content: `Project deleted ${project.title}`,
    }
    const notification = new Notification(noti)
    await notification.save();
    // đính kèm thông tin người tạo project
    noti.infoUser = req.user;
    await User.updateMany({ _id: { $in: uniqueArray } }, {
      $pull: { rooms: project.room_chat_id }
    })
    uniqueArray.forEach((IDmember) => {
      // gửi đến các client là member trong projetc 
      _io.in(IDmember).emit("DELETE PROJECT", noti);
    })
    // kết thúc tạo, gửi thông báo

    res.status(200).json({
      messages: "Delete project success"
    })
  } catch (error) {
    console.log("check ", error)
    res.status(500).json({
      messages: "delete project failed"
    })
  }
}

// [GET] /project/idProject?keyword=search
const getUserInProject = async (req, res) => {
  try {
    const { keyword } = req.query
    const projectExits = await Project.findOne({ _id: req.params.id, deleted: false })
    if (!projectExits) {
      res.status(404).json({
        messages: "Project not found",
      })
      return;
    }
    let combinedArray = projectExits.member.concat(projectExits.client, projectExits.leader);
    // Sử dụng Map để loại bỏ các phần tử trùng lặp dựa trên id
    let uniqueMap = new Map();
    combinedArray.forEach(item => {
      if (!uniqueMap.has(item.id)) {
        uniqueMap.set(item.id, item);
      }
    });
    // Chuyển đổi Map trở lại thành mảng các đối tượng
    let uniqueArray = Array.from(uniqueMap.values());
    let user = uniqueArray.filter((item) => { if (item.email.includes(keyword)) return item })

    res.status(200).json({
      data: user
    })
  } catch (error) {
    console.log("check ", error)
    res.status(500).json({
      messages: "Get user in project error"
    })
  }
}

// [PATCH] /project/join
const joinProject = async (req, res) => {
  try {
    const { id, email } = req.user
    const { key } = req.body;
    const project = await Project.findOne({ keyProject: key, deleted: false });
    if (!project) {
      res.status(404).json({
        messages: "Projejct not found"
      })
      return;
    }
    await Project.updateOne({ _id: project.id }, {
      $addToSet: {
        member: {
          id: id,
          email: email
        }
      }
    })
    // thêm thông tin của user mới vào phần member
    project.member.push({
      id: id,
      email: email
    })
    res.status(200).json({
      messages: "Join project success",
      data: project
    })
  } catch (error) {
    res.status(500).json({
      messages: "Join project failed"
    })
  }
}
module.exports = {
  create,
  getProject,
  update,
  changeStarProject,
  doneProject,
  detailProject,
  deleteProject,
  getUserInProject,
  joinProject
}