const userRoutes = require("./user.route");
const aboutRoutes = require("./about.route")
const projectRoutes = require("./project.route")
const taskRoutes = require("./task.route")

const authMiddleware = require("../../middlewares/auth.middlewares")

module.exports = (app) => {
  app.use("/user", userRoutes);
  app.use("/about", authMiddleware.protect, aboutRoutes);
  app.use("/project", authMiddleware.protect, projectRoutes);
  app.use("/task", authMiddleware.protect, taskRoutes);
}