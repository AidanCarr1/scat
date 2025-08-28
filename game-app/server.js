// Import and setup
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
// SOCKET.IO = REAL-TIME COMMUNICATION between CLIENTS AND SERVER


// App and server initialization
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static frontend files
app.use(express.static("public"));

// Track connected players
const players = new Set();

io.on("connection", (socket) => {
  console.log("a user connected:", socket.id);

  socket.on("joinGame", (name) => {
    socket.playerName = name; // store players name
    players.add(socket.id); // add player on join
    console.log(`${name} joined`);
    socket.broadcast.emit("playerJoined", name);
    io.emit("playerCount", players.size); // Send updated count to all clients
  });

  socket.on("sendAnswer", (answer) => {
    console.log("Answer:", answer);
    io.emit("answerReceived", { player: socket.playerName, answer });
  });

  socket.on("disconnect", () => {
    players.delete(socket.id); // Remove player on disconnect
    console.log("user disconnected:", socket.id);
    io.emit("playerCount", players.size); // Send updated count to all clients
  });
});

server.listen(3000, () => {
  console.log("Listening on http://localhost:3000");
});
