const mongoose = require("mongoose");

const chatShema = mongoose.Schema({
  chatName: String,
  isGroupChat: { type: Boolean, default: false },
  users: Array,
  latestMessageId: String,
  groupAdmin: Array,
  createdBy: {
    user_id: String
  },
  deleted: { type: Boolean, default: false },
}, {
  timestamps: true,
})
const Chat = mongoose.model("Chat", chatShema);
module.exports = Chat