const Chat = require("../models/chat.model");
const Message = require("../models/message.model");
const User = require("../models/user.model");

// [GET] /chat
const getChat = async (req, res) => {
  try {
    const { id } = req.user;
    const chats = await Chat.find({ users: id }).lean();
    for (const chat of chats) {
      if (chat.isGroupChat) { // chat nhóm
        // quy tắc phải có 3 người mới tạo nhóm được
        // tạo thì cần 3 nhưng sau đó xóa đi hết vẫn được
        // => nhóm sau đó có thể chỉ còn 2 hoặc 1
        const infoUsers = await User.find({ _id: { $in: chat.users } }).select("username avatar");
        chat.infoUsers = infoUsers
      } else { // chat đơn
        // lấy id của đối phương 
        let idUser = chat.users[0] === id ? chat.users[1] : chat.users[0]
        const infoUser = await User.findOne({ _id: idUser }).select("username avatar")
        chat.infoUser = infoUser;
      }
      // lấy messages lần gửi mới nhất nếu đã nhắn tin
      if (chat.latestMessageId) {
        const message = await Message.findOne({ _id: chat.latestMessageId, deleted: false })
        if (message) { // có message hoặc message chưa bị xóa thì lấy
          chat.latestMessage = message;
        }
      }
    }
    res.status(200).json({
      messages: "get chats success",
      data: chats
    })
  } catch (error) {
    res.status(500).json({
      messages: "Fetch chat error"
    })
  }
}

module.exports = {
  getChat
}