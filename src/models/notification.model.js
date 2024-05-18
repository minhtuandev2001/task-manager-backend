const mongoose = require("mongoose");

const notificationSchema = mongoose.Schema({
  user_id_send: String,
  user_id_receiver: String,
  content: String,
  read: { type: Boolean, default: false },
  deleted: { type: Boolean, default: false }
}, {
  timestamps: true
})

const Notification = mongoose.model("Notification", notificationSchema);
module.exports = Notification;