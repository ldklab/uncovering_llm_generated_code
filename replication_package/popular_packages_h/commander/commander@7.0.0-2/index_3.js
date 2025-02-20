const { EventEmitter } = require('events');
const { spawn } = require('child_process');
const { resolve, dirname, basename, extname, join } = require('path');
const { realpathSync, existsSync } = require('fs');

class Help {
  constructor() {
    this.helpWidth = undefined;
    this.sortSubcommands = false;
    this.sortOptions = false;
  }

  visibleCommands(cmd) {
    let cmds = cmd.commands.filter(c => !c._hidden);
    if (cmd._hasImplicitHelpCommand()) {
      const args = cmd._helpCommandnameAndArgs.split(/ +/);
      const helpCommand = cmd.createCommand(args.shift()).helpOption(false);
      helpCommand.description(cmd._helpCommandDescription);
      helpCommand._parseExpectedArgs(args);
      cmds.push(helpCommand);
    }
    if (this.sortSubcommands) {
      cmds.sort((a, b) => a.name().localeCompare(b.name()));
    }
    return cmds;
  }

  visibleOptions(cmd) {
    let opts = cmd.options.filter(o => !o.hidden);
    if (cmd._hasHelpOption && (!cmd._findOption(cmd._helpShortFlag) || !cmd._findOption(cmd._helpLongFlag))) {
      const helpOption = cmd.createOption(
        !cmd._findOption(cmd._helpShortFlag) ? cmd._helpLongFlag : cmd._helpFlags, 
        cmd._helpDescription
      );
      opts.push(helpOption);
    }
    if (this.sortOptions) {
      const getSortKey = option => option.short ? option.short.replace(/^-/, '') : option.long.replace(/^--/, '');
      opts.sort((a, b) => getSortKey(a).localeCompare(getSortKey(b)));
    }
    return opts;
  }

  visibleArguments(cmd) {
    if (cmd._argsDescription && cmd._args.length) {
      return cmd._args.map(argument => ({ term: argument.name, description: cmd._argsDescription[argument.name] || '' }));
    }
    return [];
  }

  subcommandTerm(cmd) {
    const args = cmd._args.map(arg => humanReadableArgName(arg)).join(' ');
    return `${cmd._name}${cmd._aliases.length ? '|' + cmd._aliases[0] : ''}${cmd.options.length ? ' [options]' : ''}${args ? ' ' + args : ''}`;
  }

  optionTerm(option) {
    return option.flags;
  }

  longestSubcommandTermLength(cmd, helper) {
    return helper.visibleCommands(cmd).reduce((max, command) => Math.max(max, helper.subcommandTerm(command).length), 0);
  }

  longestOptionTermLength(cmd, helper) {
    return helper.visibleOptions(cmd).reduce((max, option) => Math.max(max, helper.optionTerm(option).length), 0);
  }

  longestArgumentTermLength(cmd, helper) {
    return helper.visibleArguments(cmd).reduce((max, argument) => Math.max(max, argument.term.length), 0);
  }

  commandUsage(cmd) {
    let cmdName = cmd._name;
    if (cmd._aliases[0]) {
      cmdName = `${cmdName}|${cmd._aliases[0]}`;
    }
    let parentCmdNames = '';
    for (let parentCmd = cmd.parent; parentCmd; parentCmd = parentCmd.parent) {
      parentCmdNames = `${parentCmd.name()} ${parentCmdNames}`;
    }
    return `${parentCmdNames}${cmdName} ${cmd.usage()}`;
  }

  commandDescription(cmd) {
    return cmd.description();
  }

  subcommandDescription(cmd) {
    return cmd.description();
  }

  optionDescription(option) {
    if (option.negate) {
      return option.description;
    }
    const extraInfo = [];
    if (option.argChoices) {
      extraInfo.push(`choices: ${option.argChoices.map(val => JSON.stringify(val)).join(', ')}`);
    }
    if (option.defaultValue !== undefined) {
      extraInfo.push(`default: ${option.defaultValueDescription || JSON.stringify(option.defaultValue)}`);
    }
    return extraInfo.length > 0 ? `${option.description} (${extraInfo.join(', ')})` : option.description;
  }

  formatHelp(cmd, helper) {
    const termWidth = helper.padWidth(cmd, helper);
    const helpWidth = helper.helpWidth || 80;
    const itemIndentWidth = 2;
    const itemSeparatorWidth = 2;
    function formatItem(term, description) {
      if (description) {
        const fullText = `${term.padEnd(termWidth + itemSeparatorWidth)}${description}`;
        return helper.wrap(fullText, helpWidth - itemIndentWidth, termWidth + itemSeparatorWidth);
      }
      return term;
    };

    function formatList(textArray) {
      return textArray.join('\n').replace(/^/gm, ' '.repeat(itemIndentWidth));
    }

    let output = [`Usage: ${helper.commandUsage(cmd)}`, ''];

    const commandDescription = helper.commandDescription(cmd);
    if (commandDescription.length > 0) {
      output = output.concat([commandDescription, '']);
    }

    const argumentList = helper.visibleArguments(cmd).map(arg => formatItem(arg.term, arg.description));
    if (argumentList.length > 0) {
      output = output.concat(['Arguments:', formatList(argumentList), '']);
    }

    const optionList = helper.visibleOptions(cmd).map(option => formatItem(helper.optionTerm(option), helper.optionDescription(option)));
    if (optionList.length > 0) {
      output = output.concat(['Options:', formatList(optionList), '']);
    }

    const commandList = helper.visibleCommands(cmd).map(c => formatItem(helper.subcommandTerm(c), helper.subcommandDescription(c)));
    if (commandList.length > 0) {
      output = output.concat(['Commands:', formatList(commandList), '']);
    }

    return output.join('\n');
  }

  padWidth(cmd, helper) {
    return Math.max(
      helper.longestOptionTermLength(cmd, helper),
      helper.longestSubcommandTermLength(cmd, helper),
      helper.longestArgumentTermLength(cmd, helper)
    );
  };

  wrap(str, width, indent) {
    if (str.match(/[\n]\s+/)) return str;
    const columnWidth = width - indent;
    const minColumnWidth = 40;
    if (columnWidth < minColumnWidth) return str;
    const leadingStr = str.substr(0, indent);
    const columnText = str.substr(indent);
    const indentString = ' '.repeat(indent);
    const regex = new RegExp('.{1,' + (columnWidth - 1) + '}([\\s\u200B]|$)|[^\\s\u200B]+?([\\s\u200B]|$)', 'g');
    const lines = columnText.match(regex) || [];
    return leadingStr + lines.map((line, i) => (line.slice(-1) === '\n' ? line.slice(0, line.length - 1) : '').trimRight()).join('\n');
  }
}

class Option {
  constructor(flags, description) {
    this.flags = flags;
    this.description = description || '';
    this.required = flags.includes('<');
    this.optional = flags.includes('[');
    this.variadic = /\w\.\.\.[>\]]$/.test(flags);
    this.mandatory = false;
    const optionFlags = _parseOptionFlags(flags);
    this.short = optionFlags.shortFlag;
    this.long = optionFlags.longFlag;
    this.negate = this.long && this.long.startsWith('--no-');
    this.defaultValue = undefined;
    this.defaultValueDescription = undefined;
    this.parseArg = undefined;
    this.hidden = false;
    this.argChoices = undefined;
  }

  default(value, description) {
    this.defaultValue = value;
    this.defaultValueDescription = description;
    return this;
  }

  argParser(fn) {
    this.parseArg = fn;
    return this;
  }

  makeOptionMandatory(mandatory = true) {
    this.mandatory = !!mandatory;
    return this;
  }

  hideHelp(hide = true) {
    this.hidden = !!hide;
    return this;
  }

  choices(values) {
    this.argChoices = values;
    this.parseArg = arg => {
      if (!values.includes(arg)) {
        throw new InvalidOptionArgumentError(`Allowed choices are ${values.join(', ')}.`);
      }
      return arg;
    };
    return this;
  }

  name() {
    return this.long ? this.long.replace(/^--/, '') : this.short.replace(/^-/, '');
  }

  attributeName() {
    return camelcase(this.name().replace(/^no-/, ''));
  }

  is(arg) {
    return this.short === arg || this.long === arg;
  }
}

class CommanderError extends Error {
  constructor(exitCode, code, message) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.code = code;
    this.exitCode = exitCode;
    this.nestedError = undefined;
  }
}

class InvalidOptionArgumentError extends CommanderError {
  constructor(message) {
    super(1, 'commander.invalidOptionArgument', message);
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
  }
}

class Command extends EventEmitter {
  constructor(name) {
    super();
    this.commands = [];
    this.options = [];
    this.rawArgs = null;
    this.parent = null;
    this._allowUnknownOption = false;
    this._allowExcessArguments = false;
    this._args = [];
    this._name = name || '';
    this._optionValues = {};
    this._storeOptionsAsProperties = false;
    this._actionResults = [];
    this._actionHandler = null;
    this._executableHandler = false;
    this._executableFile = null;
    this._defaultCommandName = null;
    this._exitCallback = null;
    this._aliases = [];
    this._combineFlagAndOptionalValue = true;
    this._description = '';
    this._argsDescription = undefined;
    this._hidden = false;
    this._hasHelpOption = true;
    this._helpFlags = '-h, --help';
    this._helpDescription = 'display help for command';
    this._helpShortFlag = '-h';
    this._helpLongFlag = '--help';
    this._addImplicitHelpCommand = undefined;
    this._helpCommandName = 'help';
    this._helpCommandnameAndArgs = 'help [command]';
    this._helpCommandDescription = 'display help for command';
    this._helpConfiguration = {};
    this._outputConfiguration = {
      writeOut: str => process.stdout.write(str),
      writeErr: str => process.stderr.write(str),
      getOutHelpWidth: () => process.stdout.isTTY ? process.stdout.columns : undefined,
      getErrHelpWidth: () => process.stderr.isTTY ? process.stderr.columns : undefined,
      outputError: (str, write) => write(str)
    };
  }

  command(nameAndArgs, actionOptsOrExecDesc, execOpts) {
    let desc = actionOptsOrExecDesc;
    let opts = execOpts;
    if (typeof desc === 'object' && desc !== null) {
      opts = desc;
      desc = null;
    }
    opts = opts || {};
    const args = nameAndArgs.split(/ +/);
    const cmd = this.createCommand(args.shift());

    if (desc) {
      cmd.description(desc);
      cmd._executableHandler = true;
    }
    if (opts.isDefault) this._defaultCommandName = cmd._name;

    cmd._outputConfiguration = this._outputConfiguration;

    cmd._hidden = !!(opts.noHelp || opts.hidden);
    cmd._hasHelpOption = this._hasHelpOption;
    cmd._helpFlags = this._helpFlags;
    cmd._helpDescription = this._helpDescription;
    cmd._helpShortFlag = this._helpShortFlag;
    cmd._helpLongFlag = this._helpLongFlag;
    cmd._helpCommandName = this._helpCommandName;
    cmd._helpCommandnameAndArgs = this._helpCommandnameAndArgs;
    cmd._helpCommandDescription = this._helpCommandDescription;
    cmd._helpConfiguration = this._helpConfiguration;
    cmd._exitCallback = this._exitCallback;
    cmd._storeOptionsAsProperties = this._storeOptionsAsProperties;
    cmd._combineFlagAndOptionalValue = this._combineFlagAndOptionalValue;

    cmd._executableFile = opts.executableFile || null;
    this.commands.push(cmd);
    cmd._parseExpectedArgs(args);
    cmd.parent = this;

    if (desc) return this;
    return cmd;
  }

  createCommand(name) {
    return new Command(name);
  }

  createHelp() {
    return Object.assign(new Help(), this.configureHelp());
  }

  configureHelp(configuration) {
    if (configuration === undefined) return this._helpConfiguration;
    this._helpConfiguration = configuration;
    return this;
  }

  configureOutput(configuration) {
    if (configuration === undefined) return this._outputConfiguration;
    Object.assign(this._outputConfiguration, configuration);
    return this;
  }

  addCommand(cmd, opts) {
    if (!cmd._name) throw new Error('Command passed to .addCommand() must have a name');
    function checkExplicitNames(commandArray) {
      commandArray.forEach(cmd => {
        if (cmd._executableHandler && !cmd._executableFile) {
          throw new Error(`Must specify executableFile for deeply nested executable: ${cmd.name()}`);
        }
        checkExplicitNames(cmd.commands);
      });
    }
    checkExplicitNames(cmd.commands);

    opts = opts || {};
    if (opts.isDefault) this._defaultCommandName = cmd._name;
    if (opts.noHelp || opts.hidden) cmd._hidden = true;

    this.commands.push(cmd);
    cmd.parent = this;
    return this;
  }

  arguments(desc) {
    return this._parseExpectedArgs(desc.split(/ +/));
  }

  addHelpCommand(enableOrNameAndArgs, description) {
    if (enableOrNameAndArgs === false) {
      this._addImplicitHelpCommand = false;
    } else {
      this._addImplicitHelpCommand = true;
      if (typeof enableOrNameAndArgs === 'string') {
        this._helpCommandName = enableOrNameAndArgs.split(' ')[0];
        this._helpCommandnameAndArgs = enableOrNameAndArgs;
      }
      this._helpCommandDescription = description || this._helpCommandDescription;
    }
    return this;
  }

  _hasImplicitHelpCommand() {
    if (this._addImplicitHelpCommand === undefined) {
      return this.commands.length && !this._actionHandler && !this._findCommand('help');
    }
    return this._addImplicitHelpCommand;
  }

  _parseExpectedArgs(args) {
    if (!args.length) return;
    args.forEach(arg => {
      const argDetails = { required: false, name: '', variadic: false };
      switch (arg[0]) {
        case '<':
          argDetails.required = true;
          argDetails.name = arg.slice(1, -1);
          break;
        case '[':
          argDetails.name = arg.slice(1, -1);
          break;
      }
      if (argDetails.name.length > 3 && argDetails.name.slice(-3) === '...') {
        argDetails.variadic = true;
        argDetails.name = argDetails.name.slice(0, -3);
      }
      if (argDetails.name) {
        this._args.push(argDetails);
      }
    });
    this._args.forEach((arg, i) => {
      if (arg.variadic && i < this._args.length - 1) {
        throw new Error(`only the last argument can be variadic '${arg.name}'`);
      }
    });
    return this;
  }

  exitOverride(fn) {
    if (fn) {
      this._exitCallback = fn;
    } else {
      this._exitCallback = err => {
        if (err.code !== 'commander.executeSubCommandAsync') {
          throw err;
        }
      };
    }
    return this;
  }

  _exit(exitCode, code, message) {
    if (this._exitCallback) {
      this._exitCallback(new CommanderError(exitCode, code, message));
    }
    process.exit(exitCode);
  }

  action(fn) {
    const listener = args => {
      const expectedArgsCount = this._args.length;
      const actionArgs = args.slice(0, expectedArgsCount);
      if (this._storeOptionsAsProperties) {
        actionArgs[expectedArgsCount] = this;
      } else {
        actionArgs[expectedArgsCount] = this.opts();
      }
      actionArgs.push(this);

      const actionResult = fn.apply(this, actionArgs);
      let rootCommand = this;
      while (rootCommand.parent) {
        rootCommand = rootCommand.parent;
      }
      rootCommand._actionResults.push(actionResult);
    };
    this._actionHandler = listener;
    return this;
  }

  createOption(flags, description) {
    return new Option(flags, description);
  }

  addOption(option) {
    const oname = option.name();
    const name = option.attributeName();

    let defaultValue = option.defaultValue;

    if (option.negate || option.optional || option.required || typeof defaultValue === 'boolean') {
      if (option.negate) {
        const positiveLongFlag = option.long.replace(/^--no-/, '--');
        defaultValue = this._findOption(positiveLongFlag) ? this._getOptionValue(name) : true;
      }
      if (defaultValue !== undefined) {
        this._setOptionValue(name, defaultValue);
      }
    }

    this.options.push(option);

    this.on('option:' + oname, val => {
      const oldValue = this._getOptionValue(name);

      if (val !== null && option.parseArg) {
        try {
          val = option.parseArg(val, oldValue === undefined ? defaultValue : oldValue);
        } catch (err) {
          if (err.code === 'commander.invalidOptionArgument') {
            const message = `error: option '${option.flags}' argument '${val}' is invalid. ${err.message}`;
            this._displayError(err.exitCode, err.code, message);
          }
          throw err;
        }
      } else if (val !== null && option.variadic) {
        if (oldValue === defaultValue || !Array.isArray(oldValue)) {
          val = [val];
        } else {
          val = oldValue.concat(val);
        }
      }

      if (typeof oldValue === 'boolean' || typeof oldValue === 'undefined') {
        if (val == null) {
          this._setOptionValue(name, option.negate ? false : defaultValue || true);
        } else {
          this._setOptionValue(name, val);
        }
      } else if (val !== null) {
        this._setOptionValue(name, option.negate ? false : val);
      }
    });

    return this;
  }

  _optionEx(config, flags, description, fn, defaultValue) {
    const option = this.createOption(flags, description);
    option.makeOptionMandatory(!!config.mandatory);
    if (typeof fn === 'function') {
      option.default(defaultValue).argParser(fn);
    } else if (fn instanceof RegExp) {
      const regex = fn;
      fn = (val, def) => {
        const m = regex.exec(val);
        return m ? m[0] : def;
      };
      option.default(defaultValue).argParser(fn);
    } else {
      option.default(fn);
    }
    return this.addOption(option);
  }

  option(flags, description, fn, defaultValue) {
    return this._optionEx({}, flags, description, fn, defaultValue);
  }

  requiredOption(flags, description, fn, defaultValue) {
    return this._optionEx({ mandatory: true }, flags, description, fn, defaultValue);
  }

  combineFlagAndOptionalValue(combine = true) {
    this._combineFlagAndOptionalValue = !!combine;
    return this;
  }

  allowUnknownOption(allowUnknown = true) {
    this._allowUnknownOption = !!allowUnknown;
    return this;
  }

  allowExcessArguments(allowExcess = true) {
    this._allowExcessArguments = !!allowExcess;
    return this;
  }

  storeOptionsAsProperties(storeAsProperties = true) {
    this._storeOptionsAsProperties = !!storeAsProperties;
    if (this.options.length) {
      throw new Error('call .storeOptionsAsProperties() before adding options');
    }
    return this;
  }

  _setOptionValue(key, value) {
    if (this._storeOptionsAsProperties) {
      this[key] = value;
    } else {
      this._optionValues[key] = value;
    }
  }

  _getOptionValue(key) {
    if (this._storeOptionsAsProperties) {
      return this[key];
    }
    return this._optionValues[key];
  }

  parse(argv, parseOptions) {
    if (argv !== undefined && !Array.isArray(argv)) {
      throw new Error('first parameter to parse must be array or undefined');
    }
    parseOptions = parseOptions || {};

    if (argv === undefined) {
      argv = process.argv;
      if (process.versions && process.versions.electron) {
        parseOptions.from = 'electron';
      }
    }
    this.rawArgs = argv.slice();

    let userArgs;
    switch (parseOptions.from) {
      case undefined:
      case 'node':
        this._scriptPath = argv[1];
        userArgs = argv.slice(2);
        break;
      case 'electron':
        if (process.defaultApp) {
          this._scriptPath = argv[1];
          userArgs = argv.slice(2);
        } else {
          userArgs = argv.slice(1);
        }
        break;
      case 'user':
        userArgs = argv.slice(0);
        break;
      default:
        throw new Error(`unexpected parse option { from: '${parseOptions.from}' }`);
    }
    if (!this._scriptPath && process.mainModule) {
      this._scriptPath = process.mainModule.filename;
    }

    this._name = this._name || (this._scriptPath && basename(this._scriptPath, extname(this._scriptPath)));
    this._parseCommand([], userArgs);

    return this;
  }

  parseAsync(argv, parseOptions) {
    this.parse(argv, parseOptions);
    return Promise.all(this._actionResults).then(() => this);
  }

  _executeSubCommand(subcommand, args) {
    args = args.slice();
    let launchWithNode = false;
    const sourceExt = ['.js', '.ts', '.tsx', '.mjs'];

    this._checkForMissingMandatoryOptions();

    let scriptPath = this._scriptPath;
    if (!scriptPath && process.mainModule) {
      scriptPath = process.mainModule.filename;
    }

    let baseDir;
    try {
      const resolvedLink = realpathSync(scriptPath);
      baseDir = dirname(resolvedLink);
    } catch (e) {
      baseDir = '.';
    }

    let bin = `${basename(scriptPath, extname(scriptPath))}-${subcommand._name}`;
    if (subcommand._executableFile) {
      bin = subcommand._executableFile;
    }

    const localBin = join(baseDir, bin);
    if (existsSync(localBin)) {
      bin = localBin;
    } else {
      sourceExt.forEach(ext => {
        if (existsSync(`${localBin}${ext}`)) {
          bin = `${localBin}${ext}`;
        }
      });
    }
    launchWithNode = sourceExt.includes(extname(bin));

    let proc;
    if (process.platform !== 'win32') {
      if (launchWithNode) {
        args.unshift(bin);
        args = incrementNodeInspectorPort(process.execArgv).concat(args);
        proc = spawn(process.argv[0], args, { stdio: 'inherit' });
      } else {
        proc = spawn(bin, args, { stdio: 'inherit' });
      }
    } else {
      args.unshift(bin);
      args = incrementNodeInspectorPort(process.execArgv).concat(args);
      proc = spawn(process.execPath, args, { stdio: 'inherit' });
    }

    const signals = ['SIGUSR1', 'SIGUSR2', 'SIGTERM', 'SIGINT', 'SIGHUP'];
    signals.forEach(signal => {
      process.on(signal, () => {
        if (proc.killed === false && proc.exitCode === null) {
          proc.kill(signal);
        }
      });
    });

    const exitCallback = this._exitCallback;
    if (!exitCallback) {
      proc.on('close', process.exit.bind(process));
    } else {
      proc.on('close', () => {
        exitCallback(new CommanderError(process.exitCode || 0, 'commander.executeSubCommandAsync', '(close)'));
      });
    }
    proc.on('error', err => {
      if (err.code === 'ENOENT') {
        const executableMissing = `'${bin}' does not exist\n - if '${subcommand._name}' is not meant to be an executable command, remove description parameter from '.command()' and use '.description()' instead\n - if the default executable name is not suitable, use the executableFile option to supply a custom name`;
        throw new Error(executableMissing);
      } else if (err.code === 'EACCES') {
        throw new Error(`'${bin}' not executable`);
      }
      if (!exitCallback) {
        process.exit(1);
      } else {
        const wrappedError = new CommanderError(1, 'commander.executeSubCommandAsync', '(error)');
        wrappedError.nestedError = err;
        exitCallback(wrappedError);
      }
    });

    this.runningCommand = proc;
  }

  _dispatchSubcommand(commandName, operands, unknown) {
    const subCommand = this._findCommand(commandName);
    if (!subCommand) this.help({ error: true });

    if (subCommand._executableHandler) {
      this._executeSubCommand(subCommand, operands.concat(unknown));
    } else {
      subCommand._parseCommand(operands, unknown);
    }
  }

  _parseCommand(operands, unknown) {
    const parsed = this.parseOptions(unknown);
    operands = operands.concat(parsed.operands);
    unknown = parsed.unknown;
    this.args = operands.concat(unknown);

    if (operands && this._findCommand(operands[0])) {
      this._dispatchSubcommand(operands[0], operands.slice(1), unknown);
    } else if (this._hasImplicitHelpCommand() && operands[0] === this._helpCommandName) {
      if (operands.length === 1) {
        this.help();
      } else {
        this._dispatchSubcommand(operands[1], [], [this._helpLongFlag]);
      }
    } else if (this._defaultCommandName) {
      outputHelpIfRequested(this, unknown);
      this._dispatchSubcommand(this._defaultCommandName, operands, unknown);
    } else {
      if (this.commands.length && this.args.length === 0 && !this._actionHandler && !this._defaultCommandName) {
        this.help({ error: true });
      }

      outputHelpIfRequested(this, parsed.unknown);
      this._checkForMissingMandatoryOptions();
      if (parsed.unknown.length > 0) {
        this.unknownOption(parsed.unknown[0]);
      }

      const commandEvent = `command:${this.name()}`;
      if (this._actionHandler) {
        const args = this.args.slice();
        this._args.forEach((arg, i) => {
          if (arg.required && args[i] == null) {
            this.missingArgument(arg.name);
          } else if (arg.variadic) {
            args[i] = args.splice(i);
            args.length = Math.min(i + 1, args.length);
          }
        });
        if (args.length > this._args.length) {
          this._excessArguments(args);
        }

        this._actionHandler(args);
        if (this.parent) this.parent.emit(commandEvent, operands, unknown);
      } else if (this.parent && this.parent.listenerCount(commandEvent)) {
        this.parent.emit(commandEvent, operands, unknown);
      } else if (operands.length) {
        if (this._findCommand('*')) {
          this._dispatchSubcommand('*', operands, unknown);
        } else if (this.listenerCount('command:*')) {
          this.emit('command:*', operands, unknown);
        } else if (this.commands.length) {
          this.unknownCommand();
        }
      } else if (this.commands.length) {
        this.help({ error: true });
      }
    }
  }

  _findCommand(name) {
    if (!name) return undefined;
    return this.commands.find(cmd => cmd._name === name || cmd._aliases.includes(name));
  }

  _findOption(arg) {
    return this.options.find(option => option.is(arg));
  }

  _checkForMissingMandatoryOptions() {
    for (let cmd = this; cmd; cmd = cmd.parent) {
      cmd.options.forEach(option => {
        if (option.mandatory && cmd._getOptionValue(option.attributeName()) === undefined) {
          cmd.missingMandatoryOptionValue(option);
        }
      });
    }
  }

  parseOptions(argv) {
    const operands = [];
    const unknown = [];
    let dest = operands;
    const args = argv.slice();

    function maybeOption(arg) {
      return arg.length > 1 && arg[0] === '-';
    }

    let activeVariadicOption = null;
    while (args.length) {
      const arg = args.shift();

      if (arg === '--') {
        if (dest === unknown) dest.push(arg);
        dest.push(...args);
        break;
      }

      if (activeVariadicOption && !maybeOption(arg)) {
        this.emit(`option:${activeVariadicOption.name()}`, arg);
        continue;
      }
      activeVariadicOption = null;

      if (maybeOption(arg)) {
        const option = this._findOption(arg);
        if (option) {
          if (option.required) {
            const value = args.shift();
            if (value === undefined) this.optionMissingArgument(option);
            this.emit(`option:${option.name()}`, value);
          } else if (option.optional) {
            let value = null;
            if (args.length > 0 && !maybeOption(args[0])) {
              value = args.shift();
            }
            this.emit(`option:${option.name()}`, value);
          } else {
            this.emit(`option:${option.name()}`);
          }
          activeVariadicOption = option.variadic ? option : null;
          continue;
        }
      }

      if (arg.length > 2 && arg[0] === '-' && arg[1] !== '-') {
        const option = this._findOption(`-${arg[1]}`);
        if (option) {
          if (option.required || (option.optional && this._combineFlagAndOptionalValue)) {
            this.emit(`option:${option.name()}`, arg.slice(2));
          } else {
            this.emit(`option:${option.name()}`);
            args.unshift(`-${arg.slice(2)}`);
          }
          continue;
        }
      }

      if (/^--[^=]+=/.test(arg)) {
        const index = arg.indexOf('=');
        const option = this._findOption(arg.slice(0, index));
        if (option && (option.required || option.optional)) {
          this.emit(`option:${option.name()}`, arg.slice(index + 1));
          continue;
        }
      }

      if (arg.length > 1 && arg[0] === '-') {
        dest = unknown;
      }

      dest.push(arg);
    }

    return { operands, unknown };
  }

  opts() {
    if (this._storeOptionsAsProperties) {
      const result = {};
      const len = this.options.length;
      for (let i = 0; i < len; i++) {
        const key = this.options[i].attributeName();
        result[key] = key === this._versionOptionName ? this._version : this[key];
      }
      return result;
    }
    return this._optionValues;
  }

  _displayError(exitCode, code, message) {
    this._outputConfiguration.outputError(`${message}\n`, this._outputConfiguration.writeErr);
    this._exit(exitCode, code, message);
  }

  missingArgument(name) {
    const message = `error: missing required argument '${name}'`;
    this._displayError(1, 'commander.missingArgument', message);
  }

  optionMissingArgument(option, flag) {
    let message;
    if (flag) {
      message = `error: option '${option.flags}' argument missing, got '${flag}'`;
    } else {
      message = `error: option '${option.flags}' argument missing`;
    }
    this._displayError(1, 'commander.optionMissingArgument', message);
  }

  missingMandatoryOptionValue(option) {
    const message = `error: required option '${option.flags}' not specified`;
    this._displayError(1, 'commander.missingMandatoryOptionValue', message);
  }

  unknownOption(flag) {
    if (this._allowUnknownOption) return;
    const message = `error: unknown option '${flag}'`;
    this._displayError(1, 'commander.unknownOption', message);
  }

  _excessArguments(receivedArgs) {
    if (this._allowExcessArguments) return;

    const expected = this._args.length;
    const s = (expected === 1) ? '' : 's';
    const forSubcommand = this.parent ? ` for '${this.name()}'` : '';
    const message = `error: too many arguments${forSubcommand}. Expected ${expected} argument${s} but got ${receivedArgs.length}.`;
    this._displayError(1, 'commander.excessArguments', message);
  }

  unknownCommand() {
    const partCommands = [this.name()];
    for (let parentCmd = this.parent; parentCmd; parentCmd = parentCmd.parent) {
      partCommands.unshift(parentCmd.name());
    }
    const fullCommand = partCommands.join(' ');
    const message = `error: unknown command '${this.args[0]}'.` + (this._hasHelpOption ? ` See '${fullCommand} ${this._helpLongFlag}'.` : '');
    this._displayError(1, 'commander.unknownCommand', message);
  }

  version(str, flags, description) {
    if (str === undefined) return this._version;
    this._version = str;
    flags = flags || '-V, --version';
    description = description || 'output the version number';
    const versionOption = this.createOption(flags, description);
    this._versionOptionName = versionOption.attributeName();
    this.options.push(versionOption);
    this.on('option:' + versionOption.name(), () => {
      this._outputConfiguration.writeOut(`${str}\n`);
      this._exit(0, 'commander.version', str);
    });
    return this;
  }

  description(str, argsDescription) {
    if (str === undefined && argsDescription === undefined) return this._description;
    this._description = str;
    this._argsDescription = argsDescription;
    return this;
  }

  alias(alias) {
    if (alias === undefined) return this._aliases[0];

    let command = this;
    if (this.commands.length !== 0 && this.commands[this.commands.length - 1]._executableHandler) {
      command = this.commands[this.commands.length - 1];
    }
    if (alias === command._name) throw new Error('Command alias can\'t be the same as its name');

    command._aliases.push(alias);
    return this;
  }

  aliases(aliases) {
    if (aliases === undefined) return this._aliases;
    aliases.forEach(alias => this.alias(alias));
    return this;
  }

  usage(str) {
    if (str === undefined) {
      if (this._usage) return this._usage;

      const args = this._args.map(arg => humanReadableArgName(arg));
      return [].concat(
        (this.options.length || this._hasHelpOption ? '[options]' : []),
        (this.commands.length ? '[command]' : []),
        (this._args.length ? args : [])
      ).join(' ');
    }
    this._usage = str;
    return this;
  }

  name(str) {
    if (str === undefined) return this._name;
    this._name = str;
    return this;
  }

  helpInformation(contextOptions) {
    const helper = this.createHelp();
    if (helper.helpWidth === undefined) {
      helper.helpWidth = (contextOptions && contextOptions.error) ? this._outputConfiguration.getErrHelpWidth() : this._outputConfiguration.getOutHelpWidth();
    }
    return helper.formatHelp(this, helper);
  }

  _getHelpContext(contextOptions = {}) {
    const context = { error: !!contextOptions.error };
    let write;
    if (context.error) {
      write = arg => this._outputConfiguration.writeErr(arg);
    } else {
      write = arg => this._outputConfiguration.writeOut(arg);
    }
    context.write = contextOptions.write || write;
    context.command = this;
    return context;
  }

  outputHelp(contextOptions) {
    let deprecatedCallback;
    if (typeof contextOptions === 'function') {
      deprecatedCallback = contextOptions;
      contextOptions = undefined;
    }
    const context = this._getHelpContext(contextOptions);

    const groupListeners = [];
    let command = this;
    while (command) {
      groupListeners.push(command);
      command = command.parent;
    }

    groupListeners.slice().reverse().forEach(cmd => cmd.emit('beforeAllHelp', context));
    this.emit('beforeHelp', context);

    let helpInformation = this.helpInformation(context);
    if (deprecatedCallback) {
      helpInformation = deprecatedCallback(helpInformation);
      if (typeof helpInformation !== 'string' && !Buffer.isBuffer(helpInformation)) {
        throw new Error('outputHelp callback must return a string or a Buffer');
      }
    }
    context.write(helpInformation);

    this.emit(this._helpLongFlag);
    this.emit('afterHelp', context);
    groupListeners.forEach(cmd => cmd.emit('afterAllHelp', context));
  }

  helpOption(flags, description) {
    if (typeof flags === 'boolean') {
      this._hasHelpOption = flags;
      return this;
    }
    this._helpFlags = flags || this._helpFlags;
    this._helpDescription = description || this._helpDescription;

    const helpFlags = _parseOptionFlags(this._helpFlags);
    this._helpShortFlag = helpFlags.shortFlag;
    this._helpLongFlag = helpFlags.longFlag;

    return this;
  }

  help(contextOptions) {
    this.outputHelp(contextOptions);
    let exitCode = process.exitCode || 0;
    if (exitCode === 0 && contextOptions && typeof contextOptions !== 'function' && contextOptions.error) {
      exitCode = 1;
    }
    this._exit(exitCode, 'commander.help', '(outputHelp)');
  }

  addHelpText(position, text) {
    const allowedValues = ['beforeAll', 'before', 'after', 'afterAll'];
    if (!allowedValues.includes(position)) {
      throw new Error(`Unexpected value for position to addHelpText.\nExpecting one of '${allowedValues.join("', '")}'`);
    }
    const helpEvent = `${position}Help`;
    this.on(helpEvent, context => {
      let helpStr;
      if (typeof text === 'function') {
        helpStr = text({ error: context.error, command: context.command });
      } else {
        helpStr = text;
      }
      if (helpStr) {
        context.write(`${helpStr}\n`);
      }
    });
    return this;
  }
}

exports = module.exports = new Command();
exports.program = exports;

exports.Command = Command;
exports.Option = Option;
exports.CommanderError = CommanderError;
exports.InvalidOptionArgumentError = InvalidOptionArgumentError;
exports.Help = Help;

function camelcase(flag) {
  return flag.split('-').reduce((str, word) => {
    return str + word[0].toUpperCase() + word.slice(1);
  });
}

function outputHelpIfRequested(cmd, args) {
  const helpOption = cmd._hasHelpOption && args.find(arg => arg === cmd._helpLongFlag || arg === cmd._helpShortFlag);
  if (helpOption) {
    cmd.outputHelp();
    cmd._exit(0, 'commander.helpDisplayed', '(outputHelp)');
  }
}

function humanReadableArgName(arg) {
  const nameOutput = arg.name + (arg.variadic === true ? '...' : '');
  return arg.required ? '<' + nameOutput + '>' : '[' + nameOutput + ']';
}

function _parseOptionFlags(flags) {
  let shortFlag;
  let longFlag;
  const flagParts = flags.split(/[ |,]+/);
  if (flagParts.length > 1 && !/^[[<]/.test(flagParts[1])) shortFlag = flagParts.shift();
  longFlag = flagParts.shift();
  if (!shortFlag && /^-[^-]$/.test(longFlag)) {
    shortFlag = longFlag;
    longFlag = undefined;
  }
  return { shortFlag, longFlag };
}

function incrementNodeInspectorPort(args) {
  return args.map((arg) => {
    if (!arg.startsWith('--inspect')) {
      return arg;
    }
    let debugOption;
    let debugHost = '127.0.0.1';
    let debugPort = '9229';
    let match;
    if ((match = arg.match(/^(--inspect(-brk)?)$/)) !== null) {
      debugOption = match[1];
    } else if ((match = arg.match(/^(--inspect(-brk|-port)?)=([^:]+)$/)) !== null) {
      debugOption = match[1];
      if (/^\d+$/.test(match[3])) {
        debugPort = match[3];
      } else {
        debugHost = match[3];
      }
    } else if ((match = arg.match(/^(--inspect(-brk|-port)?)=([^:]+):(\d+)$/)) !== null) {
      debugOption = match[1];
      debugHost = match[3];
      debugPort = match[4];
    }

    if (debugOption && debugPort !== '0') {
      return `${debugOption}=${debugHost}:${parseInt(debugPort) + 1}`;
    }
    return arg;
  });
}
