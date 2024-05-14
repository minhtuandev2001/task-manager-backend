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
      severty: req.body.severity,
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
      images: req.body.fileDrive,
      files: req.body.images,
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

module.exports = {
  create
}