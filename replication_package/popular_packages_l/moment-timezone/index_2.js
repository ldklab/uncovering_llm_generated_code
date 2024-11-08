markdown
// package.json
{
  "name": "moment-timezone-example",
  "version": "1.0.0",
  "description": "Example usage of Moment Timezone for time zone conversion and formatting",
  "main": "app.js",
  "scripts": {
    "start": "node app.js"
  },
  "dependencies": {
    "moment": "^2.29.1",
    "moment-timezone": "^0.5.34"
  },
  "author": "",
  "license": "MIT"
}

// app.js
const moment = require('moment-timezone');

function displayConvertedTimes(dateInput) {
  const parsedDate = moment(dateInput);

  const timeZones = [
    'America/Los_Angeles',
    'America/New_York',
    'Asia/Tokyo',
    'Australia/Sydney'
  ];

  timeZones.forEach(timeZone => {
    console.log(`${timeZone}: ${parsedDate.tz(timeZone).format('ha z')}`);
  });
}

console.log('Converted Times for June 1, 2014 12:00 UTC');
displayConvertedTimes("2014-06-01T12:00:00Z");

console.log('Converted Times for December 1, 2014 12:00 UTC');
displayConvertedTimes("2014-12-01T12:00:00Z");
