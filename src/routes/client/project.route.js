const router = require("express").Router();

const projectController = require("../../controllers/project.controller")
const projectValidation = require("../../validation/project.validation")

router.get('/', projectController.getProject)
router.post('/create', projectValidation.create, projectController.create)
router.patch('/update/:id', projectValidation.create, projectController.update)
router.patch('/change-star/:id', projectController.changeStarProject)


module.exports = router