const moment = require('moment');
const aphorisms = require('./aphorisms.json');

function getAphorismOfTheWeek() {
  const currentWeekNumber = moment().format('W');
  let aphorism = aphorisms.a[currentWeekNumber]; // hardcoded 'a' aphorism. TODO
  if (!aphorism) {
    aphorism = '.';
  }
  return aphorism;
}

module.exports.getAphorismOfTheWeek = getAphorismOfTheWeek;
