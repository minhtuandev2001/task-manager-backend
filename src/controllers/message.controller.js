const Message = require("../models/message.model");
const User = require("../models/user.model");


// [POST] /create
const create = async (req, res) => {
  try {
    console.log("check ", req.body);
    const message = new Message(req.body);
    await message.save();
    res.status(200).json({
      messages: "Send message success"
    })
  } catch (error) {
    res.status(500).json({
      messages: "Error send message"
    })
  }
}

// [GET] /:rom_chat_id
const getMessages = async (req, res) => {
  try {
    const { room_chat_id } = req.params;
    console.log("check ", room_chat_id)
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
module.exports = {
  create,
  getMessages
}