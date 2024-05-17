const userRoutes = require("./user.route");
const aboutRoutes = require("./about.route")
const projectRoutes = require("./project.route")
const taskRoutes = require("./task.route")
const usersRoutes = require("./users.route")

const authMiddleware = require("../../middlewares/auth.middlewares")

module.exports = (app) => {
  app.use("/user", userRoutes);
  app.use("/users", authMiddleware.protect, usersRoutes);
  app.use("/about", authMiddleware.protect, aboutRoutes);
  app.use("/project", authMiddleware.protect, projectRoutes);
  app.use("/task", authMiddleware.protect, taskRoutes);
}