const mongoose = require("mongoose");

const projectSchema = mongoose.Schema({
  title: { type: String },
  star: { type: Number, default: 0 },
  status: { type: String, default: "going" },
  date: {
    timeStart: { type: String },
    timeEnd: { type: String },
  },
  description: { type: String, default: "" },
  client: [{
    id: { type: String },
    email: { type: String }
  }],
  leader: [{
    id: { type: String },
    email: { type: String }
  }],
  member: [{
    id: { type: String },
    email: { type: String }
  }],
  keyProject: { type: String },
  createdBy: {
    user_id: { type: String }
  },
  deleted: { type: Boolean, default: false }
}, {
  timestamps: true
})

const Project = mongoose.model("Project", projectSchema)
module.exports = Project;