const userRoutes = require("./user.route");
const aboutRoutes = require("./about.route")

const authMiddleware = require("../../middlewares/auth.middlewares")

module.exports = (app) => {
  app.use("/user", userRoutes);
  app.use("/about", authMiddleware.protect, aboutRoutes);
}