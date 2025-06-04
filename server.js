const express = require('express');
const WebSocket = require('ws');
const path = require('path');
require('dotenv').config();

const app = express();
const server = app.listen(5000, () => {
    console.log(`Express App running at http://127.0.0.1:5000/landingpage.html`);
});

const wss = new WebSocket.Server({ server });

app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend')));

const chatRouter = require('./route');
app.use('/api', chatRouter);

wss.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('message', (message) => {
        console.log(`Received message: ${message}`);

        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN)
                client.send(message);
        });

    });

    socket.on('close', () => {
        console.log('Client disconnected');
    });
});