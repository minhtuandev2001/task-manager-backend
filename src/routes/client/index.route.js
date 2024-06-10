const userRoutes = require("./user.route");
const aboutRoutes = require("./about.route")
const projectRoutes = require("./project.route")
const taskRoutes = require("./task.route")
const usersRoutes = require("./users.route")
const notificationRoutes = require("./notification.route")
const chatRoutes = require("./chat.route")
const messageRoutes = require("./message.route")
const sendMailRoutes = require("./send_mail.route")

const authMiddleware = require("../../middlewares/auth.middlewares")

module.exports = (app) => {
  app.use("/user", userRoutes);
  app.use("/users", authMiddleware.protect, usersRoutes);
  app.use("/about", authMiddleware.protect, aboutRoutes);
  app.use("/project", authMiddleware.protect, projectRoutes);
  app.use("/task", authMiddleware.protect, taskRoutes);
  app.use("/notification", authMiddleware.protect, notificationRoutes);
  app.use("/chat", authMiddleware.protect, chatRoutes);
  app.use("/message", authMiddleware.protect, messageRoutes);
  app.use("/sendMail", authMiddleware.protect, sendMailRoutes);
}