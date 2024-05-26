const router = require("express").Router();
const multer = require("multer");
const uploadFile = multer();


const messageController = require("../../controllers/message.controller");
const uploadCloudMiddleware = require("../../middlewares/uploadCloud.middleware");
const uploadDriverMiddleware = require("../../middlewares/uploadDriver.middleware")

router.post("/create",
  uploadFile.fields([
    { name: 'images' },
    { name: 'files' },
  ]),
  (req, res, next) => {
    req.temp = req.files
    req.files = req.temp.images
    next();
  }, uploadCloudMiddleware.uploadCloud,
  (req, res, next) => {
    req.files = req.temp.files
    next();
  }, uploadDriverMiddleware.uploadDriver
  , messageController.create)

router.patch("/status-message/:idMessage", messageController.updateStatusReadMessage)
router.get("/:room_chat_id", messageController.getMessages)

module.exports = router;