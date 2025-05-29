const Room = require('./models/Room')

function setupSocket(io) {
  // Log when Socket.io server starts
  console.log('Socket.io server initialized and ready for connections');

  // Handle connection events
  io.on('connection', (socket) => {
    console.log(`🔌 New client connected: ${socket.id} from ${socket.handshake.headers.origin || 'unknown origin'}`);

    let currentRoomId = null;

    // Handle room joining
    socket.on('join-room', async ({ roomId }) => {
      try {
        currentRoomId = roomId;
        socket.join(roomId);
        console.log(`🧑‍🤝‍🧑 ${socket.id} joined room ${roomId}`);

        // Optionally emit user count
        const roomSize = io.sockets.adapter.rooms.get(roomId)?.size || 0;
        io.to(roomId).emit('user-count', roomSize);

        // Fetch existing drawings from database and send to the new user
        try {
          const room = await Room.findOne({ roomId });
          if (room && room.drawingData && room.drawingData.length > 0) {
            // Send the drawing data only to the user who just joined
            console.log(`Sending ${room.drawingData.length} drawing commands to new user in room ${roomId}`);
            socket.emit('load-drawing', { drawingData: room.drawingData });
          }
        } catch (err) {
          console.error('Error fetching room data:', err);
          socket.emit('error', { message: 'Failed to load existing drawings' });
        }
      } catch (err) {
        console.error(`Error joining room ${roomId}:`, err);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Handle room leaving
    socket.on('leave-room', () => {
      if (currentRoomId) {
        socket.leave(currentRoomId);
        console.log(`👋 ${socket.id} left room ${currentRoomId}`);

        const roomSize = io.sockets.adapter.rooms.get(currentRoomId)?.size || 0;
        io.to(currentRoomId).emit('user-count', roomSize);
        currentRoomId = null;
      }
    });

    // Handle cursor movement
    socket.on('cursor-move', (data) => {
      if (!currentRoomId) return;
      socket.to(currentRoomId).emit('cursor-move', {
        userId: socket.id,
        x: data.x,
        y: data.y
      });
    });

    // Handle drawing start
    socket.on('draw-start', ({ roomId, stroke }) => {
      if (!currentRoomId) return;
      socket.to(currentRoomId).emit('remote-draw-start', {
        socketId: socket.id,
        stroke
      });
      
      // Store drawing commands for persistence
      const command = {
        type: 'stroke-start',
        data: stroke,
        timestamp: new Date()
      };
      
      Room.findOneAndUpdate(
        { roomId: currentRoomId },
        {
          $push: { drawingData: command },
          $set: { lastActivity: new Date() }
        }
      ).exec().catch(err => console.error('DB Error saving stroke-start:', err));
    });

    // Handle drawing movement
    socket.on('draw-move', ({ roomId, point }) => {
      if (!currentRoomId) return;
      socket.to(currentRoomId).emit('remote-draw-move', {
        socketId: socket.id,
        point
      });

      // Store drawing point for persistence
      const command = {
        type: 'stroke-move',
        data: { point },
        timestamp: new Date()
      };
      
      Room.findOneAndUpdate(
        { roomId: currentRoomId },
        {
          $push: { drawingData: command },
          $set: { lastActivity: new Date() }
        }
      ).exec().catch(err => console.error('DB Error saving stroke-move:', err));
    });

    // Handle drawing end
    socket.on('draw-end', ({ roomId }) => {
      if (!currentRoomId) return;
      socket.to(currentRoomId).emit('remote-draw-end', {
        socketId: socket.id
      });

      // Store drawing end for persistence
      const command = {
        type: 'stroke-end',
        data: {},
        timestamp: new Date()
      };
      
      Room.findOneAndUpdate(
        { roomId: currentRoomId },
        {
          $push: { drawingData: command },
          $set: { lastActivity: new Date() }
        }
      ).exec().catch(err => console.error('DB Error saving stroke-end:', err));
    });

    // Handle clear canvas
    socket.on('clear-canvas', () => {
      if (!currentRoomId) return;
      io.to(currentRoomId).emit('remote-clear-canvas');

      const command = {
        type: 'clear',
        data: {},
        timestamp: new Date()
      };

      Room.findOneAndUpdate(
        { roomId: currentRoomId },
        {
          $push: { drawingData: command },
          $set: { lastActivity: new Date() }
        }
      ).exec().catch(err => console.error('DB Error clearing canvas:', err));
    });

    // Handle connection errors
    socket.on('error', (error) => {
      console.error(`Socket ${socket.id} error:`, error);
    });

    // Disconnect cleanup
    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
      if (currentRoomId) {
        const roomSize = io.sockets.adapter.rooms.get(currentRoomId)?.size || 0;
        io.to(currentRoomId).emit('user-count', roomSize);
      }
    });
  });
}

module.exports = setupSocket;
