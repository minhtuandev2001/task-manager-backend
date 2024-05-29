const Chat = require("../models/chat.model");
const Message = require("../models/message.model");
const Notification = require("../models/notification.model");
const User = require("../models/user.model");
const mapOrder = require("../utiliti/mapOrder");

// [GET] /chat
const getChat = async (req, res) => {
  try {
    const { id, rooms } = req.user;
    const chats = await Chat.find({ _id: { $in: rooms } }).lean();
    for (const chat of chats) {
      if (chat.isGroupChat) { // chat nhóm
        // quy tắc phải có 3 người mới tạo nhóm được
        // tạo thì cần 3 nhưng sau đó xóa đi hết vẫn được
        // => nhóm sau đó có thể chỉ còn 2 hoặc 1
        const infoUsers = await User.find({ _id: { $in: chat.users } }).select("username avatar statusOnline");
        chat.infoUsers = infoUsers
      } else { // chat đơn
        // lấy id của đối phương 
        let idUser = chat.users[0] === id ? chat.users[1] : chat.users[0]
        const infoUser = await User.findOne({ _id: idUser }).select("username avatar statusOnline")
        chat.infoUser = infoUser;
      }
      // lấy messages lần gửi mới nhất nếu đã nhắn tin
      if (chat.latestMessageId) {
        const message = await Message.findOne({ _id: chat.latestMessageId, deleted: false }).lean();
        if (message) { // có message hoặc message chưa bị xóa thì lấy
          message.infoSender = await User.findOne({ _id: message.sender });
          chat.latestMessage = message;
        }
      }
    }
    res.status(200).json({
      messages: "get chats success",
      data: mapOrder(chats, rooms, "_id")
    })
  } catch (error) {
    console.log("check ", error)
    res.status(500).json({
      messages: "Fetch chat error"
    })
  }
}

const exitsChat = async (req, res) => {
  try {
    const { id_room_chat } = req.params;
    const chat = await Chat.findOne({ _id: id_room_chat, deleted: false });
    if (!chat) {
      res.status(404).json({
        messages: "Chat not found"
      })
      return;
    }
    await Chat.updateOne({ _id: id_room_chat }, {
      $pull: { users: req.user.id }
    })
    res.status(200).json({
      messages: "Delete chat success",
    })
  } catch (error) {
    res.status(500).json({
      messages: "Delete chat failed"
    })
  }
}

const create = async (req, res) => {
  try {
    const { id } = req.user;
    console.log("check ", id)
    console.log("check ", req.body)
    const newChat = new Chat(req.body)
    await newChat.save();

    // thêm group cho các user khác
    req.body.users.forEach(async (idUser) => {
      await User.updateOne({ _id: idUser }, {
        $push: {
          rooms: {
            $each: [newChat.id],
            $position: 0
          }
        }
      })
    });
    // kết thúc thêm group cho các user khác

    // tạo thông báo 
    const noti = {
      user_id_send: id,
      user_id_receiver: req.body.users,
      content: "added you to a chat group",
    }
    noti.infoUser = req.user;
    const notification = new Notification(noti);
    await notification.save();
    // kết thúc tạo thông báo 


    // lấy thông tin gửi thông báo đến tất cả các member trong group
    const chat = await Chat.findOne({ _id: newChat.id }).lean();
    // lấy thông tin của các member trong nhóm chat
    const infoUsers = await User.find({ _id: { $in: newChat.users } }).select("username avatar statusOnline").lean();
    chat.infoUsers = infoUsers;
    // gửi thông tin nhóm chat, noti đến các member
    req.body.users.forEach(idUser => {
      _io.in(idUser).emit("CREATE CHAT", chat, noti)
    })
    // kết thúc lấy thông tin gửi thông báo đến tất cả các member trong group
    res.status(200).json({
      messages: "Create chat success"
    })
  } catch (error) {
    res.status(500).json({
      messages: "Create chat failed"
    })
  }
}
module.exports = {
  getChat,
  exitsChat,
  create
}