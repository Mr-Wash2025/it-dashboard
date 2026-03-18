const dashboard = document.getElementById('dashboard');
const ws = new WebSocket(`ws://${window.location.host}/frontend`);

let teacherTiles = {};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if(data.type === 'UPDATE') {
    data.teachers.forEach(t => {
      let tile = teacherTiles[t.name];
      if(!tile){
        // Create tile
        tile = document.createElement('div');
        tile.className = 'tile';

        const input = document.createElement('input');
        input.value = t.name;
        input.onchange = () => {
          teacherTiles[input.value] = tile;
          t.name = input.value;
        };
        tile.appendChild(input);

        const screenImg = document.createElement('img');
        screenImg.alt = 'Screen';
        tile.appendChild(screenImg);

        const webcamImg = document.createElement('img');
        webcamImg.alt = 'Webcam';
        tile.appendChild(webcamImg);

        dashboard.appendChild(tile);
        teacherTiles[t.name] = tile;
      }

      // Update images
      tile.children[1].src = t.screen ? `data:image/jpeg;base64,${t.screen}` : '';
      tile.children[2].src = t.webcam ? `data:image/jpeg;base64,${t.webcam}` : '';
    });
  }
};