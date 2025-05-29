# Real-Time Collaborative Whiteboard

A collaborative whiteboard application built with the MERN stack (MongoDB, Express.js, React.js, Node.js) and Socket.io for real-time collaboration.

## Features

- Real-time drawing synchronization across all connected users
- Live cursor tracking of all participants
- Simple room-based collaboration (no authentication required)
- Adjustable stroke width and color selection
- Canvas clearing functionality

## Table of Contents

- [Setup Instructions](#setup-instructions)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
  - [REST Endpoints](#rest-endpoints)
  - [Socket Events](#socket-events)
- [Architecture Overview](#architecture-overview)
  - [Frontend Architecture](#frontend-architecture)
  - [Backend Architecture](#backend-architecture)
  - [Data Flow](#data-flow)
- [Deployment Guide](#deployment-guide)
  - [Backend Deployment](#backend-deployment)
  - [Frontend Deployment](#frontend-deployment)
  - [Environment Variables](#environment-variables)

## Setup Instructions

### Prerequisites

- Node.js (v14+)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd whiteboard
```

2. Install server dependencies:

```bash
cd server
npm install
```

3. Install client dependencies:

```bash
cd ../client
npm install
```

4. Configure MongoDB:

   - For local MongoDB:
     - Ensure MongoDB is running on your system
     - The server will connect to `mongodb://localhost:27017/whiteboard` by default

   - For MongoDB Atlas:
     - Create a MongoDB Atlas account and cluster
     - Update the connection string in `server/server.js`

### Running the Application

1. Start the server:

```bash
cd server
npm run dev
```

2. Start the client:

```bash
cd client
npm run dev
```

3. Access the application:
   - Open your browser and navigate to `http://localhost:5173`
   - Enter a room code (6-8 alphanumeric characters) to create or join a room
   - Share the room code with others to collaborate

## API Documentation

### REST Endpoints

#### Room Management

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|--------------|----------|
| `/api/rooms/join` | POST | Join or create a room | `{ roomId: string }` | `{ message: string, roomId: string }` |
| `/api/rooms/:roomId` | GET | Get room information | - | Room object with drawing data |

### Socket Events

#### Client to Server Events

| Event | Description | Payload |
|-------|-------------|---------|
| `join-room` | Join a whiteboard room | `{ roomId: string }` |
| `leave-room` | Leave current room | `{ roomId: string }` |
| `cursor-move` | Update cursor position | `{ roomId: string, x: number, y: number }` |
| `draw-start` | Start a drawing stroke | `{ roomId: string, stroke: { start: {x, y}, color: string, width: number } }` |
| `draw-move` | Continue a drawing stroke | `{ roomId: string, point: {x, y} }` |
| `draw-end` | End a drawing stroke | `{ roomId: string }` |
| `clear-canvas` | Clear the entire canvas | `{ roomId: string }` |

#### Server to Client Events

| Event | Description | Payload |
|-------|-------------|---------|
| `user-count` | Update connected user count | `number` |
| `cursor-move` | Update a user's cursor position | `{ userId: string, x: number, y: number }` |
| `remote-draw-start` | Notify about stroke started | `{ socketId: string, stroke: Object }` |
| `remote-draw-move` | Notify about stroke continuation | `{ socketId: string, point: {x, y} }` |
| `remote-draw-end` | Notify about stroke end | `{ socketId: string }` |
| `remote-clear-canvas` | Notify to clear canvas | - |

## Architecture Overview

### Frontend Architecture

The client application is built with React.js and uses the following key components:

- **RoomJoin**: Handles room creation and joining
- **Whiteboard**: Main container component that coordinates all whiteboard functions
- **DrawingCanvas**: Manages drawing operations on the HTML5 Canvas
- **Toolbar**: Provides controls for stroke color, width, and canvas clearing
- **UserCursors**: Displays other users' cursor positions in real-time

Socket.io client is used for real-time communication with the server.

### Backend Architecture

The server is built with Node.js and Express.js, with the following components:

- **Express Server**: Handles HTTP requests and serves API endpoints
- **Socket.io Server**: Manages real-time WebSocket connections
- **MongoDB Database**: Stores room data and drawing commands
- **Room Model**: Defines the schema for storing room and drawing data

### Data Flow

1. **Room Creation/Joining**:
   - User enters a room code
   - Client sends a request to the server to join/create a room
   - Server creates the room if it doesn't exist and adds the user to it

2. **Drawing Synchronization**:
   - User starts drawing on their canvas
   - Drawing data is sent to the server via Socket.io
   - Server broadcasts the drawing data to all other users in the room
   - Other clients receive the data and render it on their canvases

3. **Cursor Tracking**:
   - User moves their mouse over the canvas
   - Position data is sent to the server
   - Server broadcasts the position to all other users
   - Other clients render the cursor position with a unique color

## Deployment Guide

### Backend Deployment

#### Deploying to Heroku

1. Create a Heroku account and install the Heroku CLI
2. Initialize a Git repository (if not already done)
3. Create a new Heroku app:

```bash
heroku create your-whiteboard-app-name
```

4. Set up environment variables:

```bash
heroku config:set MONGODB_URI=your-mongodb-connection-string
```

5. Deploy the application:

```bash
git subtree push --prefix server heroku main
```

#### Deploying with Docker

1. Create a `Dockerfile` in the server directory:

```dockerfile
FROM node:14
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

2. Build and run the Docker container:

```bash
docker build -t whiteboard-server .
docker run -p 5000:5000 -e MONGODB_URI=your-mongodb-uri whiteboard-server
```

### Frontend Deployment

#### Deploying to Netlify or Vercel

1. Update the Socket.io connection in `client/src/socket.js` to use the deployed backend URL
2. Build the React application:

```bash
cd client
npm run build
```

3. Deploy using Netlify or Vercel CLI, or connect your GitHub repository to their services for automatic deployments

### Environment Variables

#### Backend (server/.env)

```
PORT=5000
MONGODB_URI=your-mongodb-connection-string
CLIENT_URL=your-frontend-url
```

#### Frontend (client/.env)

```
VITE_API_URL=your-backend-url
```

## License

MIT

## Contributors

- Your Name - Initial work 