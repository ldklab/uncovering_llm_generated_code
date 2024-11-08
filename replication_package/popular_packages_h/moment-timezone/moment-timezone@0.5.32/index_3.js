const momentTimezone = require("./moment-timezone");
const latestTimezoneData = require('./data/packed/latest.json');

momentTimezone.tz.load(latestTimezoneData);

module.exports = momentTimezone;
