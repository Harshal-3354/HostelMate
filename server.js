// server.js
const http = require("http");
const app = require("./app"); // Import your express app
const { Server } = require("socket.io");

const server = http.createServer(app); // create HTTP server from app
const io = new Server(server); // create socket server

// Attach io to app if needed
app.set("io", io);

// Socket.IO Logic
io.on("connection", (socket) => {
  console.log("✅ New user connected");

  socket.on("joinRoom", ({ room }) => {
    socket.join(room);
    console.log(`🔗 Joined room: ${room}`);
  });

  socket.on("chatMessage", ({ room, message, sender }) => {
    io.to(room).emit("newMessage", { message, sender });
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected");
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
