const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema({
  id: String,
  email: String
}, { _id: false });

const leaderSchema = new mongoose.Schema({
  id: String,
  email: String
}, { _id: false });

const memberSchema = new mongoose.Schema({
  id: String,
  email: String
}, { _id: false });

const projectSchema = mongoose.Schema({
  title: { type: String },
  star: { type: Number, default: 0 },
  status: { type: String, default: "going" },
  date: {
    timeStart: { type: String },
    timeEnd: { type: String },
  },
  description: { type: String, default: "" },
  client: [clientSchema],
  leader: [leaderSchema],
  member: [memberSchema],
  room_chat_id: String,
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