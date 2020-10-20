const aphorisms = require('./aphorisms.json');
const storage = require('node-persist');

async function getAphorismOfTheDay() {
  await storage.init({ dir: 'models/aphorism/storage' });
  let aphorism = await storage.getItem('aphorism');
  if (!aphorism) {
    aphorism = await refreshAphorism();
  }

  const now = new Date(Date.now());
  const storedDate = new Date(aphorism[1]);

  if (!sameDay(now, storedDate)) {
    aphorism = await refreshAphorism();
  }
  return aphorism[0];
}

async function refreshAphorism() {
  await storage.setItem('aphorism', [getRandomAphorism(), Date.now()]);
  return await storage.getItem('aphorism');
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
