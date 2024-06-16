const mongoose = require("mongoose")

const forgotPasswordSchema = mongoose.Schema({
  email: { type: String },
  otp: { type: String },
  expireAt: { type: Date, expires: 180 }
}, {
  timestamps: true
})

const ForgotPassword = mongoose.model("ForgotPassword", forgotPasswordSchema, "forgot-password")

module.exports = ForgotPassword