const express = require("express");
require("dotenv").config();
const cors = require("cors")
const connectDB = require("./src/config/db");
const router = require("./src/routes/client/index.route");
const corsOptions = require("./src/config/cors");

connectDB()

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// router
router(app)
app.post("/", (req, res) => {
  res.send("chao")
})

app.listen(PORT, () => {
  console.log("Listening on port", PORT);
})