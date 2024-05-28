const router = require("express").Router();

const chatController = require("../../controllers/chat.controller")

router.get("/", chatController.getChat);
router.patch("/exits-chat/:id_room_chat", chatController.exitsChat);
router.post("/create", chatController.create);

module.exports = router;