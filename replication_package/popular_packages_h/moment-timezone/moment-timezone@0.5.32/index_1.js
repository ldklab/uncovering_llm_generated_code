// Import the moment-timezone module for extended date functionalities with timezone support
const momentTimezone = require("./moment-timezone");

// Load the most recent timezone data into moment-timezone
momentTimezone.tz.load(require('./data/packed/latest.json'));

// Export the configured momentTimezone for use in other modules
module.exports = momentTimezone;
