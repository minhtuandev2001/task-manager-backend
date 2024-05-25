const router = require("express").Router();

const userController = require("../../controllers/user.controller")
const authMiddleware = require("../../middlewares/auth.middlewares")

router.post("/register", userController.register)
router.post("/login", userController.login)
router.patch("/change-status-online", authMiddleware.protect, userController.changeStatusOnline)
router.get("/", userController.getUser)

module.exports = router