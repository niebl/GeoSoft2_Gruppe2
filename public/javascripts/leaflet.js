var map = L.map('map').setView([0, 0], 4);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 13
}).addTo(map);


L.marker([0,0])
  .bindPopup('Null Island!')
  .addTo(map);
