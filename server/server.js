const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const roomRoutes = require('./routes/roomRoutes');
const setupSocket = require('./socket');

// Load environment variables if available
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
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
server.listen(PORT, () => console.log(`Server running on port ${PORT} - http://localhost:${PORT}`));
