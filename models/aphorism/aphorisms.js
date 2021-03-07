const aphorisms = require('./aphorisms.json');
const fs = require('fs');
const aphorismPath = 'models/aphorism/aphorismOfTheDay.json';

function getAphorismOfTheDay() {

  let aphorism;

  if (!fs.existsSync(aphorismPath)) {
    aphorism = refreshAphorism();
  }

  const aphorismData = fs.readFileSync(aphorismPath);
  aphorism = JSON.parse(aphorismData);
  const now = new Date(Date.now());
  const storedDate = new Date(aphorism.timestamp);

  if (!sameDay(now, storedDate)) {
    aphorism = refreshAphorism();
  }

  return aphorism.aphorismOfTheDay;
}

function refreshAphorism() {
  const aphorism = {};

  aphorism.timestamp = Date.now();
  aphorism.aphorismOfTheDay = getRandomAphorism();

  const data = JSON.stringify(aphorism);

  fs.writeFileSync(aphorismPath, data);

  return aphorism;
}

function getRandomAphorism() {
  const keys = Object.keys(aphorisms);
  const aphorism = aphorisms[keys[(keys.length * Math.random()) << 0]];
  return aphorism;
}

function sameDay(d1, d2) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

module.exports.getAphorismOfTheDay = getAphorismOfTheDay;
