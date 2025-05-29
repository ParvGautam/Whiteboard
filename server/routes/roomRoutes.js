const express = require('express');
const router = express.Router();
const Room = require('../models/Room');

// Join/Create Room
router.post('/join', async (req, res) => {
  const { roomId } = req.body;

  if (!roomId || roomId.length < 6 || roomId.length > 8) {
    return res.status(400).json({ message: 'Invalid room code.' });
  }

  try {
    let room = await Room.findOne({ roomId });
    let isNewRoom = false;

    if (!room) {
      room = new Room({ roomId });
      await room.save();
      isNewRoom = true;
      console.log(`🚪 Created new room: ${roomId}`);
    } else {
      // Update last activity
      room.lastActivity = new Date();
      await room.save();
    }

    res.status(200).json({ 
      message: `Room ${isNewRoom ? 'created' : 'joined'} successfully.`, 
      roomId,
      isNewRoom,
      drawingCount: room.drawingData ? room.drawingData.length : 0
    });
  } catch (err) {
    console.error('Error joining room:', err);
    res.status(500).json({ message: 'Server error while joining room.' });
  }
});

// Get Room Info (for replay, optional)
router.get('/:roomId', async (req, res) => {
  const { roomId } = req.params;
  
  try {
    const room = await Room.findOne({ roomId });

    if (!room) {
      return res.status(404).json({ message: 'Room not found.' });
    }

    // Update the last activity timestamp
    room.lastActivity = new Date();
    await room.save();

    // Return room info including drawing data
    res.status(200).json({
      roomId: room.roomId,
      createdAt: room.createdAt,
      lastActivity: room.lastActivity,
      drawingData: room.drawingData || [],
      drawingCount: room.drawingData ? room.drawingData.length : 0
    });
  } catch (err) {
    console.error('Error getting room:', err);
    res.status(500).json({ message: 'Server error while retrieving room data.' });
  }
});

module.exports = router;
