const express = require('express');
const WebSocket = require('ws');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Serve static files from frontend/
app.use(express.static(path.join(__dirname, 'frontend')));
app.use(express.json());

// Serve landingpage.html at root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'landingpage.html'));
});

// API routes (if any)
const chatRouter = require('./route');
app.use('/api', chatRouter);

// Start the server
const server = app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

// WebSocket server
const wss = new WebSocket.Server({ server });

wss.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('message', (message) => {
        console.log(`Received message: ${message}`);
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    socket.on('close', () => {
        console.log('Client disconnected');
    });
});
