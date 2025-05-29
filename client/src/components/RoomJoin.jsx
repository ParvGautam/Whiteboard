import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

function RoomJoin() {
  const [roomCode, setRoomCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const generateRandomRoomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setRoomCode(result);
  };

  const handleJoin = async () => {
    if (!roomCode || roomCode.length < 6 || roomCode.length > 8) {
      setError('Room code must be 6–8 alphanumeric characters.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await axios.post(`${API_BASE_URL}/api/rooms/join`, { roomId: roomCode });
      navigate(`/room/${roomCode}`);
    } catch (err) {
      setError('Error joining room. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Collaborative Whiteboard</h1>
        <p style={styles.subtitle}>Join a whiteboard room to start drawing together</p>
        
        <div style={styles.inputGroup}>
          <input
            type="text"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            placeholder="Enter Room Code"
            maxLength={8}
            style={styles.input}
          />
          <button 
            onClick={generateRandomRoomCode} 
            style={styles.generateButton}
            title="Generate Random Room Code"
          >
            🎲
          </button>
        </div>
        
        {error && <p style={styles.error}>{error}</p>}
        
        <button 
          onClick={handleJoin} 
          style={styles.joinButton}
          disabled={isLoading}
        >
          {isLoading ? 'Connecting...' : 'Join Room'}
        </button>
        
        <p style={styles.hint}>
          Enter an existing room code to join, or enter a new code to create a room.
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '20px'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    padding: '40px',
    maxWidth: '500px',
    width: '100%',
    textAlign: 'center'
  },
  title: {
    color: '#333',
    marginTop: 0,
    marginBottom: '10px'
  },
  subtitle: {
    color: '#666',
    marginBottom: '30px'
  },
  inputGroup: {
    display: 'flex',
    marginBottom: '15px'
  },
  input: {
    flex: 1,
    padding: '12px 15px',
    fontSize: '16px',
    border: '1px solid #ddd',
    borderRadius: '4px 0 0 4px',
    outline: 'none'
  },
  generateButton: {
    padding: '0 15px',
    backgroundColor: '#4285f4',
    color: 'white',
    border: 'none',
    borderRadius: '0 4px 4px 0',
    cursor: 'pointer',
    fontSize: '18px'
  },
  joinButton: {
    padding: '12px 25px',
    backgroundColor: '#4285f4',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    width: '100%',
    fontSize: '16px',
    marginBottom: '20px',
    transition: 'background-color 0.2s ease'
  },
  error: {
    color: '#d93025',
    marginBottom: '15px'
  },
  hint: {
    color: '#888',
    fontSize: '14px',
    marginTop: '10px'
  }
};

export default RoomJoin;
