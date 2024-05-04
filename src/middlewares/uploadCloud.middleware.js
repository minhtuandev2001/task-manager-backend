const streamifier = require("streamifier");
const cloudinary = require("cloudinary").v2;

// conifg
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET
});

const uploadCloud = (req, res, next) => {
  if (req.file || req.files) {
    let streamUpload = (fileUpload) => {
      return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream(
          (error, result) => {
            if (result) {
              resolve(result);
            } else {
              reject(error);
            }
          }
        );
        // read data in buffer then upload cloudinary
        streamifier.createReadStream(fileUpload.buffer).pipe(stream);
      });
    };
    async function upload(req) {
      if (req.file) {
        let result = await streamUpload(req.file);
        req.body[req.file.fieldname] = result.secure_url;
      }
      if (req.files) {
        let images = [];
        for (let i = 0; i < req.files.length; i++) {
          let result = await streamUpload(req.files[i]);
          images.push(result.secure_url)
        }
        req.body[req.files[0].fieldname] = images;
      }
      next()
    }
    upload(req);
  } else {
    next()
  }
}
module.exports = {
  uploadCloud
}

