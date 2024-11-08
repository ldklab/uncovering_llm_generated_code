const moment = require("./moment-timezone");
const timezoneData = require('./data/packed/latest.json');

moment.tz.load(timezoneData);

module.exports = moment;
