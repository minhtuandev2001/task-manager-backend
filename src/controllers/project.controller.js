
// [POST] /project/create

const Chat = require("../models/chat.model");
const Project = require("../models/project.mode");
const checkIsObjectId = require("../utiliti/checkId.JS");

const create = async (req, res) => {
  try {
    const { id } = req.user;
    const { client, leader, member } = req.body;
    const project = new Project(req.body);
    await project.save();
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

    const chat = new Chat({
      chatName: req.body.title,
      isGroupChat: true,
      users: uniqueArray,
      groupAdmin: [id, leader],
      createdBy: { user_id: id }
    })
    await chat.save();
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
  console.log("check ", req.params.id)
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
    await Project.updateOne({ _id: req.params.id }, req.body);
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
            { client: { $elemMatch: { id: id } } },
            { leader: { $elemMatch: { id: id } } },
            { member: { $elemMatch: { id: id } } }
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
module.exports = {
  create,
  getProject,
  update,
  changeStarProject,
  doneProject,
  detailProject,
  deleteProject,
  getUserInProject
}