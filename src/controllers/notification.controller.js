const Notification = require("../models/notification.model");
const User = require("../models/user.model");

// [GET] /notification
const getNotification = async (req, res) => {
  try {
    const { id } = req.user;
    const notifications = await Notification.find({
      user_id_receiver: id,
      deleted: false
    }).sort({ createdAt: "desc" }).lean();
    for (const noti of notifications) {
      const infoUser = await User.findOne({ _id: noti.user_id_send, deleted: false }).select("-password")
      noti.infoUser = infoUser
    }
    res.status(200).json({
      messages: "Get notification success",
      data: notifications
    })
  } catch (error) {
    res.status(500).json({
      messages: "Get notification error"
    })
  }
}

module.exports = {
  getNotification
}