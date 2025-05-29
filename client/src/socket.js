import { io } from 'socket.io-client'
import { API_BASE_URL } from './config'

// Use the configured backend URL
const socket = io(API_BASE_URL)

export default socket
