const md5 = require("md5");
const generateToken = require("../config/generateToken");
const User = require("../models/user.model")

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
        friendsList: userExist.friendsList,
        statusOnline: userExist.statusOnline,
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
      data: userExist.friendsList
    })
  } catch (error) {
    console.log("check ", error)
    res.status(500).json({
      messages: "Error update statusOnline of user"
    })
  }
}
module.exports = {
  register,
  login,
  getUser,
  changeStatusOnline
}