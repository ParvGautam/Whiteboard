import { io } from 'socket.io-client'
import { API_BASE_URL } from './config'

// Configure Socket.io with fallback options for Vercel deployment
const socket = io(API_BASE_URL, {
  transports: ['polling', 'websocket'], // Use polling first, then try websocket
  path: '/socket.io/',
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnection: true,
  forceNew: true
});

// Handle connection events
socket.on('connect', () => {
  console.log('Connected to Socket.io server!');
});

socket.on('connect_error', (error) => {
  console.error('Socket.io connection error:', error);
});

socket.on('error', (error) => {
  console.error('Socket.io error:', error);
});

export default socket
