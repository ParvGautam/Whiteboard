import React, { useEffect, useRef, useState } from 'react'
import socket from '../socket'

function DrawingCanvas({ roomId, strokeColor, strokeWidth }) {
  const canvasRef = useRef(null)
  const [drawing, setDrawing] = useState(false)
  const [_lastPoint, setLastPoint] = useState(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const _ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight - 100

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

    return () => {
      socket.off('remote-draw-start')
      socket.off('remote-draw-move')
      socket.off('remote-clear-canvas')
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
    const start = getMousePos(e)
    setLastPoint(start)
    
    const ctx = canvasRef.current.getContext('2d')
    ctx.beginPath()
    ctx.strokeStyle = strokeColor
    ctx.lineWidth = strokeWidth
    ctx.lineCap = 'round'
    ctx.moveTo(start.x, start.y)

    socket.emit('draw-start', {
      roomId,
      stroke: {
        start,
        color: strokeColor,
        width: strokeWidth
      }
    })
  }

  const handleMouseMove = (e) => {
    if (!drawing) return
    
    const currentPoint = getMousePos(e)
    const ctx = canvasRef.current.getContext('2d')
    
    // Draw locally
    ctx.lineTo(currentPoint.x, currentPoint.y)
    ctx.stroke()
    
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
    
    setLastPoint(currentPoint)
  }

  const handleMouseUp = () => {
    if (drawing) {
      setDrawing(false)
      socket.emit('draw-end', { roomId })
    }
  }

  const handleMouseLeave = () => {
    if (drawing) {
      setDrawing(false)
      socket.emit('draw-end', { roomId })
    }
  }

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      style={{ border: '1px solid #ccc', display: 'block' }}
    />
  )
}

export default DrawingCanvas
