import { io } from 'socket.io-client'

const socket = io('http://localhost:5000') // or just `io()` if using Vite proxy

export default socket
