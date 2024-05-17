const mongoose = require("mongoose");

const friendItemSchema = new mongoose.Schema({
  user_id: String,
  room_chat_id: String
}, { _id: false });

const userSchema = mongoose.Schema({
  username: String,
  avatar: { type: String, default: "https://imgs.search.brave.com/y6QHHONCysvl1MYmkoGLFPAgGiPsfY-jdtben0wIZWA/rs:fit:860:0:0/g:ce/aHR0cHM6Ly9zZWN1/cmUuZ3JhdmF0YXIu/Y29tL2F2YXRhci8x/NjVkMTg0ODdlM2Fh/MjE0MzM1ZjFjYjIy/ZDBlMzkxMz9zPTYw/MCZkPW1tJnI9Zw" },
  email: String,
  password: String,
  phone: String,
  status: {
    type: String,
    default: "active"
  },
  acceptFriends: Array,
  requestFriends: Array,
  friendsList: [friendItemSchema],
  statusOnline: String,
  deleted: { type: Boolean, default: false }
}, {
  timestamps: true
})

const User = mongoose.model("User", userSchema);
module.exports = User;