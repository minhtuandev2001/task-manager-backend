const router = require("express").Router();
const multer = require("multer");
const uploadFile = multer();

const userController = require("../../controllers/user.controller")
const authMiddleware = require("../../middlewares/auth.middlewares")
const uploadCloudMiddleware = require("../../middlewares/uploadCloud.middleware");

router.post("/register", userController.register);
router.post("/login", userController.login);
router.patch("/change-status-online", authMiddleware.protect, userController.changeStatusOnline);
router.get("/get-info/:id", authMiddleware.protect, userController.getUserInfor);
router.patch("/update-info", authMiddleware.protect, userController.update);

router.patch("/change-avatar",
  uploadFile.single("avatar"),
  uploadCloudMiddleware.uploadCloud,
  authMiddleware.protect,
  userController.changeAvatar);

router.get("/", userController.getUser);

module.exports = router