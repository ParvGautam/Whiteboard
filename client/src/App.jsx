import React from 'react';
import { Routes, Route } from 'react-router-dom';
import RoomJoin from './components/RoomJoin';
import Whiteboard from './components/Whiteboard';

function App() {
  return (
    <Routes>
      <Route path="/" element={<RoomJoin />} />
      <Route path="/room/:roomId" element={<Whiteboard />} />
    </Routes>
  );
}

export default App;
