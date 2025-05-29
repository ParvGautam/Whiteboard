const Room = require('./models/Room')

function setupSocket(io) {
  io.on('connection', (socket) => {
    console.log('🔌 New client connected:', socket.id)

    let currentRoomId = null

    // Handle room joining
    socket.on('join-room', ({ roomId }) => {
      currentRoomId = roomId
      socket.join(roomId)
      console.log(`🧑‍🤝‍🧑 ${socket.id} joined room ${roomId}`)

      // Optionally emit user count
      const roomSize = io.sockets.adapter.rooms.get(roomId)?.size || 0
      io.to(roomId).emit('user-count', roomSize)
    })

    // Handle room leaving
    socket.on('leave-room', () => {
      if (currentRoomId) {
        socket.leave(currentRoomId)
        console.log(`👋 ${socket.id} left room ${currentRoomId}`)

        const roomSize = io.sockets.adapter.rooms.get(currentRoomId)?.size || 0
        io.to(currentRoomId).emit('user-count', roomSize)
        currentRoomId = null
      }
    })

    // Handle cursor movement
    socket.on('cursor-move', (data) => {
      if (!currentRoomId) return
      socket.to(currentRoomId).emit('cursor-move', {
        userId: socket.id,
        x: data.x,
        y: data.y
      })
    })

    // Handle drawing start
    socket.on('draw-start', ({ roomId, stroke }) => {
      if (!currentRoomId) return
      socket.to(currentRoomId).emit('remote-draw-start', {
        socketId: socket.id,
        stroke
      })
      
      // Store drawing commands for persistence
      const command = {
        type: 'stroke-start',
        data: stroke,
        timestamp: new Date()
      }
      
      Room.findOneAndUpdate(
        { roomId: currentRoomId },
        {
          $push: { drawingData: command },
          $set: { lastActivity: new Date() }
        }
      ).exec().catch(err => console.error('DB Error:', err))
    })

    // Handle drawing movement
    socket.on('draw-move', ({ roomId, point }) => {
      if (!currentRoomId) return
      socket.to(currentRoomId).emit('remote-draw-move', {
        socketId: socket.id,
        point
      })
    })

    // Handle drawing end
    socket.on('draw-end', ({ roomId }) => {
      if (!currentRoomId) return
      socket.to(currentRoomId).emit('remote-draw-end', {
        socketId: socket.id
      })
    })

    // Handle clear canvas
    socket.on('clear-canvas', () => {
      if (!currentRoomId) return
      io.to(currentRoomId).emit('remote-clear-canvas')

      const command = {
        type: 'clear',
        data: {},
        timestamp: new Date()
      }

      Room.findOneAndUpdate(
        { roomId: currentRoomId },
        {
          $push: { drawingData: command },
          $set: { lastActivity: new Date() }
        }
      ).exec().catch(err => console.error('DB Error:', err))
    })

    // Disconnect cleanup
    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`)
      if (currentRoomId) {
        const roomSize = io.sockets.adapter.rooms.get(currentRoomId)?.size || 0
        io.to(currentRoomId).emit('user-count', roomSize)
      }
    })
  })
}

module.exports = setupSocket
