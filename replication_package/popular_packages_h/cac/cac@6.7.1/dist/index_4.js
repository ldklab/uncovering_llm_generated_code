'use strict';

const events = require('events');

function convertToArray(item) {
    if (item == null) return [];
    return Array.isArray(item) ? item : [item];
}

function convertToValue(output, key, value, options) {
    let parsedValue, oldValue = output[key];
    const newValue = (!!~options.string.indexOf(key)) ? (value == null || value === true ? '' : String(value))
        : (typeof value === 'boolean') ? value
        : (!!~options.boolean.indexOf(key)) ? (value === 'false' ? false : value === 'true' || (output._.push((parsedValue = +value, parsedValue * 0 === 0) ? parsedValue : value), !!value))
        : (parsedValue = +value, parsedValue * 0 === 0) ? parsedValue : value;

    output[key] = oldValue == null ? newValue : (Array.isArray(oldValue) ? oldValue.concat(newValue) : [oldValue, newValue]);
}

function argumentParser(args, options) {
    args = args || [];
    options = options || {};
    let key, aliases, argument, optionName, value;
    const output = { _: [] };
    const aliasMode = options.alias !== void 0;
    const validateUnknown = options.unknown !== void 0;
    const hasDefaults = options.default !== void 0;

    options.alias = options.alias || {};
    options.string = convertToArray(options.string);
    options.boolean = convertToArray(options.boolean);

    if (aliasMode) {
        for (key in options.alias) {
            aliases = options.alias[key] = convertToArray(options.alias[key]);
            for (let i = 0; i < aliases.length; i++) {
                options.alias[aliases[i]] = aliases.concat(key).splice(i, 1);
            }
        }
    }

    for (let i = options.boolean.length; i-- > 0;) {
        aliases = options.alias[options.boolean[i]] || [];
        for (let j = aliases.length; j-- > 0;) {
            options.boolean.push(aliases[j]);
        }
    }

    for (let i = options.string.length; i-- > 0;) {
        aliases = options.alias[options.string[i]] || [];
        for (let j = aliases.length; j-- > 0;) {
            options.string.push(aliases[j]);
        }
    }

    if (hasDefaults) {
        for (key in options.default) {
            const defaultType = typeof options.default[key];
            aliases = options.alias[key] = options.alias[key] || [];
            if (options[defaultType] !== void 0) {
                options[defaultType].push(key);
                for (let i = 0; i < aliases.length; i++) {
                    options[defaultType].push(aliases[i]);
                }
            }
        }
    }

    const edgeCases = validateUnknown ? Object.keys(options.alias) : [];

    for (let i = 0; i < args.length; i++) {
        argument = args[i];

        if (argument === '--') {
            output._ = output._.concat(args.slice(++i));
            break;
        }
        
        let prefix;
        for (prefix = 0; prefix < argument.length; prefix++) {
            if (argument.charCodeAt(prefix) !== 45) break; // "-"
        }

        if (prefix === 0) {
            output._.push(argument);
        } else if (argument.substring(prefix, prefix + 3) === 'no-') {
            optionName = argument.substring(prefix + 3);
            if (validateUnknown && !~edgeCases.indexOf(optionName)) {
                return options.unknown(argument);
            }
            output[optionName] = false;
        } else {
            let equalIndex;
            for (equalIndex = prefix + 1; equalIndex < argument.length; equalIndex++) {
                if (argument.charCodeAt(equalIndex) === 61) break; // "="
            }

            optionName = argument.substring(prefix, equalIndex);
            value = argument.substring(++equalIndex) || (i + 1 === args.length || ('' + args[i + 1]).charCodeAt(0) === 45 || args[++i]);
            aliases = (prefix === 2 ? [optionName] : optionName);

            for (let idx = 0; idx < aliases.length; idx++) {
                optionName = aliases[idx];
                if (validateUnknown && !~edgeCases.indexOf(optionName)) return options.unknown('-'.repeat(prefix) + optionName);
                convertToValue(output, optionName, (idx + 1 < aliases.length) || value, options);
            }
        }
    }

    if (hasDefaults) {
        for (key in options.default) {
            if (output[key] === void 0) {
                output[key] = options.default[key];
            }
        }
    }

    if (aliasMode) {
        for (key in output) {
            aliases = options.alias[key] || [];
            while (aliases.length > 0) {
                output[aliases.shift()] = output[key];
            }
        }
    }

    return output;
}

const findLongestCommand = (arr) => arr.sort((a, b) => a.length > b.length ? -1 : 1)[0];
const padStringRight = (str, length) => str.length >= length ? str : `${str}${' '.repeat(length - str.length)}`;

class CLIError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        } else {
            this.stack = new Error(message).stack;
        }
    }
}

class Option {
    constructor(rawName, description, config) {
        this.rawName = rawName;
        this.description = description;
        this.config = { ...config };
        rawName = rawName.replace(/\.\*/g, "");
        this.negated = false;
        this.names = rawName.replace(/[<[].+/, "").trim().split(',').map((v) => {
            let name = v.trim().replace(/^-{1,2}/, "");
            if (name.startsWith("no-")) {
                this.negated = true;
                name = name.replace(/^no-/, "");
            }
            return name.split('.').map((val, index) => index === 0 ? val.replace(/([a-z])-([a-z])/g, (_, p1, p2) => p1 + p2.toUpperCase()) : val).join('.');
        }).sort((a, b) => a.length > b.length ? 1 : -1);
        this.name = this.names[this.names.length - 1];
        if (this.negated) {
            this.config.default = true;
        }
        if (rawName.includes('<')) {
            this.required = true;
        } else if (rawName.includes('[')) {
            this.required = false;
        } else {
            this.isBoolean = true;
        }
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
        this.name = rawName.replace(/[<[].+/, "").trim();
        this.args = [];
        const ANGLED_BRACKET_RE_GLOBAL = /<([^>]+)>/g;
        const SQUARE_BRACKET_RE_GLOBAL = /\[([^\]]+)\]/g;
        let match;
        while (match = ANGLED_BRACKET_RE_GLOBAL.exec(rawName)) {
            let variadic = false;
            let argName = match[1];
            if (argName.startsWith('...')) {
                argName = argName.slice(3);
                variadic = true;
            }
            this.args.push({ required: true, value: argName, variadic });
        }
        while (match = SQUARE_BRACKET_RE_GLOBAL.exec(rawName)) {
            let variadic = false;
            let argName = match[1];
            if (argName.startsWith('...')) {
                argName = argName.slice(3);
                variadic = true;
            }
            this.args.push({ required: false, value: argName, variadic });
        }
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
        this.option(customFlags, "Display version number");
        return this;
    }

    example(text) {
        this.examples.push(text);
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

    isMatched(commandName) {
        return this.name === commandName || this.aliasNames.includes(commandName);
    }

    get isDefaultCommand() {
        return this.name === "" || this.aliasNames.includes("!");
    }

    get isGlobalCommand() {
        return this instanceof GlobalCommand;
    }

    hasOption(optionName) {
        optionName = optionName.split('.')[0];
        return this.options.some(option => option.names.includes(optionName));
    }

    outputHelp() {
        const { name, commands } = this.cli;
        const { versionNumber, options: globalOpts, helpCallback } = this.cli.globalCommand;
        let sections = [{
            body: `${name}${versionNumber ? `/${versionNumber}` : ""}`
        }];
        sections.push({
            title: 'Usage',
            body: `  $ ${name} ${this.usageText || this.rawName}`
        });

        const shouldShowCommands = (this.isGlobalCommand || this.isDefaultCommand) && commands.length > 0;
        if (shouldShowCommands) {
            const longestCmdName = findLongestCommand(commands.map(cmd => cmd.rawName));
            sections.push({
                title: 'Commands',
                body: commands.map(cmd => `  ${padStringRight(cmd.rawName, longestCmdName.length)}  ${cmd.description}`).join('\n')
            });
            sections.push({
                title: `Run \`--help\` for any command for more info`,
                body: commands.map(cmd => `  $ ${name}${cmd.name === "" ? "" : ` ${cmd.name}`} --help`).join('\n')
            });
        }

        const optList = this.isGlobalCommand ? globalOpts : [...this.options, ...globalOpts || []];
        if (optList.length > 0) {
            const longestOptName = findLongestCommand(optList.map(opt => opt.rawName));
            sections.push({
                title: 'Options',
                body: optList.map(opt => `  ${padStringRight(opt.rawName, longestOptName.length)}  ${opt.description} ${opt.config.default === void 0 ? "" : `(default: ${opt.config.default})`}`).join('\n')
            });
        }

        if (this.examples.length > 0) {
            sections.push({
                title: "Examples",
                body: this.examples.join('\n')
            });
        }
        
        if (helpCallback) {
            sections = helpCallback(sections) || sections;
        }

        console.log(sections.map(section => section.title ? `${section.title}:\n${section.body}` : section.body).join('\n\n'));
    }

    outputVersion() {
        const { name } = this.cli;
        const { versionNumber } = this.cli.globalCommand;
        if (versionNumber) {
            const platformInfo = `${process.platform}-${process.arch} node-${process.version}`;
            console.log(`${name}/${versionNumber} ${platformInfo}`);
        }
    }

    checkRequiredArgs() {
        const requiredArgsCount = this.args.filter(arg => arg.required).length;
        if (this.cli.args.length < requiredArgsCount) {
            throw new CLIError(`Required args missing for command \`${this.rawName}\``);
        }
    }

    checkUnknownOptions() {
        const { options, globalCommand } = this.cli;
        if (!this.config.allowUnknownOptions) {
            for (const optName of Object.keys(options)) {
                if (optName !== '--' && !this.hasOption(optName) && !globalCommand.hasOption(optName)) {
                    throw new CLIError(`Unknown option \`${optName.length > 1 ? `--${optName}` : `-${optName}`}\``);
                }
            }
        }
    }

    checkOptionValue() {
        const { options: parsedOpts, globalCommand } = this.cli;
        const evaluatedOptions = [...globalCommand.options, ...this.options];
        for (const opt of evaluatedOptions) {
            const optValue = parsedOpts[opt.name.split('.')[0]];
            if (opt.required) {
                const negatedPresence = evaluatedOptions.some(o => o.negated && o.names.includes(opt.name));
                if (optValue === true || optValue === false && !negatedPresence) {
                    throw new CLIError(`Option \`${opt.rawName}\` value is missing`);
                }
            }
        }
    }
}

class GlobalCommand extends Command {
    constructor(cli) {
        super("@@global@@", "", {}, cli);
    }
}

class CLI extends events.EventEmitter {
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

    command(rawName, desc, config) {
        const cmd = new Command(rawName, desc || '', config, this);
        cmd.globalCommand = this.globalCommand;
        this.commands.push(cmd);
        return cmd;
    }

    option(rawName, desc, config) {
        this.globalCommand.option(rawName, desc, config);
        return this;
    }

    help(callback) {
        this.globalCommand.option('-h, --help', "Display this message");
        this.globalCommand.helpCallback = callback;
        this.showHelpOnExit = true;
        return this;
    }

    version(ver, customFlags = '-v, --version') {
        this.globalCommand.version(ver, customFlags);
        this.showVersionOnExit = true;
        return this;
    }

    example(text) {
        this.globalCommand.example(text);
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
        if (matchedCommand) {
            this.matchedCommand = matchedCommand;
        }
        if (matchedCommandName) {
            this.matchedCommandName = matchedCommandName;
        }
        return this;
    }

    unsetMatchedCommand() {
        this.matchedCommand = undefined;
        this.matchedCommandName = undefined;
    }

    parse(argv = process.argv, { run = true } = {}) {
        this.rawArgs = argv;
        if (!this.name) {
            this.name = argv[1] ? argv[1].split('/').pop() : 'cli';
        }
        let proceedWithParse = true;

        for (const command of this.commands) {
            const parsed = this.parseArgs(argv.slice(2), command);
            const cmdName = parsed.args[0];
            if (command.isMatched(cmdName)) {
                proceedWithParse = false;
                const parsedInfo = { ...parsed, args: parsed.args.slice(1) }; 
                this.setParsedInfo(parsedInfo, command, cmdName);
                this.emit(`command:${cmdName}`, command);
            }
        }

        if (proceedWithParse) {
            for (const command of this.commands) {
                if (command.name === "") {
                    proceedWithParse = false;
                    const parsed = this.parseArgs(argv.slice(2), command);
                    this.setParsedInfo(parsed, command);
                    this.emit(`command:!`, command);
                }
            }
        }
        
        if (proceedWithParse) {
            const parsed = this.parseArgs(argv.slice(2));
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

        const parsedResult = { args: this.args, options: this.options };
        if (run) {
            this.executeMatchedCommand();
        }

        if (!this.matchedCommand && this.args[0]) {
            this.emit("command:*");
        }

        return parsedResult;
    }

    parseArgs(argv, command) {
        const combinedOptions = [
            ...this.globalCommand.options,
            ...(command ? command.options : [])
        ];
        const availableOptions = combinedOptions.reduce((acc, cliOption) => {
            if (!cliOption.config.default && Array.isArray(cliOption.config.type)) {
                acc[cliOption.name] = acc[cliOption.name] || { shouldTransform: true, transformFunction: cliOption.config.type[0] };
            }
            return acc;
        }, {});
        const { _, ...parsedValues } = argumentParser(argv, {
            string: combinedOptions.filter(opt => opt.isString).map(opt => opt.name),
            boolean: combinedOptions.filter(opt => opt.isBoolean).map(opt => opt.name),
            alias: combinedOptions.reduce((aliases, opt) => { if (opt.names.length > 1) aliases[opt.names[0]] = opt.names.slice(1); return aliases; }, {}),
            default: combinedOptions.reduce((defs, opt) => { if (!opt.config.ignoreDefaultValue && opt.config.default !== undefined) defs[opt.name] = opt.config.default; return defs; }, {}),
            unknown(option) {
                throw new CLIError(`Unknown option ${option}`);
            }
        });

        const args = _;
        const options = {
            "--": args.filter(arg => !/^-/.test(arg))
        };

        for (const key in parsedValues) {
            const keyParts = key.split('.');
            setOptionValue(options, keyParts, parsedValues[key], availableOptions[key]);
        }

        return { args, options };
    }

    executeMatchedCommand() {
        const { args, options, matchedCommand: command } = this;
        if (!command || !command.commandAction) return;
        command.checkUnknownOptions();
        command.checkOptionValue();
        command.checkRequiredArgs();

        const actionArgs = [];
        command.args.forEach((arg, index) => {
            if (arg.variadic) {
                actionArgs.push(args.slice(index));
            } else {
                actionArgs.push(args[index]);
            }
        });
        actionArgs.push(options);
        return command.commandAction.apply(this, actionArgs);
    }
}

const CLIClass = (name = '') => new CLI(name);

if (typeof module !== 'undefined') {
    module.exports = CLIClass;
    module.exports.default = CLIClass;
    module.exports.cli = CLIClass;
}

exports.CLI = CLI;
exports.Command = Command;
exports.cli = CLIClass;
exports.default = CLIClass;
