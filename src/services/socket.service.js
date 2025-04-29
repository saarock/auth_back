// src/sockets/socketServer.js
import {Server as socketIo} from 'socket.io';
import connectedUsers from '../utils/connectedUsers.js';

// Function to initialize socket.io
export const initSocket = (server) => {
  console.log("Initializing socket.io...");
  const io = new socketIo(server, {
    cors: {
      origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true,
        transports: ['websocket', 'polling']
    }
  });

  // Event listener for new connections
  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    
    socket.on('register', (data) => {
        console.log('User registered:', data.userId);
      if (data.userId) {
        connectedUsers.addUser(data.userId, socket.id); 
        console.log(`User ${data.userId} registered with socket ID: ${socket.id}`);
      }
    });




    // Handle client disconnect
    socket.on('disconnect', () => {
      connectedUsers.removeUser(socket.id);
      console.log('A user disconnected:', socket.id);
    });
  });

  return io;
};
