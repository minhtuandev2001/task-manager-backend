const router = require("express").Router();

const usersController = require("../../controllers/users.controller")

router.get("/request-friend/:id", usersController.requestAddFriend)
router.get("/cancel-request-friend/:id", usersController.cancelRequestAddFriend)
router.get("/not-accept-friend/:id", usersController.notAcceptFriend)
router.get("/accept-friend/:id", usersController.acceptFriend)
router.get("/delete-friend/:id", usersController.deleteFriend)
router.get("/", usersController.getUser)

module.exports = router