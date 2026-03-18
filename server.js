const WebSocket = require('ws');
const express = require('express');
const path = require('path');

const app = express();

// Serve IT dashboard folder
app.use(express.static(path.join(__dirname, 'dashboard')));

const server = app.listen(process.env.PORT || 3000, () => {
    console.log("Server running on port " + (process.env.PORT || 3000));
});

const wss = new WebSocket.Server({ server });

let clients = {}; // device_id -> ws

wss.on('connection', (ws) => {
    console.log("New connection");

    ws.on('message', (msg) => {
        let data = JSON.parse(msg);

        if (data.type === "REGISTER") {
            clients[data.device_id] = ws;
            ws.device_id = data.device_id;
            console.log("Registered:", data.device_id);
        }

        if (data.type === "SCREEN") {
            // Broadcast to IT dashboard
            wss.clients.forEach(client => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(data));
                }
            });
        }

        if (data.type === "CONTROL") {
            let target = clients[data.device_id];
            if (target) {
                target.send(JSON.stringify(data));
            }
        }
    });

    ws.on('close', () => {
        if (ws.device_id) delete clients[ws.device_id];
    });
});