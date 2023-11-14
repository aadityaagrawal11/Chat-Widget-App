const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/chatApp');

// Create MongoDB schema and model
const chatSchema = new mongoose.Schema({
  userId: String,
  username: String,
  message: String,
  timestamp: { type: Date, default: Date.now },
});

const Chat = mongoose.model('Chat', chatSchema);

// Serve the frontend
app.use(express.static('public'));

// Socket.IO logic
io.on('connection', (socket) => {
  console.log('User connected');

  // Listen for new messages
  socket.on('newMessage', async (data) => {
    const { userId, username, message } = data;

    // Save message to MongoDB
    const chat = new Chat({ userId, username, message });
    await chat.save();

    // Broadcast the message to all connected clients
    io.emit('newMessage', chat);
  });

  // Disconnect event
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
