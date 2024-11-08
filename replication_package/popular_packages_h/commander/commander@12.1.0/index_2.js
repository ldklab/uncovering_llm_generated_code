const { Argument, Command, CommanderError, InvalidArgumentError, Help, Option } = require('./lib');

const program = new Command();

function createCommand(name) {
  return new Command(name);
}

function createOption(flags, description) {
  return new Option(flags, description);
}

function createArgument(name, description) {
  return new Argument(name, description);
}

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
  InvalidOptionArgumentError: InvalidArgumentError  // Deprecated
};
