const mongoose = require("mongoose");

const messageSchema = mongoose.Schema({
  sender: String,
  content: String,
  room_chat_id: String,
  images: Array,
  files: Array,
  usersRead: Array,
  deleted: { type: Boolean, default: false }
}, {
  timestamps: true,
})

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;