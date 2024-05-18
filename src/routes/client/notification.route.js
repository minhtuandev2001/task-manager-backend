const router = require("express").Router();

const notificationController = require("../../controllers/notification.controller");

router.get("/", notificationController.getNotification);

module.exports = router;