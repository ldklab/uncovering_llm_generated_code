const moment = require("./moment-timezone");
moment.tz.load(require('./data/packed/latest.json'));
module.exports = moment;
