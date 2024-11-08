// Import necessary classes from local library files
const { Argument } = require('./lib/argument.js');
const { Command } = require('./lib/command.js');
const { CommanderError, InvalidArgumentError } = require('./lib/error.js');
const { Help } = require('./lib/help.js');
const { Option } = require('./lib/option.js');

// Create and export a default program instance
exports.program = new Command();

// Export factory functions for creating instances
exports.createCommand = (name) => new Command(name);
exports.createOption = (flags, description) => new Option(flags, description);
exports.createArgument = (name, description) => new Argument(name, description);

// Export classes for external use
exports.Command = Command;
exports.Option = Option;
exports.Argument = Argument;
exports.Help = Help;

// Export errors for structured exception handling
exports.CommanderError = CommanderError;
exports.InvalidArgumentError = InvalidArgumentError;
exports.InvalidOptionArgumentError = InvalidArgumentError; // Deprecated
