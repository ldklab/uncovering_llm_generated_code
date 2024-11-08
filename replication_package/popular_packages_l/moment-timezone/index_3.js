markdown
// package.json
{
  "name": "zonify-example",
  "version": "1.0.0",
  "description": "A simple app for converting and formatting specific time instances across multiple time zones",
  "main": "app.js",
  "scripts": {
    "start": "node app.js"
  },
  "dependencies": {
    "moment": "^2.29.2",
    "moment-timezone": "^0.5.38"
  },
  "author": "",
  "license": "MIT"
}

// app.js
const moment = require('moment-timezone');

// Converts and displays given UTC time to different time zones.
function displayTimeAcrossZones(utcDateString) {
  const dateInUTC = moment(utcDateString); // Creates a Moment object for the provided UTC date string.
  
  // List of time zones to be considered for conversion and formatting.
  const timeZones = [
    'America/Los_Angeles',
    'America/New_York',
    'Asia/Tokyo',
    'Australia/Sydney'
  ];

  // Iterate through each time zone and log the local time with the respective time zone label.
  timeZones.forEach(zone => {
    console.log(`${zone}: ${dateInUTC.tz(zone).format('hh:mm A z')}`);
  });
}

// Display formatted times across specified zones for the provided date instances.
console.log('Time conversions for June 1, 2014 12:00 UTC');
displayTimeAcrossZones("2014-06-01T12:00:00Z");

console.log('Time conversions for December 1, 2014 12:00 UTC');
displayTimeAcrossZones("2014-12-01T12:00:00Z");
