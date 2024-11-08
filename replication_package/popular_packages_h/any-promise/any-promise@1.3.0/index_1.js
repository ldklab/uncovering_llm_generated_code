const register = require('./register');
const result = register();
module.exports = result.Promise;
