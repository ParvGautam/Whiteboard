import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import DrawingCanvas from './DrawingCanvas'
import Toolbar from './Toolbar'
import UserCursors from './UserCursors'
import socket from '../socket'

function Whiteboard() {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const [strokeColor, setStrokeColor] = useState('black')
  const [strokeWidth, setStrokeWidth] = useState(2)
  const [socketConnected, setSocketConnected] = useState(socket.connected)
  const [connectionError, setConnectionError] = useState(null)

  useEffect(() => {
    // Handle socket connection status
    const onConnect = () => {
      console.log('Socket connected successfully');
      setSocketConnected(true);
      setConnectionError(null);
      
      // Only join room when connection is established
      socket.emit('join-room', { roomId });
    };

    const onDisconnect = () => {
      console.log('Socket disconnected');
      setSocketConnected(false);
    };

    const onConnectError = (err) => {
      console.error('Socket connection error:', err);
      setSocketConnected(false);
      setConnectionError(`Connection error: ${err.message}`);
    };

    // Register socket event handlers
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);

    // Initial connection status
    if (socket.connected) {
      socket.emit('join-room', { roomId });
    }

    // Cleanup function
    return () => {
      // Remove event listeners
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      
      // Leave room when component unmounts
      socket.emit('leave-room', { roomId });
    }
  }, [roomId])

  const handleGoBack = () => {
    navigate('/')
  }

  // Function to attempt reconnection
  const handleReconnect = () => {
    socket.connect();
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={handleGoBack} style={styles.backButton}>
          ← Back
        </button>
        <h2 style={styles.roomInfo}>Room: {roomId}</h2>
        <div style={styles.connectionStatus}>
          {socketConnected ? (
            <span style={styles.connected}>● Connected</span>
          ) : (
            <span style={styles.disconnected}>● Disconnected</span>
          )}
        </div>
      </div>
      
      {/* Show error message if connection fails */}
      {connectionError && (
        <div style={styles.errorBanner}>
          {connectionError}
          <button onClick={handleReconnect} style={styles.reconnectButton}>
            Try Again
          </button>
        </div>
      )}
      
      <Toolbar
        strokeColor={strokeColor}
        setStrokeColor={setStrokeColor}
        strokeWidth={strokeWidth}
        setStrokeWidth={setStrokeWidth}
      />
      
      <div style={styles.canvasContainer}>
        <DrawingCanvas
          roomId={roomId}
          strokeColor={strokeColor}
          strokeWidth={strokeWidth}
          socketConnected={socketConnected}
        />
      </div>
      
      <UserCursors roomId={roomId} />
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    overflow: 'hidden'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px',
    backgroundColor: '#333',
    color: 'white'
  },
  backButton: {
    padding: '5px 10px',
    backgroundColor: '#555',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginRight: '15px'
  },
  roomInfo: {
    margin: 0,
    fontSize: '1.2rem',
    flex: 1
  },
  canvasContainer: {
    flex: 1,
    overflow: 'hidden',
    position: 'relative'
  },
  connectionStatus: {
    fontSize: '0.8rem',
    marginLeft: '10px'
  },
  connected: {
    color: '#4caf50'
  },
  disconnected: {
    color: '#f44336'
  },
  errorBanner: {
    backgroundColor: '#ffebee',
    color: '#d32f2f',
    padding: '8px 16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  reconnectButton: {
    backgroundColor: '#d32f2f',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '4px 8px',
    cursor: 'pointer'
  }
}

export default Whiteboard
