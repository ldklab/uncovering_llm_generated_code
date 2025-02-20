'use strict';

const events = require('events');

function toArr(any) {
  return any == null ? [] : Array.isArray(any) ? any : [any];
}

function toVal(out, key, val, opts) {
  const x = +val;
  const old = out[key];
  const nxt = //~index returns truthy (not -1) if key is present
    !!~opts.string.indexOf(key)
      ? val == null || val === true
        ? ''
        : String(val)
      : typeof val === 'boolean'
      ? val
      : !!~opts.boolean.indexOf(key)
      ? val === 'false'
        ? false
        : val === 'true' || (out._.push(x * 0 === 0 ? x : val), !!val)
      : x * 0 === 0
      ? x
      : val;
  out[key] = old == null ? nxt : Array.isArray(old) ? old.concat(nxt) : [old, nxt];
}

function mri2(args, opts = {}) {
  args = args || [];
  let out = { _: [] };
  const strict = opts.unknown !== void 0;
  const alias = opts.alias || {};
  const defaults = opts.default !== void 0;

  const processAlias = (key, value) => {
    const arr = alias[key] || [];
    arr.forEach((al) => (alias[al] = alias[al] ? alias[al].concat(key) : [key]));
  };

  Object.keys(alias).forEach((k) => processAlias(k, alias[k]));

  const stringOptions = toArr(opts.string);
  const booleanOptions = toArr(opts.boolean);

  stringOptions.forEach(processAlias);
  booleanOptions.forEach(processAlias);

  const keys = strict ? Object.keys(alias) : [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--') {
      out._ = out._.concat(args.slice(i + 1));
      break;
    }

    const isFlag = arg.startsWith('-');
    let name, val;
    
    if (arg.startsWith('no-')) {
      name = arg.slice(3);
      if (strict && !keys.includes(name)) return opts.unknown(arg);
      out[name] = false;
    } else if (isFlag) {
      const idx = arg.indexOf('=') === -1 ? arg.length : arg.indexOf('=');
      name = arg.slice(isFlag === 2 ? 2 : 1, idx);
      val = arg.slice(idx + 1) || (i + 1 < args.length && args[i + 1].startsWith('-') ? '' : args[++i]);
      if (strict && !keys.includes(name)) return opts.unknown(arg);
      toVal(out, name, idx + 1 < arg.length ? val : true, opts);
    } else {
      out._.push(arg);
    }
  }

  if (defaults) {
    for (const k in opts.default) {
      if (out[k] === void 0) {
        out[k] = opts.default[k];
      }
    }
  }

  if (opts.alias) {
    for (const k in out) {
      const arr = opts.alias[k] || [];
      arr.forEach((alias) => (out[alias] = out[k]));
    }
  }

  return out;
}

class Option {
  constructor(rawName, description, config = {}) {
    this.rawName = rawName.replace(/\.\*/g, '');
    this.description = description || '';
    this.config = config;
    this.negated = false;
    this.names = this.parseNames(rawName);
    this.name = this.names[this.names.length - 1];
    this.setIsBooleanAndRequired();
  }

  parseNames(rawName) {
    return rawName
      .replace(/[<[].+/, '')
      .trim()
      .split(',')
      .map((v) => {
        let name = v.trim().replace(/^-{1,2}/, '');
        if (name.startsWith('no-')) {
          this.negated = true;
          name = name.replace(/^no-/, '');
        }
        return this.camelcaseOptionName(name);
      });
  }

  setIsBooleanAndRequired() {
    if (this.rawName.includes('<')) {
      this.required = true;
    } else if (this.rawName.includes('[')) {
      this.required = false;
    } else {
      this.isBoolean = true;
    }
    if (this.negated) {
      this.config.default = true;
    }
  }

  camelcaseOptionName(name) {
    return name.split('.').map((v, i) => (i === 0 ? this.camelcase(v) : v)).join('.');
  }

  camelcase(input) {
    return input.replace(/([a-z])-([a-z])/g, (_, p1, p2) => p1 + p2.toUpperCase());
  }
}

class Command {
  constructor(rawName, description, config = {}, cli) {
    this.rawName = rawName;
    this.description = description;
    this.config = config;
    this.cli = cli;
    this.options = [];
    this.aliasNames = [];
    this.name = this.removeBrackets(rawName);
    this.args = this.findAllBrackets(rawName);
    this.examples = [];
  }

  usage(text) {
    this.usageText = text;
    return this;
  }

  allowUnknownOptions() {
    this.config.allowUnknownOptions = true;
    return this;
  }

  ignoreOptionDefaultValue() {
    this.config.ignoreOptionDefaultValue = true;
    return this;
  }

  version(version, customFlags = '-v, --version') {
    this.versionNumber = version;
    this.option(customFlags, 'Display version number');
    return this;
  }

  example(example) {
    this.examples.push(example);
    return this;
  }

  option(rawName, description, config) {
    const option = new Option(rawName, description, config);
    this.options.push(option);
    return this;
  }

  alias(name) {
    this.aliasNames.push(name);
    return this;
  }

  action(callback) {
    this.commandAction = callback;
    return this;
  }

  isMatched(name) {
    return this.name === name || this.aliasNames.includes(name);
  }

  get isDefaultCommand() {
    return this.name === '' || this.aliasNames.includes('!');
  }

  get isGlobalCommand() {
    return this instanceof GlobalCommand;
  }

  hasOption(name) {
    name = name.split('.')[0];
    return this.options.find((option) => option.names.includes(name));
  }

  outputHelp() {
    const { name } = this.cli;
    let sections = [{ body: `${name}${this.cli.globalCommand.versionNumber ? `/${this.cli.globalCommand.versionNumber}` : ''}` }];
    sections.push({ title: 'Usage', body: `  $ ${name} ${this.usageText || this.rawName}` });
    this.prepareSections(sections);
  }

  outputVersion() {
    const { name } = this.cli;
    const { versionNumber } = this.cli.globalCommand;
    if (versionNumber) {
      console.log(`${name}/${versionNumber} ${process.platform}-${process.arch} node-${process.version}`);
    }
  }

  checkRequiredArgs() {
    const minimalArgsCount = this.args.filter((arg) => arg.required).length;
    if (this.cli.args.length < minimalArgsCount) {
      throw new CACError(`missing required args for command \`${this.rawName}\``);
    }
  }

  checkUnknownOptions() {
    const { options, globalCommand } = this.cli;
    if (!this.config.allowUnknownOptions) {
      for (const name of Object.keys(options)) {
        if (name !== '--' && !this.hasOption(name) && !globalCommand.hasOption(name)) {
          throw new CACError(`Unknown option \`${name.length > 1 ? `--${name}` : `-${name}`}\``);
        }
      }
    }
  }

  checkOptionValue() {
    const { options: parsedOptions, globalCommand } = this.cli;
    const options = [...globalCommand.options, ...this.options];
    for (const option of options) {
      const value = parsedOptions[option.name.split('.')[0]];
      if (option.required && (value === true || value === false && !options.some((o) => o.negated && o.names.includes(option.name)))) {
        throw new CACError(`option \`${option.rawName}\` value is missing`);
      }
    }
  }

  removeBrackets(v) {
    return v.replace(/[<[].+/, '').trim();
  }

  findAllBrackets(v) {
    const res = [];
    const parse = (match) => {
      let variadic = false;
      let value = match[1];
      if (value.startsWith('...')) {
        value = value.slice(3);
        variadic = true;
      }
      return {
        required: match[0].startsWith('<'),
        value,
        variadic,
      };
    };
    let angledMatch, squareMatch;
    while ((angledMatch = /<([^>]+)>/g.exec(v))) res.push(parse(angledMatch));
    while ((squareMatch = /\[([^\]]+)\]/g.exec(v))) res.push(parse(squareMatch));
    return res;
  }

  prepareSections(sections) {
    const { commands } = this.cli;
    const showCommands = (this.isGlobalCommand || this.isDefaultCommand) && commands.length > 0;
    if (showCommands) {
      const longestCommandName = this.findLongest(commands.map((command) => command.rawName));
      sections.push({
        title: 'Commands',
        body: commands
          .map((command) => `  ${this.padRight(command.rawName, longestCommandName.length)}  ${command.description}`)
          .join('\n'),
      });
      sections.push({
        title: `For more info, run any command with the \`--help\` flag`,
        body: commands.map((command) => `  $ ${this.cli.name}${command.name === '' ? '' : ` ${command.name}`} --help`).join('\n'),
      });
    }
    const options = this.isGlobalCommand ? this.cli.globalCommand.options : [...this.options, ...this.cli.globalCommand.options || []];
    if (options.length > 0) {
      const longestOptionName = this.findLongest(options.map((option) => option.rawName));
      sections.push({
        title: 'Options',
        body: options
          .map((option) => `  ${this.padRight(option.rawName, longestOptionName.length)}  ${option.description} ${option.config.default !== void 0 ? `(default: ${option.config.default})` : ''}`)
          .join('\n'),
      });
    }
    if (this.examples.length > 0) {
      sections.push({
        title: 'Examples',
        body: this.examples.map((example) => (typeof example === 'function' ? example(this.cli.name) : example)).join('\n'),
      });
    }
    if (this.cli.globalCommand.helpCallback) {
      sections = this.cli.globalCommand.helpCallback(sections) || sections;
    }
    console.log(
      sections
        .map((section) => (section.title ? `${section.title}:\n${section.body}` : section.body))
        .join('\n\n')
    );
  }

  findLongest(arr) {
    return arr.sort((a, b) => (a.length > b.length ? -1 : 1))[0];
  }

  padRight(str, length) {
    return str.length >= length ? str : `${str}${' '.repeat(length - str.length)}`;
  }
}

class GlobalCommand extends Command {
  constructor(cli) {
    super('@@global@@', '', {}, cli);
  }
}

class CACError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error(message).stack;
    }
  }
}

class CAC extends events.EventEmitter {
  constructor(name = '') {
    super();
    this.name = name;
    this.commands = [];
    this.rawArgs = [];
    this.args = [];
    this.options = {};
    this.globalCommand = new GlobalCommand(this);
    this.globalCommand.usage('<command> [options]');
  }

  usage(text) {
    this.globalCommand.usage(text);
    return this;
  }

  command(rawName, description, config) {
    const cmd = new Command(rawName, description || '', config, this);
    this.commands.push(cmd);
    return cmd;
  }

  option(rawName, description, config) {
    this.globalCommand.option(rawName, description, config);
    return this;
  }

  help(callback) {
    this.globalCommand.option('-h, --help', 'Display this message');
    this.globalCommand.helpCallback = callback;
    this.showHelpOnExit = true;
    return this;
  }

  version(version, customFlags = '-v, --version') {
    this.globalCommand.version(version, customFlags);
    this.showVersionOnExit = true;
    return this;
  }

  example(example) {
    this.globalCommand.example(example);
    return this;
  }

  outputHelp() {
    if (this.matchedCommand) {
      this.matchedCommand.outputHelp();
    } else {
      this.globalCommand.outputHelp();
    }
  }

  outputVersion() {
    this.globalCommand.outputVersion();
  }

  setParsedInfo({ args, options }, matchedCommand, matchedCommandName) {
    this.args = args;
    this.options = options;
    this.matchedCommand = matchedCommand;
    this.matchedCommandName = matchedCommandName;
    return this;
  }

  parse(argv = process.argv, { run = true } = {}) {
    this.rawArgs = argv;
    if (!this.name) {
      this.name = this.getFileName(argv[1]) || 'cli';
    }
    let shouldParse = true;

    this.commands.forEach((command) => {
      const parsed = this.mri(argv.slice(2), command);
      const commandName = parsed.args[0];
      if (command.isMatched(commandName)) {
        shouldParse = false;
        this.setParsedInfo({ ...parsed, args: parsed.args.slice(1) }, command, commandName);
        this.emit(`command:${commandName}`, command);
      }
    });

    if (shouldParse) {
      this.commands.forEach((command) => {
        if (command.name === '') {
          shouldParse = false;
          const parsed = this.mri(argv.slice(2), command);
          this.setParsedInfo(parsed, command);
          this.emit('command:!', command);
        }
      });
    }

    if (shouldParse) {
      const parsed = this.mri(argv.slice(2));
      this.setParsedInfo(parsed);
    }

    if (this.options.help && this.showHelpOnExit) {
      this.outputHelp();
      run = false;
      this.unsetMatchedCommand();
    }
    if (this.options.version && this.showVersionOnExit) {
      this.outputVersion();
      run = false;
      this.unsetMatchedCommand();
    }

    if (run) this.runMatchedCommand();

    if (!this.matchedCommand && this.args[0]) {
      this.emit('command:*');
    }

    return { args: this.args, options: this.options };
  }

  unsetMatchedCommand() {
    this.matchedCommand = undefined;
    this.matchedCommandName = undefined;
  }

  mri(argv, command) {
    const cliOptions = [...this.globalCommand.options, ...(command ? command.options : [])];
    const mriOptions = this.getMriOptions(cliOptions);
    const doubleDashesIndex = argv.indexOf('--');
    const argsAfterDoubleDashes = doubleDashesIndex > -1 ? argv.slice(doubleDashesIndex + 1) : [];
    argv = doubleDashesIndex > -1 ? argv.slice(0, doubleDashesIndex) : argv;
    let parsed = mri2(argv, mriOptions);

    parsed = Object.keys(parsed).reduce((res, key) => {
      res[this.camelcaseOptionName(key)] = parsed[key];
      return res;
    }, { _: [] });

    const args = parsed._;
    const options = { '--': argsAfterDoubleDashes };
    const ignoreDefault =
      command && command.config.ignoreOptionDefaultValue
        ? command.config.ignoreOptionDefaultValue
        : this.globalCommand.config.ignoreOptionDefaultValue;

    const transforms = Object.create(null);

    cliOptions.forEach((cliOption) => {
      if (!ignoreDefault && cliOption.config.default !== void 0) {
        cliOption.names.forEach((name) => {
          options[name] = cliOption.config.default;
        });
      }

      if (Array.isArray(cliOption.config.type)) {
        if (!transforms[cliOption.name]) {
          transforms[cliOption.name] = { shouldTransform: true, transformFunction: cliOption.config.type[0] };
        }
      }
    });

    Object.keys(parsed).forEach((key) => {
      if (key !== '_') {
        const keys = key.split('.');
        this.setDotProp(options, keys, parsed[key]);
        this.setByType(options, transforms);
      }
    });

    return { args, options };
  }

  runMatchedCommand() {
    const { args, options, matchedCommand: command } = this;
    if (!command || !command.commandAction) return;
    command.checkUnknownOptions();
    command.checkOptionValue();
    command.checkRequiredArgs();

    const actionArgs = command.args.map((arg, i) => (arg.variadic ? args.slice(i) : args[i]));
    actionArgs.push(options);

    return command.commandAction.apply(this, actionArgs);
  }

  getFileName(input) {
    const match = /([^\\\/]+)$/.exec(input);
    return match ? match[1] : '';
  }

  // Utility functions for option parsing

  camelcaseOptionName(name) {
    return name.split('.').map((v, i) => (i === 0 ? this.camelcase(v) : v)).join('.');
  }

  getMriOptions(options) {
    const result = { alias: {}, boolean: [] };
    options.forEach((option, index) => {
      if (option.names.length > 1) {
        result.alias[option.names[0]] = option.names.slice(1);
      }
      if (option.isBoolean) {
        const hasStringTypeOption = options.some(
          (o, i) => i !== index && o.names.some((name) => option.names.includes(name)) && typeof o.required === 'boolean'
        );
        if (!hasStringTypeOption || !option.negated) {
          result.boolean.push(option.names[0]);
        }
      }
    });
    return result;
  }

  camelcase(input) {
    return input.replace(/([a-z])-([a-z])/g, (_, p1, p2) => p1 + p2.toUpperCase());
  }

  setDotProp(obj, keys, val) {
    keys.reduce((t, key, i) => {
      if (i === keys.length - 1) {
        t[key] = val;
        return val;
      }
      t[key] = t[key] || (!isNaN(parseInt(keys[i + 1])) && keys[i + 1].indexOf('.') == -1 ? [] : {});
      return t[key];
    }, obj);
  }

  setByType(obj, transforms) {
    for (const key in transforms) {
      const transform = transforms[key];
      if (transform.shouldTransform) {
        obj[key] = [].concat(obj[key]);
        if (typeof transform.transformFunction === 'function') {
          obj[key] = obj[key].map(transform.transformFunction);
        }
      }
    }
  }
}

module.exports = (name = '') => new CAC(name);
