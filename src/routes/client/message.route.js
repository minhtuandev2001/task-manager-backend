const router = require("express").Router();
const multer = require("multer");
const uploadFile = multer();


const messageController = require("../../controllers/message.controller");

router.post("/create",
  uploadFile.fields([
    { name: 'images' },
    { name: 'files' },
  ]), messageController.create)

router.patch("/status-message/:idMessage", messageController.updateStatusReadMessage)
router.get("/:room_chat_id", messageController.getMessages)

module.exports = router;