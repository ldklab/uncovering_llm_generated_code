const lib = require("../dist/index.cjs");

module.exports = { ...lib.consola };

Object.keys(lib).forEach((key) => {
  if (!module.exports.hasOwnProperty(key)) {
    module.exports[key] = lib[key];
  }
});
