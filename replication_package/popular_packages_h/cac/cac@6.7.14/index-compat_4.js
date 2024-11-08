const { cac, CAC, Command } = require('./dist/index');

// For backwards compatibility and to expose multiple exports
module.exports = {
  default: cac,  // default export
  cac,           // function or class `cac`
  CAC,           // class `CAC`
  Command        // class `Command`
};
