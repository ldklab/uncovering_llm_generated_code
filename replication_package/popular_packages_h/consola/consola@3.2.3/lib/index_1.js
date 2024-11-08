const lib = require("../dist/index.cjs");

module.exports = {
  ...lib.consola,
  ...lib
};
