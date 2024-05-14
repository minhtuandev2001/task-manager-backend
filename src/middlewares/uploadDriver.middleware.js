const stream = require("stream")
const { google } = require("googleapis");

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const drive = google.drive({
  version: "v3",
  auth: oauth2Client
})

const setFilePublic = async (fileId) => {
  try {
    await drive.permissions.create({
      fileId,
      requestBody: {
        role: "reader",
        type: "anyone"
      }
    })
    const getUrl = await drive.files.get({
      fileId,
      fields: "webViewLink, webContentLink"
    })
    return getUrl.data;
  } catch (error) {
    throw new Error(error)
  }
}

const uploadFile = async (fileObject) => {
  try {
    const bufferStream = new stream.PassThrough(); // tạo ra một luồng dữ liệu 
    bufferStream.end(fileObject.buffer) // điền fileObject.buffer vào lường để chuẩn chị cho các thao tác gửi dữ liệu
    const createFile = await drive.files.create({
      requestBody: {
        name: fileObject.originalname,
        mimeType: fileObject.mimetype,
        parents: ["1pOyCnTVuKV3JtKzNfwzK4MEwv_-5HBDL"] // lấy id của folder, lấy cả link folder rồi dùng toán tử cắt lấy phần tử cuối cùng cx được
      },
      media: {
        mimeType: fileObject.mimetype,
        body: bufferStream
      }
    })
    const fileId = createFile.data.id;
    const getUrl = await setFilePublic(fileId);
    return {
      id: createFile.data.id,
      nameFile: createFile.data.name,
      link_download: getUrl.webContentLink,
      link_view: getUrl.webViewLink,
    }
  } catch (error) {
    console.log("check ", error)
    throw new Error(error)
  }
}

const uploadDriver = async (req, res, next) => {
  try {
    const { body, files } = req;
    if (files) {
      let filesUpload = [];
      for (let f = 0; f < files.length; f++) {
        filesUpload.push(await uploadFile(files[f]))
      }
      body.fileDrive = filesUpload
      next();
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error upload file"
    })
  }
}

const deleteFile = async () => {
  try {
    const deleteFile = await drive.files.delete({
      fileId: "1EiapGN1iKuIWFXfPmFgy3jrvNOT-0dHG"
    })
    console.log(deleteFile, deleteFile.status)
  } catch (error) {
    console.log("delete error: ", error);
  }
}

module.exports = {
  uploadDriver
}