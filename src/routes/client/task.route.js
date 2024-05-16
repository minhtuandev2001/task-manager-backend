const router = require("express").Router();
const multer = require("multer");
const uploadFile = multer();
const uploadCloudMiddleware = require("../../middlewares/uploadCloud.middleware");
const uploadDriverMiddleware = require("../../middlewares/uploadDriver.middleware")

const taskController = require("../../controllers/task.controller")
const taskValidation = require("../../validation/task.validation")

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
  }, uploadDriverMiddleware.uploadDriver,
  taskValidation.create,
  taskController.create)

router.get("/", taskController.getTasks)
router.get("/detail/:id", taskController.getTask)

router.patch("/update/:id",
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
  }, uploadDriverMiddleware.uploadDriver,
  taskValidation.create,
  taskController.update)
module.exports = router