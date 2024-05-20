const router = require("express").Router();

const chatController = require("../../controllers/chat.controller")

router.get("/", chatController.getChat);

module.exports = router;