const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const protect = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      const token = req.headers.authorization.split(" ")[1];
      // decode 
      const decode = jwt.verify(token, process.env.JWT_SECRET);

      let user = await User.findOne({ _id: decode.id, status: "active" }).select("-password");
      if (!user) {
        res.status(404).json({
          messages: "User not found"
        })
        return
      }
      req.user = user
      next();
    } catch (error) {
      res.status(403).json({
        messages: "Not authorization, token failed"
      })
    }
  } else {
    res.status(403).json({
      messages: "Not authorized , no token"
    })
  }
}

module.exports = {
  protect
}