const express = require("express");
require("dotenv").config();
const connectDB = require("./src/config/db");
const router = require("./src/routes/client/index.route")

connectDB()

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

// router
router(app)
app.get("/", (req, res) => {
  res.send("chao")
})

app.listen(PORT, () => {
  console.log("Listening on port", PORT);
})