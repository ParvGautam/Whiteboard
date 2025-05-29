let rooms = {}; // In-memory for active user count and cursor data

module.exports = function handleSockets(socket, io) {
  console.log('🟢 New client connected:', socket.id);

  socket.on('join-room', ({ roomId }) => {
    socket.join(roomId);
    console.log(`🧩 Socket ${socket.id} joined room ${roomId}`);

    // Track user count
    if (!rooms[roomId]) {
      rooms[roomId] = { users: new Set() };
    }
    rooms[roomId].users.add(socket.id);

    io.to(roomId).emit('user-count', rooms[roomId].users.size);
  });

  socket.on('cursor-move', ({ roomId, x, y }) => {
    socket.to(roomId).emit('cursor-update', { socketId: socket.id, x, y });
  });

  socket.on('draw-start', ({ roomId, stroke }) => {
    socket.to(roomId).emit('remote-draw-start', { socketId: socket.id, stroke });
  });

  socket.on('draw-move', ({ roomId, point }) => {
    socket.to(roomId).emit('remote-draw-move', { socketId: socket.id, point });
  });

  socket.on('draw-end', ({ roomId }) => {
    socket.to(roomId).emit('remote-draw-end', { socketId: socket.id });
  });

  socket.on('clear-canvas', ({ roomId }) => {
    socket.to(roomId).emit('remote-clear-canvas');
  });

  socket.on('disconnecting', () => {
    const roomsJoined = Array.from(socket.rooms).slice(1); // skip socket.id
    roomsJoined.forEach((roomId) => {
      if (rooms[roomId]) {
        rooms[roomId].users.delete(socket.id);
        io.to(roomId).emit('user-count', rooms[roomId].users.size);
        if (rooms[roomId].users.size === 0) delete rooms[roomId];
      }
    });
    console.log('🔴 Socket disconnected:', socket.id);
  });
};
