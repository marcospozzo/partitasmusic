// initializing the map
const mymap = L.map('mapid').setView([20, 0], 1);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(mymap);

const marker1 = L.marker([40.78593, -73.962481])
  .bindPopup('New York')
  .on('mouseover', function () {
    this.openPopup();
  })
  .on('mouseout', function () {
    this.closePopup();
  })
  .addTo(mymap); // new york

const marker2 = L.marker([35.6762, 139.6503])
  .bindPopup('Tokyo')
  .on('mouseover', function () {
    this.openPopup();
  })
  .on('mouseout', function () {
    this.closePopup();
  })
  .addTo(mymap); // tokyo

const marker3 = L.marker([52.52, 13.405])
  .bindPopup('Berlin')
  .on('mouseover', function () {
    this.openPopup();
  })
  .on('mouseout', function () {
    this.closePopup();
  })
  .addTo(mymap); // berlin

const marker4 = L.marker([19.4326, -99.1332])
  .bindPopup('Mexico DF')
  .on('mouseover', function () {
    this.openPopup();
  })
  .on('mouseout', function () {
    this.closePopup();
  })
  .addTo(mymap); // mexico df

const marker5 = L.marker([34.0522, -118.2437])
  .bindPopup('Los Angeles')
  .on('mouseover', function () {
    this.openPopup();
  })
  .on('mouseout', function () {
    this.closePopup();
  })
  .addTo(mymap); // los angeles

const marker6 = L.marker([-23.5505, -46.6333])
  .bindPopup('Sao Paulo')
  .on('mouseover', function () {
    this.openPopup();
  })
  .on('mouseout', function () {
    this.closePopup();
  })
  .addTo(mymap); // sao paulo

const marker7 = L.marker([-34.6037, -58.3816])
  .bindPopup('Buenos Aires')
  .on('mouseover', function () {
    this.openPopup();
  })
  .on('mouseout', function () {
    this.closePopup();
  })
  .addTo(mymap); // buenos aires
