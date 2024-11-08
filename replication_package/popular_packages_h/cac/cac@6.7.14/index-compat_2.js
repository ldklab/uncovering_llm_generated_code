const { cac, CAC, Command } = require('./dist/index');

// Main export of the module
exports = module.exports = cac;

// Additional exports for compatibility and additional tools
exports.default = cac;
exports.cac = cac;
exports.CAC = CAC;
exports.Command = Command;
