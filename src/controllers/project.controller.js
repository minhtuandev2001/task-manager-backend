
// [POST] /project/create

const Project = require("../models/project.mode")

const create = async (req, res) => {
  try {
    const project = new Project(req.body);
    await project.save();
    res.status(200).json({
      messages: "Create project success"
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
          ]
        }
      ]
    });
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

module.exports = {
  create,
  getProject
}