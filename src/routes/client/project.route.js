const router = require("express").Router();

const projectController = require("../../controllers/project.controller")

router.post('/create', projectController.create)

module.exports = router