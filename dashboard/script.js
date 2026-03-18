const ws = new WebSocket("ws://localhost:3000"); // your server

ws.onopen = () => {
    ws.isIT = true;
    console.log("Connected to server");
};

let devices = {};

ws.onmessage = (msg) => {
    let data = JSON.parse(msg.data);

    // Screenshare frames
    if (data.type === "SCREEN") {
        if (!devices[data.device_id]) { createTile(data.device_id); }
        document.getElementById(data.device_id).src = "data:image/jpeg;base64," + data.image;
    }

    // Webcam frames
    if (data.type === "WEBCAM_FRAME") {
        let img = document.getElementById("webcam-img-" + data.device_id);
        if (img) img.src = "data:image/jpeg;base64," + data.image;
    }

    // Mic audio frames
    if (data.type === "MIC_FRAME") {
        let audio = new Audio("data:audio/wav;base64," + data.audio);
        audio.play();
    }
};

// Create a new tile
function createTile(id) {
    let div = document.createElement("div");
    div.className = "tile";
    div.id = "tile-" + id;

    // Screenshare image
    let img = document.createElement("img");
    img.id = id;

    img.onclick = () => {
        ws.send(JSON.stringify({
            type: "CONTROL",
            device_id: id,
            x: 100,
            y: 100
        }));
    };

    div.appendChild(img);

    // Icons container
    let iconDiv = document.createElement("div");
    iconDiv.className = "icons";

    // Mic icon
    let micIcon = document.createElement("span");
    micIcon.className = "icon mic";
    micIcon.innerText = "🎤";
    micIcon.onclick = () => {
        ws.send(JSON.stringify({ type: "MIC_START", device_id: id }));
    };

    // Speaker icon
    let speakerIcon = document.createElement("span");
    speakerIcon.className = "icon speaker";
    speakerIcon.innerText = "🔊";
    speakerIcon.onclick = () => {
        ws.send(JSON.stringify({ type: "SPEAKER_START", device_id: id }));
    };

    // Webcam icon
    let webcamIcon = document.createElement("span");
    webcamIcon.className = "icon webcam";
    webcamIcon.innerText = "📷";
    webcamIcon.onclick = () => toggleWebcam(id);

    iconDiv.appendChild(micIcon);
    iconDiv.appendChild(speakerIcon);
    iconDiv.appendChild(webcamIcon);

    div.appendChild(iconDiv);
    document.getElementById("grid").appendChild(div);
    devices[id] = true;
}

// Toggle inline webcam popup beside tile
function toggleWebcam(id) {
    // Remove existing popup for this tile
    let existing = document.getElementById("webcam-popup-" + id);
    if (existing) {
        existing.remove();
        return;
    }

    let div = document.createElement("div");
    div.className = "webcam-popup";
    div.id = "webcam-popup-" + id;

    let img = document.createElement("img");
    img.id = "webcam-img-" + id;

    div.appendChild(img);

    // Append popup **inline beside the tile**
    let tile = document.getElementById("tile-" + id);
    tile.appendChild(div);

    // Request teacher to start webcam streaming
    ws.send(JSON.stringify({ type: "WEBCAM_START", device_id: id }));
}