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

  useEffect(() => {
    socket.emit('join-room', { roomId })

    return () => {
      socket.emit('leave-room', { roomId })
    }
  }, [roomId])

  const handleGoBack = () => {
    navigate('/')
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={handleGoBack} style={styles.backButton}>
          ← Back
        </button>
        <h2 style={styles.roomInfo}>Room: {roomId}</h2>
      </div>
      
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
    fontSize: '1.2rem'
  },
  canvasContainer: {
    flex: 1,
    overflow: 'hidden',
    position: 'relative'
  }
}

export default Whiteboard
