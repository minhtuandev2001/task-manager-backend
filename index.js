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
    origin: ["https://task-manager-zeta-gules.vercel.app", "http://localhost:3000"],
    credentials: true
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
  socket.on("join chat", (id) => {
    console.log("join room ", id)
  })
  // gửi tin nhắn cho các client
  socket.on("new message", (message, userIds) => {
    console.log("check ", message.infoSender._id);
    console.log("check ", userIds);
    userIds.forEach(id => {
      io.in(id).emit("server return message", message);
      io.in(id).emit("server return message noti", message);
    });
  })
})