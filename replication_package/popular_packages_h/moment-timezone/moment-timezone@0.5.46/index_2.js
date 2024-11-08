const moment = require("./moment-timezone");

// Load timezone data into the moment-timezone library
moment.tz.load(require('./data/packed/latest.json'));

// Export the configured moment for use in other modules
module.exports = moment;
