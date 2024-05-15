const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema({
  id: String,
  email: String
}, { _id: false });
const taskItemSchema = new mongoose.Schema({
  id: String,
  content: String,
  checked: Boolean
}, { _id: false });

const taskSchema = mongoose.Schema({
  title: String,
  status: { type: String, default: "going" },
  severity: { type: String, default: "low" },
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
  member: [memberSchema],
  taskList: [taskItemSchema],
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