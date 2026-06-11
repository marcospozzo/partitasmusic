const aphorisms = require("./aphorisms.json");
const fs = require("fs").promises;
const aphorismPath = "models/aphorism/aphorismOfTheDay.json";

async function getAphorismOfTheDay() {
  let aphorism;

  try {
    await fs.access(aphorismPath);
    const aphorismData = await fs.readFile(aphorismPath, "utf8");
    aphorism = JSON.parse(aphorismData);
    const now = new Date(Date.now());
    const storedDate = new Date(aphorism.timestamp);
    if (!sameDay(now, storedDate)) {
      aphorism = await refreshAphorism();
    }
  } catch {
    aphorism = await refreshAphorism();
  }

  return aphorism.aphorismOfTheDay;
}

async function refreshAphorism() {
  const aphorism = {
    timestamp: Date.now(),
    aphorismOfTheDay: getRandomAphorism(),
  };
  await fs.writeFile(aphorismPath, JSON.stringify(aphorism));
  return aphorism;
}

function getRandomAphorism() {
  const keys = Object.keys(aphorisms);
  return aphorisms[keys[(keys.length * Math.random()) << 0]];
}

function sameDay(d1, d2) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

module.exports.getAphorismOfTheDay = getAphorismOfTheDay;
