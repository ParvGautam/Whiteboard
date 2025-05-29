import React, { useEffect, useState } from 'react'
import socket from '../socket'

function UserCursors({ roomId }) {
  const [cursors, setCursors] = useState({})
  const [userCount, setUserCount] = useState(0)

  useEffect(() => {
    const handleCursorMove = ({ userId, x, y }) => {
      setCursors((prev) => ({
        ...prev,
        [userId]: { x, y, lastSeen: Date.now() }
      }))
    }

    const handleUserCount = (count) => {
      setUserCount(count)
    }

    socket.on('cursor-move', handleCursorMove)
    socket.on('user-count', handleUserCount)

    // Track mouse movement to send to other users
    const handleMouseMove = (e) => {
      socket.emit('cursor-move', {
        roomId,
        x: e.clientX,
        y: e.clientY
      })
    }

    // Throttle mouse move events to avoid overwhelming the server
    let throttled = false
    const throttledMouseMove = (e) => {
      if (!throttled) {
        handleMouseMove(e)
        throttled = true
        setTimeout(() => {
          throttled = false
        }, 16) // ~60fps
      }
    }

    window.addEventListener('mousemove', throttledMouseMove)

    // Remove inactive cursors every second
    const interval = setInterval(() => {
      const now = Date.now()
      setCursors((prev) => {
        const updated = {}
        for (let id in prev) {
          if (now - prev[id].lastSeen < 5000) {
            updated[id] = prev[id]
          }
        }
        return updated
      })
    }, 1000)

    return () => {
      socket.off('cursor-move', handleCursorMove)
      socket.off('user-count', handleUserCount)
      window.removeEventListener('mousemove', throttledMouseMove)
      clearInterval(interval)
    }
  }, [roomId])

  const colors = ['red', 'blue', 'green', 'purple', 'orange']

  return (
    <>
      <div className="user-count" style={styles.userCount}>
        👥 Users Online: {userCount}
      </div>
      <div style={styles.cursorsContainer}>
        {Object.entries(cursors).map(([userId, { x, y }], index) => (
          <div
            key={userId}
            style={{
              ...styles.cursor,
              left: x + 'px',
              top: y + 'px',
              color: colors[index % colors.length],
            }}
          >
            🖱️
          </div>
        ))}
      </div>
    </>
  )
}

const styles = {
  cursorsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    pointerEvents: 'none',
    width: '100%',
    height: '100%',
    zIndex: 1000
  },
  cursor: {
    position: 'absolute',
    transform: 'translate(-50%, -50%)',
    fontSize: '1.5rem',
    pointerEvents: 'none'
  },
  userCount: {
    position: 'fixed',
    top: '10px',
    right: '10px',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    padding: '5px 10px',
    borderRadius: '4px',
    fontSize: '14px',
    zIndex: 1001
  }
}

export default UserCursors
