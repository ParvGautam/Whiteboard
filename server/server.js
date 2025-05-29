const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const roomRoutes = require('./routes/roomRoutes');
const setupSocket = require('./socket');

// Load environment variables if available
require('dotenv').config();

// Frontend deployed URL
const FRONTEND_URL = 'https://whiteboard07.vercel.app';

const app = express();
const server = http.createServer(app);

// Configure Socket.io with CORS settings
const io = new Server(server, {
  cors: {
    origin: [FRONTEND_URL, 'http://localhost:5173'], // Allow both deployed frontend and local development
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Configure Express CORS middleware
app.use(cors({
  origin: [FRONTEND_URL, 'http://localhost:5173'],
  credentials: true
}));

app.use(express.json());

// API Routes
app.use('/api/rooms', roomRoutes);
app.get('/',(req,res)=>{
    res.send({
        activeStatus:true,
        error:false,
    })
})

// MongoDB connection string - replace with your own connection string from MongoDB Atlas
const MONGODB_URI = process.env.MONGODB_URI 

// MongoDB setup
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  console.log('Starting server without database connection...');
});

// Set up socket connections
setupSocket(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} - http://localhost:${PORT}`);
  console.log(`Accepting requests from: ${FRONTEND_URL}`);
});
