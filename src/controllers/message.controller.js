const Chat = require("../models/chat.model");
const Message = require("../models/message.model");
const User = require("../models/user.model");


// [POST] /create
const create = async (req, res) => {
  try {
    let users = req.body.users.split(",");
    // cập nhật vị trí roomchat 
    await User.updateMany({ _id: { $in: users } }, {
      $pull: { rooms: req.body.room_chat_id },
    })
    await User.updateMany({ _id: { $in: users } }, {
      $push: {
        rooms: {
          $each: [req.body.room_chat_id],
          $position: 0
        }
      }
    })

    delete req.body.users;
    const message = new Message({
      sender: req.body.sender,
      content: req.body.content,
      room_chat_id: req.body.room_chat_id,
      usersRead: req.body.usersRead,
      images: req.body.images,
      files: req.body.fileDrive,
    });
    await message.save();

    // cập nhật latest message
    await Chat.updateOne({ _id: message.room_chat_id }, {
      latestMessageId: message._id
    })

    // lấy thông tin message và trả về lại
    const newMessage = await Message.findOne({ _id: message._id, deleted: false }).lean();
    newMessage.infoSender = await User.findOne({ _id: newMessage.sender, deleted: false }).select("username avatar");
    res.status(200).json({
      data: newMessage,
      messages: "Send message success"
    })
  } catch (error) {
    console.log("check ", error)
    res.status(500).json({
      messages: "Error send message"
    })
  }
}

// [GET] /:rom_chat_id
const getMessages = async (req, res) => {
  try {
    const { room_chat_id } = req.params;
    const messages = await Message.find({ room_chat_id: room_chat_id, deleted: false }).lean();

    // lấy thông tin user của từng message
    for (const message of messages) {
      message.infoSender = await User.findOne({ _id: message.sender, deleted: false }).select("username avatar")
    }
    res.status(200).json({
      data: messages,
      messages: "Get messages success"
    })
  } catch (error) {
    console.log("check ", error)
    res.status(500).json({
      messages: "Get message error"
    })
  }
}

const updateStatusReadMessage = async (req, res) => {
  try {
    const { id } = req.user;
    const { idMessage } = req.params;
    await Message.updateOne({ _id: idMessage, deleted: false }, {
      $addToSet: { usersRead: id }
    })
    res.status(200).json({
      messages: "Update status read message success"
    })
  } catch (error) {
    res.status(500).json({
      messages: "read message error"
    })
  }
}

module.exports = {
  create,
  getMessages,
  updateStatusReadMessage,
}