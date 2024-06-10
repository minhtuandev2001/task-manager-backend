const sendMailHelper = require("../../utiliti/sendMail");

const router = require("express").Router();

router.post("/send", (req, res) => {
  try {
    let { email, subject, content } = req.body;
    console.log("check ", email)
    sendMailHelper.sendMail("minhtuan2001611@gmail.com, minhtuandev2002@gmail.com", subject, content)
    res.status(200).json({
      messages: "Send email success",
    })
  } catch (error) {
    res.status(500).json({
      messages: "Send email error"
    })
  }
})

module.exports = router;