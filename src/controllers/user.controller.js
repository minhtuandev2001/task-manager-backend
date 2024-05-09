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
      data: generateToken(user.id)
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
    const userExist = await User.findOne({ email: req.body.email });
    if (!userExist) {
      res.status(404).json({
        messages: "Account exists"
      })
      return
    }
    if (md5(req.body.password) !== userExist.password) {
      res.status(400).json({
        messages: "password is incorrect"
      })
      return
    }
    res.status(200).json({
      messages: "Login success",
      data: {
        id: userExist.id,
        name: userExist.username,
        avatar: userExist.avatar,
        email: userExist.email,
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
  const keyword = req.query.keyword;
  let users = []
  try {
    if (keyword) {
      const regex = new RegExp(keyword, "i")
      users = await User.find({
        $or: [
          { username: regex },
          { email: regex }
        ]
      }).limit(5)
    }
    res.status(200).json({
      data: users
    })
  } catch (error) {
    res.status(500).json({
      messages: "Server error"
    })
  }
}
module.exports = {
  register,
  login,
  getUser
}