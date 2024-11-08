const { cac, CAC, Command } = require('./dist/index');

// Export the `cac` function, primarily for backwards compatibility
module.exports = cac;

// Extend the exports to include default, cac, CAC, and Command properties
Object.assign(module.exports, {
  default: cac,
  cac,
  CAC,
  Command,
});
