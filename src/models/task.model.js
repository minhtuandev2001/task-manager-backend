const mongoose = require("mongoose");

const taskSchema = mongoose.Schema({
  title: String,
  status: String,
  severity: String,
  project_id: String,
  date: {
    timeStart: String,
    timeEnd: String,
  },
  time: {
    timeStart: String,
    timeEnd: String,
  },
  description: String,
  member: [{
    id: String,
    email: String
  }],
  taskList: [{
    id: String,
    content: String,
    checked: Boolean
  }],
  images: Array,
  files: Array,
  createdBy: {
    user_id: { type: String }
  },
  star: { type: Number, default: 0 },
  deleted: { type: Boolean, default: false }
}, {
  timestamps: true
})

const Task = mongoose.model("Task", taskSchema)
module.exports = Task;