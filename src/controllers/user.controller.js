const { v4 } = require("uuid")
const ForgotPassword = require("../models/forgot-password.model");
const md5 = require("md5");
const generateToken = require("../config/generateToken");
const User = require("../models/user.model")
const sendMailHelper = require("../utiliti/sendMail");
// [POST] /user/register
const register = async (req, res) => {
  try {
    const emailExist = await User.findOne({ email: req.body.email });
    if (emailExist) {
      res.status(409).json({
        messages: "Email already exists"
      })
      return
    }
    if (req.body.password !== req.body.passwordCf) {
      res.status(400).json({
        messages: "Password not math"
      })
      return
    }
    req.body.password = md5(req.body.password);
    const user = new User(req.body);
    await user.save();
    res.status(200).json({
      messages: "Register success",
      data: {
        id: user.id,
        name: user.username,
        avatar: user.avatar,
        email: user.email,
        friendsList: user.friendsList,
        statusOnline: user.statusOnline,
        token: generateToken(user.id)
      }
    })
  } catch (error) {
    console.log("check ", error)
    res.status(500).json({
      messages: "Register failed"
    })
  }
}

// [POST] /user/login
const login = async (req, res) => {
  try {
    let userExist = await User.findOne({ email: req.body.email });
    if (!userExist) {
      res.status(404).json({
        messages: "Account does not exist"
      })
      return
    }
    if (md5(req.body.password) !== userExist.password) {
      res.status(400).json({
        messages: "password is incorrect"
      })
      return
    }
    // update statusOnline user
    await User.updateOne({ _id: userExist.id }, {
      statusOnline: true,
    })
    res.status(200).json({
      messages: "Login success",
      data: {
        id: userExist.id,
        name: userExist.username,
        avatar: userExist.avatar,
        email: userExist.email,
        friendsList: userExist.friendsList,
        statusOnline: userExist.statusOnline,
        token: generateToken(userExist.id)
      }
    })
  } catch (error) {
    res.status(500).json({
      messages: "Login failed"
    })
  }
}

// [GET] /user?keyword={keyword}
const getUser = async (req, res) => {
  const { keyword, limit } = req.query;
  let users = []
  try {
    const regex = new RegExp(keyword, "i")
    users = await User.find({
      $or: [
        { username: regex },
        { email: regex }
      ]
    }).limit(limit || 5).select("-password")
    res.status(200).json({
      data: users
    })
  } catch (error) {
    console.log("check ", error)
    res.status(500).json({
      messages: "Server error"
    })
  }
}

// [PATCH] /users/change-status-online
const changeStatusOnline = async (req, res) => {
  try {
    let userExist = await User.findOne({ _id: req.user._id, deleted: false });
    if (!userExist) {
      res.status(404).json({
        messages: "Account does not exist"
      })
      return
    }
    // update statusOnline user
    await User.updateOne({ _id: userExist.id }, req.body)
    res.status(200).json({
      messages: "Updated statusOnline user success",
    })
  } catch (error) {
    console.log("check ", error)
    res.status(500).json({
      messages: "Error update statusOnline of user"
    })
  }
}
// [GET] /user/:id
const getUserInfor = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findOne({ _id: id }).select("-password")
    res.status(200).json({
      messages: "get info success",
      data: user
    })
  } catch (error) {
    console.log("check ", error)
    res.status(500).json({
      messages: "Server error"
    })
  }
}
const update = async (req, res) => {
  try {
    const { id } = req.user;
    await User.updateOne({ _id: id }, req.body);
    const user = await User.findOne({ _id: id }).select("avatar email friendsList username statusOnline phone address");
    res.status(200).json({
      messages: "Update information success",
      data: user
    })
  } catch (error) {
    res.status(500).json({
      messages: "Update failed"
    })
  }
}
const changeAvatar = async (req, res) => {
  try {
    const { id } = req.user;
    await User.updateOne({ _id: id }, { avatar: req.body.avatar });
    res.status(200).json({
      messages: "Update information success",
      data: req.body.avatar
    })
  } catch (error) {
    res.status(500).json({
      messages: "Update failed"
    })
  }
}

const sendForgotPassword = async (req, res) => {
  try {
    const email = req.body.email
    // // check email có tồn tại không
    // const existEmail = await User.findOne({
    //   email: email,
    //   deleted: false
    // })
    // if (!existEmail) {
    //   req.flash("error", "Email does not exist")
    //   res.redirect("back")
    //   return
    // }
    // vc1:  tạo mã otp và lưu mã otp, email vào collection
    const objectForgotPassword = {
      email: email,
      otp: "",
      expireAt: Date.now()
    }
    objectForgotPassword.otp = v4();
    const otp = new ForgotPassword(objectForgotPassword)
    await otp.save()

    // vc2: gửi mã otp qua email user 
    const subject = "Mã OTP xác minh lấy lại mật khẩu"
    const html = `
    Mã OTP xác minh lấy lại mật khẩu là <b>${objectForgotPassword.otp}</b> Lưu ý không được để lọ, thời hạn sử dụng là 3 phút`
    sendMailHelper.sendMail(email, subject, html)

    res.status(200).json({
      messages: "Send OTP success"
    })
  } catch (error) {
    res.status(500).json({
      messages: "Server error, reload"
    })
  }
}

const checkOtpPassword = async (req, res) => {
  try {
    const email = req.body.email
    const otp = req.body.otp
    const result = await ForgotPassword.findOne({
      email: email,
      otp: otp
    })
    if (!result) {
      res.status(400).json({
        messages: "OTP error or expired, resend"
      })
      return
    }
    // lấy ra thông tin người dùng sau khi đã check otp
    const user = await User.findOne({
      email: email
    })
    if (!user) {
      res.status(404).json({
        messages: "User not found"
      })
      return
    }
    res.status(200).json({
      messages: "Check OTP success"
    })
  } catch (error) {
    res.status(500).json({
      messages: "Server error, reload"
    })
  }
}

const resetPasswordPost = async (req, res) => {
  try {
    const email = req.body.email
    const password = md5(req.body.password)
    const user = await User.findOne({
      email: email,
    })
    if (!user) {
      res.status(404).json({
        messages: "User not found"
      })
      return
    }
    await User.updateOne({ email: email }, { password: password })
    res.status(200).json({
      messages: "Reset password success"
    })
  } catch (error) {
    res.status(500).json({
      messages: "Server error, reload"
    })
  }
}
module.exports = {
  register,
  login,
  getUser,
  changeStatusOnline,
  update,
  getUserInfor,
  changeAvatar,
  sendForgotPassword,
  checkOtpPassword,
  resetPasswordPost
}