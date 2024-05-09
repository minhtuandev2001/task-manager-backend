
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

module.exports = {
  create
}