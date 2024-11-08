const { Argument } = require('./lib/argument.js');
const { Command } = require('./lib/command.js');
const { CommanderError, InvalidArgumentError } = require('./lib/error.js');
const { Help } = require('./lib/help.js');
const { Option } = require('./lib/option.js');

const program = new Command();

const createCommand = (name) => new Command(name);
const createOption = (flags, description) => new Option(flags, description);
const createArgument = (name, description) => new Argument(name, description);

// Exporting modules and functions
module.exports = {
  program,
  createCommand,
  createOption,
  createArgument,
  Command,
  Option,
  Argument,
  Help,
  CommanderError,
  InvalidArgumentError,
  InvalidOptionArgumentError: InvalidArgumentError, // Deprecated alias
};
