const { Server } = require('socket.io');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Join user-specific room
    socket.on('join', (uid) => {
      if (uid) {
        socket.join(`user:${uid}`);
        console.log(`👤 User ${uid} joined room user:${uid}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  console.log('✅ Socket.io initialized');
  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

const emitToUser = (uid, event, data) => {
  if (io) {
    io.to(`user:${uid}`).emit(event, data);
  }
};

module.exports = { initSocket, getIO, emitToUser };
