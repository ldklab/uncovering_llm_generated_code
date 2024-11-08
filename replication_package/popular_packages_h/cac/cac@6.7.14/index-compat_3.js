const { cac, CAC, Command } = require('./dist/index');

// Export cac as both named and default export
module.exports = {
  default: cac,
  cac,
  CAC,
  Command,
};

// Reference compatibility: module.exports = cac;
