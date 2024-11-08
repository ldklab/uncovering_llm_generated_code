// Import the moment-timezone library and assign it to the moment variable for use in the current module's exports
const moment = module.exports = require('./moment-timezone');

// Load the latest timezone data into the moment-timezone library from a JSON file
const latestTimezoneData = require('./data/packed/latest.json');
moment.tz.load(latestTimezoneData);
