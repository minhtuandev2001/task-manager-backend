const router = require("express").Router();

const projectController = require("../../controllers/project.controller")
const projectValidation = require("../../validation/project.validation")

router.post('/create', projectValidation.create, projectController.create)

module.exports = router