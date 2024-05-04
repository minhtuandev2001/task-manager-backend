const router = require("express").Router();
const multer = require("multer")
const uploadFile = multer()

const uploadCloudMiddleware = require("../../middlewares/uploadCloud.middleware");
const uploadDriveMiddleware = require("../../middlewares/uploadDriver.middleware")

router.get("/", (req, res) => {
  res.send("about")
})
router.get("/upload",
  uploadFile.single("image"),
  uploadCloudMiddleware.uploadCloud,
  (req, res) => {
    res.status(200).json({
      messages: "upload success",
      data: req.body
    })
  })
router.get("/uploadMul",
  uploadFile.array("images", 5),
  uploadCloudMiddleware.uploadCloud,
  (req, res) => {
    res.status(200).json({
      messages: "upload multiple success",
      data: req.body
    })
  })
router.get("/uploadDrive",
  uploadFile.array("file", 5),
  uploadDriveMiddleware.uploadDriver,
  (req, res) => {
    res.status(200).json({
      messages: "upload drive success",
      data: req.body
    })
  })

module.exports = router;