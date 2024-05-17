const { Server } = require("socket.io");

module.exports = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000"
    }
  })
  io.on("connection", (socket) => {
    console.log("a user connected", socket.id)

    socket.on("setup", (user) => {
      socket.join(user.id);
      socket.emit("connected")
    })
  })
}