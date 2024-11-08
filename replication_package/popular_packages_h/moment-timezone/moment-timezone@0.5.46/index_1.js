// Import the moment-timezone module and assign it to both moment and module.exports
const moment = require("./moment-timezone");
module.exports = moment;

// Load the timezone data into moment-timezone from the JSON file
const timezoneData = require('./data/packed/latest.json');
moment.tz.load(timezoneData);
