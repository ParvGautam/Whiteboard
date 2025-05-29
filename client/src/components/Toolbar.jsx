import React from 'react'
import socket from '../socket'

function Toolbar({ strokeColor, setStrokeColor, strokeWidth, setStrokeWidth }) {
  const colors = [
    { name: 'Black', value: 'black' },
    { name: 'Red', value: 'red' },
    { name: 'Blue', value: 'blue' },
    { name: 'Green', value: 'green' },
    { name: 'Purple', value: 'purple' },
    { name: 'Orange', value: 'orange' }
  ]

  const handleClearCanvas = () => {
    const confirmed = window.confirm('Clear the entire canvas for everyone?')
    if (confirmed) {
      socket.emit('clear-canvas')
    }
  }

  return (
    <div className="toolbar" style={styles.toolbar}>
      <div style={styles.toolSection}>
        <label style={styles.label}>🖌️ Color:</label>
        <div style={styles.colorPicker}>
          {colors.map(color => (
            <div 
              key={color.value}
              style={{
                ...styles.colorOption,
                backgroundColor: color.value,
                border: strokeColor === color.value ? '3px solid white' : '1px solid #888'
              }}
              onClick={() => setStrokeColor(color.value)}
              title={color.name}
            />
          ))}
        </div>
      </div>

      <div style={styles.toolSection}>
        <label style={styles.label}>📏 Width: {strokeWidth}px</label>
        <input
          type="range"
          min="1"
          max="20"
          value={strokeWidth}
          onChange={(e) => setStrokeWidth(Number(e.target.value))}
          style={styles.slider}
        />
      </div>

      <div style={styles.toolSection}>
        <button onClick={handleClearCanvas} style={styles.clearButton}>
          🧹 Clear Canvas
        </button>
      </div>
    </div>
  )
}

const styles = {
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '15px',
    backgroundColor: '#222',
    color: 'white',
    borderBottom: '1px solid #444'
  },
  toolSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  label: {
    fontWeight: 'bold',
    minWidth: '80px'
  },
  colorPicker: {
    display: 'flex',
    gap: '8px'
  },
  colorOption: {
    width: '25px',
    height: '25px',
    borderRadius: '50%',
    cursor: 'pointer',
    transition: 'transform 0.1s ease',
    ':hover': {
      transform: 'scale(1.1)'
    }
  },
  slider: {
    width: '150px',
    accentColor: '#4285f4'
  },
  clearButton: {
    padding: '8px 16px',
    backgroundColor: '#ff4d4d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    ':hover': {
      backgroundColor: '#ff3333'
    }
  }
}

export default Toolbar
