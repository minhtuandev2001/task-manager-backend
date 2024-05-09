const mongoose = require("mongoose");

const projectSchema = mongoose.Schema({
  title: { type: String, require: true },
  star: { type: Number, default: 0 },
  status: { type: String, default: "going" },
  date: {
    timeStart: { type: String, require: true },
    timeEnd: { type: String, require: true },
  },
  description: { type: String },
  client: [{
    id: { type: String, require: true },
    email: { type: String, require: true }
  }],
  leader: [{
    id: { type: String, require: true },
    email: { type: String, require: true }
  }],
  member: [{
    id: { type: String, require: true },
    email: { type: String, require: true }
  }],
}, {
  timestaps: true
})

const Project = mongoose.model("Project", projectSchema)
module.exports = Project;