const { v4: uuidv4 } = require("uuid");
const User = require("../models/user.model");
const Notification = require("../models/notification.model");
const Chat = require("../models/chat.model");

// [GET] /users?keyword={keyword}
const getUser = async (req, res) => {
  const { keyword, limit } = req.query;
  let users = []
  try {
    const regex = new RegExp(keyword, "i");
    let query = {};

    switch (req.query.statusFriend) {
      case "friends":
        query = {
          $and: [
            { _id: { $ne: req.user.id } },
            { _id: { $nin: req.user.acceptFriends } },
            { _id: { $nin: req.user.requestFriends } },
            { _id: { $nin: req.user.friendsList } },
            {
              $or: [
                { username: regex },
                { email: regex }
              ]
            },
            { deleted: false },
            { status: "active" },
          ]
        }
        break;
      case "myfriends":
        query = {
          $and: [
            { _id: { $in: req.user.friendsList } },
            {
              $or: [
                { username: regex },
                { email: regex }
              ]
            },
            { deleted: false },
            { status: "active" },
          ]
        }
        break;
      case "request":
        query = {
          $and: [
            { _id: { $in: req.user.requestFriends } },
            {
              $or: [
                { username: regex },
                { email: regex }
              ]
            },
            { deleted: false },
            { status: "active" },
          ]
        }
        break;
      case "accept":
        query = {
          $and: [
            { _id: { $in: req.user.acceptFriends } },
            {
              $or: [
                { username: regex },
                { email: regex }
              ]
            },
            { deleted: false },
            { status: "active" },
          ]
        }
        break;

      default:
        break;
    }

    users = await User.find(query).limit(limit || 5).select("-password")
    res.status(200).json({
      data: users
    })
  } catch (error) {
    console.log("check ", error)
    res.status(500).json({
      messages: "Server error"
    })
  }
}

// [GET] /users/request-friend/:id
const requestAddFriend = async (req, res) => {
  try {
    const { id } = req.user;
    if (id === req.params.id) {
      res.status(400).json({
        messages: "You can't make friends with yourself"
      })
      return
    }
    const userExist = await User.findOne({ _id: req.params.id, deleted: false })
    if (!userExist) {
      res.status(404).json({
        messages: "User not found"
      })
      return
    }
    // A gửi lời mời
    // thêm id của B vào requestList của A
    // thêm id của A vào acceptList của B
    await User.updateOne({ _id: id }, {
      $addToSet: { requestFriends: req.params.id }
    })
    await User.updateOne({ _id: req.params.id }, {
      $addToSet: { acceptFriends: id }
    })
    // tạo thông báo 
    let noti = {
      user_id_send: id,
      user_id_receiver: [req.params.id],
      content: "has sent you a friend request",
    }
    const notification = new Notification(noti)
    await notification.save();
    // gửi data realTime 
    noti.infoUser = req.user
    _io.in(req.params.id).emit("CLIENT_ADD_FRIEND", noti)
    res.status(200).json({
      messages: "Sent friend request successfully"
    })
  } catch (error) {
    res.status(500).json({
      messages: "Add friend failed"
    })
  }
}

// [GET] /users/cancel-request-friend/:id
const cancelRequestAddFriend = async (req, res) => {
  try {
    const { id } = req.user;
    const userExist = await User.findOne({ _id: req.params.id, deleted: false })
    if (!userExist) {
      res.status(404).json({
        messages: "User not found"
      })
      return
    }
    // A hủy lời mời
    // loại bỏ id của B khỏi requestList của A
    // loại bỏ id của A khỏi acceptList của B
    await User.updateOne({ _id: id }, {
      $pull: { requestFriends: req.params.id }
    })
    await User.updateOne({ _id: req.params.id }, {
      $pull: { acceptFriends: id }
    })
    res.status(200).json({
      messages: "Successfully canceled friend request"
    })
  } catch (error) {
    res.status(500).json({
      messages: "Add friend failed"
    })
  }
}

// [GET] /users/not-accept-friend/:id
const notAcceptFriend = async (req, res) => {
  try {
    const { id } = req.user;
    if (id === req.params.id) {
      res.status(400).json({
        messages: "You cannot unfriend yourself"
      })
      return
    }
    const userExist = await User.findOne({ _id: req.params.id, deleted: false })
    if (!userExist) {
      res.status(404).json({
        messages: "User not found"
      })
      return
    }
    // B từ chối kết bạn
    // loại bỏ id của A khỏi acceptList của B
    // loại bỏ id của B khỏi requestList của A
    await User.updateOne({ _id: id }, {
      $pull: { acceptFriends: req.params.id }
    })
    await User.updateOne({ _id: req.params.id }, {
      $pull: { requestFriends: id }
    })
    res.status(200).json({
      messages: "Successfully canceled friend request"
    })
  } catch (error) {
    res.status(500).json({
      messages: "Add friend failed"
    })
  }
}

// [GET] /users/accept-friend/:id
const acceptFriend = async (req, res) => {
  try {
    const { id } = req.user;
    if (id === req.params.id) {
      res.status(400).json({
        messages: "You can't make friends with yourself"
      })
      return
    }
    const userExist = await User.findOne({ _id: req.params.id, deleted: false }).select("-password")
    if (!userExist) {
      res.status(404).json({
        messages: "User not found"
      })
      return
    }
    // Chấp nhận kết bạn
    // loại bỏ id của A khỏi acceptList của B
    // loại bỏ id của B khỏi requestList của A
    await User.updateOne({ _id: id }, {
      $pull: { acceptFriends: req.params.id }
    })
    await User.updateOne({ _id: req.params.id }, {
      $pull: { requestFriends: id }
    })

    // tạo phòng chat
    const chatRoom = new Chat({
      users: [req.params.id, id]
    });
    await chatRoom.save();

    console.log("check ", chatRoom)
    console.log("check ", chatRoom._id)

    await User.updateOne({ _id: id }, {
      $addToSet: {
        friendsList: req.params.id
      },
      $push: {
        rooms: {
          $each: [chatRoom.id],
          $position: 0
        }
      }
    })
    await User.updateOne({ _id: req.params.id }, {
      $addToSet: {
        friendsList: id
      },
      $push: {
        rooms: {
          $each: [chatRoom.id],
          $position: 0
        }
      }
    })
    // tạo thông báo 
    let noti = {
      user_id_send: id,
      user_id_receiver: [req.params.id],
      content: "has accepted your friend request",
    }
    const notification = new Notification(noti)
    await notification.save();
    noti.infoUser = req.user
    _io.in(req.params.id).emit("CLIENT_ACCEPT_FRIEND", noti)
    res.status(200).json({
      messages: "Make friends successfully"
    })
  } catch (error) {
    console.log("check ", error)
    res.status(500).json({
      messages: "Add friend failed"
    })
  }
}

// [GET] /users/delete-friend/:id
const deleteFriend = async (req, res) => {
  try {
    const { id } = req.user;
    if (id === req.params.id) {
      res.status(400).json({
        messages: "You cannot unfriend yourself"
      })
      return
    }
    const userExist = await User.findOne({ _id: req.params.id, deleted: false })
    if (!userExist) {
      res.status(404).json({
        messages: "User not found"
      })
      return
    }
    // xóa kết bạn
    // loại bỏ id của A khỏi friendsList của B
    // loại bỏ id của B khỏi friendsList của A
    await User.updateOne({ _id: id }, {
      $pull: { friendsList: req.params.id }
    })
    await User.updateOne({ _id: req.params.id }, {
      $pull: { friendsList: id }
    })
    res.status(200).json({
      messages: "Successfully delete friend request"
    })
  } catch (error) {
    res.status(500).json({
      messages: "Add friend failed"
    })
  }
}
module.exports = {
  getUser,
  requestAddFriend,
  cancelRequestAddFriend,
  notAcceptFriend,
  acceptFriend,
  deleteFriend
}