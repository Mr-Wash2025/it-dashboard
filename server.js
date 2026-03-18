const express = require('express');
const { WebSocketServer } = require('ws');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'dashboard')));
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const wss = new WebSocketServer({ server });

let teachers = {};
let frontends = new Set();

wss.on('connection', (ws, req) => {
  if(req.url === '/frontend') frontends.add(ws);

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      const type = data.type;
      const deviceId = data.device_id;
      if (!deviceId) return;

      if (!teachers[deviceId]) {
        teachers[deviceId] = { ws, name: deviceId, lastScreen: null, lastWebcam: null, online: true };
      }
      const teacher = teachers[deviceId];

      if(type === 'REGISTER') console.log(`Device registered: ${deviceId}`);
      if(type === 'SCREEN') teacher.lastScreen = data.image;
      if(type === 'WEBCAM_FRAME') teacher.lastWebcam = data.image;
      if(type === 'MIC_FRAME') teacher.lastMic = data.audio;

      teacher.online = true;

      broadcastToFrontends();
    } catch(err) {
      console.error('Invalid JSON', err);
    }
  });

  ws.on('close', () => {
    // Mark offline if device disconnected
    for (let id in teachers) {
      if (teachers[id].ws === ws) teachers[id].online = false;
    }
    frontends.delete(ws);
    broadcastToFrontends();
  });
});

function broadcastToFrontends() {
  const snapshot = Object.values(teachers).map(t => ({
    name: t.name,
    screen: t.lastScreen,
    webcam: t.lastWebcam,
    online: t.online
  }));

  const message = JSON.stringify({ type: 'UPDATE', teachers: snapshot });
  frontends.forEach(ws => { if(ws.readyState === ws.OPEN) ws.send(message); });
}