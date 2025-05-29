const express = require('express');
const router = express.Router();
const Room = require('../models/Room');

// Join/Create Room
router.post('/join', async (req, res) => {
  const { roomId } = req.body;

  if (!roomId || roomId.length < 6 || roomId.length > 8) {
    return res.status(400).json({ message: 'Invalid room code.' });
  }

  let room = await Room.findOne({ roomId });
  if (!room) {
    room = new Room({ roomId });
    await room.save();
    console.log(`🚪 Created new room: ${roomId}`);
  }

  res.status(200).json({ message: 'Room joined successfully.', roomId });
});

// Get Room Info (for replay, optional)
router.get('/:roomId', async (req, res) => {
  const { roomId } = req.params;
  const room = await Room.findOne({ roomId });

  if (!room) {
    return res.status(404).json({ message: 'Room not found.' });
  }

  res.status(200).json(room);
});

module.exports = router;
