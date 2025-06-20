import React, { useEffect, useRef, useState } from 'react'
import socket from '../socket'

function DrawingCanvas({ roomId, strokeColor, strokeWidth, socketConnected = true }) {
  const canvasRef = useRef(null)
  const [drawing, setDrawing] = useState(false)
  const [_lastPoint, setLastPoint] = useState(null)
  const [isLocalDrawing, setIsLocalDrawing] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    const _ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight - 100

    // Function to replay drawing from saved data
    const replayDrawing = (drawingData) => {
      if (!drawingData || !drawingData.length) return;
      
      const ctx = canvas.getContext('2d')
      
      let currentStroke = null;
      
      // Process each drawing command in sequence
      drawingData.forEach(cmd => {
        if (cmd.type === 'clear') {
          // Clear the entire canvas
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        else if (cmd.type === 'stroke-start') {
          // Start a new stroke
          currentStroke = cmd.data;
          ctx.beginPath();
          ctx.strokeStyle = currentStroke.color;
          ctx.lineWidth = currentStroke.width;
          ctx.lineCap = 'round';
          ctx.moveTo(currentStroke.start.x, currentStroke.start.y);
        }
        else if (cmd.type === 'stroke-move' && currentStroke) {
          // Continue the current stroke
          const point = cmd.data.point;
          ctx.lineTo(point.x, point.y);
          ctx.stroke();
        }
        // stroke-end doesn't need specific handling in replay
      });
    };

    // Incoming draw events
    socket.on('remote-draw-start', ({ stroke }) => {
      const ctx = canvas.getContext('2d')
      ctx.beginPath()
      ctx.strokeStyle = stroke.color
      ctx.lineWidth = stroke.width
      ctx.lineCap = 'round'
      ctx.moveTo(stroke.start.x, stroke.start.y)
    })

    socket.on('remote-draw-move', ({ point }) => {
      const ctx = canvas.getContext('2d')
      ctx.lineTo(point.x, point.y)
      ctx.stroke()
    })

    socket.on('remote-clear-canvas', () => {
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    })

    // Handle loading saved drawing data
    socket.on('load-drawing', ({ drawingData }) => {
      console.log('Received saved drawing data', drawingData.length);
      replayDrawing(drawingData);
    });

    return () => {
      socket.off('remote-draw-start')
      socket.off('remote-draw-move')
      socket.off('remote-clear-canvas')
      socket.off('load-drawing')
    }
  }, [roomId])

  const getMousePos = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }
  }

  const handleMouseDown = (e) => {
    setDrawing(true)
    setIsLocalDrawing(true)
    const start = getMousePos(e)
    setLastPoint(start)
    
    const ctx = canvasRef.current.getContext('2d')
    ctx.beginPath()
    ctx.strokeStyle = strokeColor
    ctx.lineWidth = strokeWidth
    ctx.lineCap = 'round'
    ctx.moveTo(start.x, start.y)

    // Only send to server if socket is connected
    if (socketConnected) {
      socket.emit('draw-start', {
        roomId,
        stroke: {
          start,
          color: strokeColor,
          width: strokeWidth
        }
      })
    }
  }

  const handleMouseMove = (e) => {
    if (!drawing) return
    
    const currentPoint = getMousePos(e)
    const ctx = canvasRef.current.getContext('2d')
    
    // Draw locally
    ctx.lineTo(currentPoint.x, currentPoint.y)
    ctx.stroke()
    
    // Only send to server if socket is connected
    if (socketConnected) {
      // Send to others
      socket.emit('draw-move', { 
        roomId, 
        point: currentPoint 
      })
      
      // Update cursor position for others
      socket.emit('cursor-move', { 
        roomId, 
        x: e.clientX, 
        y: e.clientY 
      })
    }
    
    setLastPoint(currentPoint)
  }

  const handleMouseUp = () => {
    if (drawing) {
      setDrawing(false)
      setIsLocalDrawing(false)
      
      // Only send to server if socket is connected
      if (socketConnected) {
        socket.emit('draw-end', { roomId })
      }
    }
  }

  const handleMouseLeave = () => {
    if (drawing) {
      setDrawing(false)
      setIsLocalDrawing(false)
      
      // Only send to server if socket is connected
      if (socketConnected) {
        socket.emit('draw-end', { roomId })
      }
    }
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        style={{ border: '1px solid #ccc', display: 'block' }}
      />
      
      {!socketConnected && !isLocalDrawing && (
        <div style={styles.offlineOverlay}>
          <div style={styles.offlineMessage}>
            Offline Mode: You can draw, but changes won't be saved or shared until reconnected
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  offlineOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: '10px',
    zIndex: 10,
  },
  offlineMessage: {
    color: 'white',
    textAlign: 'center',
    fontSize: '14px'
  }
};

export default DrawingCanvas
