markdown
// package.json
{
  "name": "moment-timezone-example",
  "version": "1.0.0",
  "description": "Example usage of Moment Timezone for time zone conversion and formatting",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "moment": "^2.29.1",
    "moment-timezone": "^0.5.34"
  },
  "author": "",
  "license": "MIT"
}

// index.js
const moment = require('moment-timezone');

function formatTimes(dateString) {
  const date = moment(dateString);

  const zones = [
    'America/Los_Angeles',
    'America/New_York',
    'Asia/Tokyo',
    'Australia/Sydney'
  ];

  zones.forEach(zone => {
    console.log(`${zone}: ${date.tz(zone).format('ha z')}`);
  });
}

console.log('Times for June 1, 2014 12:00 UTC');
formatTimes("2014-06-01T12:00:00Z");

console.log('Times for December 1, 2014 12:00 UTC');
formatTimes("2014-12-01T12:00:00Z");
