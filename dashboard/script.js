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

        // Header: name + status
        const header = document.createElement('div');
        header.className = 'tile-header';

        const input = document.createElement('input');
        input.value = t.name;
        input.onchange = () => { teacherTiles[input.value] = tile; t.name = input.value; };
        header.appendChild(input);

        const status = document.createElement('div');
        status.className = 'status';
        header.appendChild(status);

        tile.appendChild(header);

        // Images
        const imgContainer = document.createElement('div');
        imgContainer.className = 'tile-images';

        const screenImg = document.createElement('img');
        screenImg.alt = 'Screen';
        imgContainer.appendChild(screenImg);

        const webcamImg = document.createElement('img');
        webcamImg.alt = 'Webcam';
        imgContainer.appendChild(webcamImg);

        tile.appendChild(imgContainer);

        dashboard.appendChild(tile);
        teacherTiles[t.name] = tile;
      }

      // Update status
      tile.querySelector('.status').style.background = t.online ? 'green' : 'red';

      // Update images
      tile.querySelectorAll('.tile-images img')[0].src = t.screen ? `data:image/jpeg;base64,${t.screen}` : '';
      tile.querySelectorAll('.tile-images img')[1].src = t.webcam ? `data:image/jpeg;base64,${t.webcam}` : '';
    });
  }
};