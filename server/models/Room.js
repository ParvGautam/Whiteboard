const mongoose = require('mongoose');

const drawingCommandSchema = new mongoose.Schema({
  type: String, // 'stroke-start', 'stroke-move', 'stroke-end', or 'clear'
  data: mongoose.Schema.Types.Mixed, // { points, color, width, etc. }
  timestamp: { type: Date, default: Date.now }
});

const roomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  lastActivity: { type: Date, default: Date.now },
  drawingData: [drawingCommandSchema]
});

// Index for efficient retrieval by roomId
roomSchema.index({ roomId: 1 });

// Index for cleaning up inactive rooms
// Can be used to automatically delete rooms after a certain period of inactivity
roomSchema.index({ lastActivity: 1 }, { 
  expireAfterSeconds: 30 * 24 * 60 * 60 // 30 days
});

// Optional: Add a method to get optimized drawing data (if the array gets too large)
roomSchema.methods.getOptimizedDrawingData = function() {
  // This could implement logic to compress or optimize the drawing data
  // For now, just return the raw data
  return this.drawingData;
};

module.exports = mongoose.model('Room', roomSchema);
