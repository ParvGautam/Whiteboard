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

// Configure Socket.io with CORS settings and additional options for Vercel
const io = new Server(server, {
  cors: {
    origin: [FRONTEND_URL, 'http://localhost:5173'], // Allow both deployed frontend and local development
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['my-custom-header']
  },
  // Enable all transports
  transports: ['polling', 'websocket'],
  allowEIO3: true,
  // Increase ping timeout for Vercel
  pingTimeout: 60000,
  // Upgrade mechanism
  allowUpgrades: true,
  // Path configuration
  path: '/socket.io/',
  // Cookie settings
  cookie: false
});

// Configure Express CORS middleware
app.use(cors({
  origin: [FRONTEND_URL, 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Add preflight OPTIONS handling
app.options('*', cors());

app.use(express.json());

// Health check endpoint
app.get('/',(req,res)=>{
    res.send({
        activeStatus: true,
        error: false,
        socketConnected: true,
        clientOrigin: req.headers.origin || 'unknown'
    });
});

// Socket.io test endpoint
app.get('/socket-test', (req, res) => {
    res.send({
        socketStatus: 'Socket.io server is running',
        transports: ['polling', 'websocket'],
        supportedOrigins: [FRONTEND_URL, 'http://localhost:5173']
    });
});

// API Routes
app.use('/api/rooms', roomRoutes);

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
