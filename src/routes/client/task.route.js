const router = require("express").Router();
const multer = require("multer");
const uploadFile = multer();
const uploadCloudMiddleware = require("../../middlewares/uploadCloud.middleware");
const uploadDriverMiddleware = require("../../middlewares/uploadDriver.middleware")

const taskController = require("../../controllers/task.controller")

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
  taskController.create)

module.exports = router