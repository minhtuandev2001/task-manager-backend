
// [POST] /project/create

const Project = require("../models/project.mode")

const create = async (req, res) => {
  try {
    const project = new Project(req.body);
    await project.save();
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
    }).sort({ createdAt: "desc" });
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
  try {
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
    res.status(500).json({
      messages: "Update project failed"
    })
  }
}

module.exports = {
  create,
  getProject,
  update
}