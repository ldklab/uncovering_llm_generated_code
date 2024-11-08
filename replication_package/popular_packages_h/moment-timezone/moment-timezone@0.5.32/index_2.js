// Import the 'moment-timezone' library which is based on 'moment'
const moment = require("./moment-timezone");

// Load the latest timezone data from the specified JSON file
moment.tz.load(require('./data/packed/latest.json'));

// Export the configured 'moment' object for use in other parts of the application
module.exports = moment;
