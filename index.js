const express = require("express");
require("dotenv").config();
const cors = require("cors");
const connectDB = require("./src/config/db");
const router = require("./src/routes/client/index.route");

connectDB()

const app = express();
const PORT = process.env.PORT || 4000;
const http = require("http");
const server = http.createServer(app)
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000"
  }
})
global._io = io

app.use(cors());
app.use(express.json());

// router
router(app)
app.post("/", (req, res) => {
  res.send("chao")
})

server.listen(PORT, () => {
  console.log("Listening on port", PORT);
})

io.on("connection", (socket) => {
  console.log("a user connected", socket.id)

  socket.on("setup", (user) => {
    socket.join(user.id);
    socket.emit("connected")
  })
})