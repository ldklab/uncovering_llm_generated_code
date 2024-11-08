'use strict';

const { EventEmitter } = require('events');

function toArray(any) {
    return any == null ? [] : Array.isArray(any) ? any : [any];
}

function toValue(out, key, val, opts) {
    let convertedValue;
    const oldValue = out[key];
    if (opts.string.includes(key)) {
        convertedValue = (val == null || val === true) ? '' : String(val);
    } else if (typeof val === 'boolean' || opts.boolean.includes(key)) {
        convertedValue = val === 'false' ? false : val === 'true' || !isNaN(val) && Number(val);
    } else {
        convertedValue = isNaN(val) ? val : Number(val);
    }
    out[key] = oldValue == null ? convertedValue : Array.isArray(oldValue) ? oldValue.concat(convertedValue) : [oldValue, convertedValue];
}

function parseArgs(args = [], opts = {}) {
    const out = { _: [] };
    opts.alias = opts.alias || {};
    opts.string = toArray(opts.string);
    opts.boolean = toArray(opts.boolean);

    for (const key in opts.alias) {
        opts.alias[key] = toArray(opts.alias[key]);
        for (const aliasedKey of opts.alias[key]) {
            opts.alias[aliasedKey] = opts.alias[key].concat(key).filter(x => x !== aliasedKey);
        }
    }

    for (const boolKey of opts.boolean) {
        (opts.alias[boolKey] || []).forEach(alias => opts.boolean.push(alias));
    }

    for (const strKey of opts.string) {
        (opts.alias[strKey] || []).forEach(alias => opts.string.push(alias));
    }

    args.forEach(arg => {
        let j = 0, name, val;
        while (j < arg.length && arg.charCodeAt(j) === 45) j++; // check for dashes "-"

        if (j === 0) {
            out._.push(arg);
        } else if (arg.substring(j, j + 3) === 'no-') {
            name = arg.substring(j + 3);
            out[name] = false;
        } else {
            const eqIndex = arg.indexOf('=', j + 1);
            name = arg.substring(j, eqIndex > -1 ? eqIndex : arg.length);
            val = eqIndex > -1 ? arg.substring(eqIndex + 1) : args[++i];
            toValue(out, name, val, opts);
        }
    });

    if (opts.default) {
        for (const defKey in opts.default) {
            if (out[defKey] === undefined) out[defKey] = opts.default[defKey];
        }
    }

    if (opts.alias) {
        for (const key in out) {
            (opts.alias[key] || []).forEach(ali => out[ali] = out[key]);
        }
    }

    return out;
}

const parseArgBrackets = (str) => {
    const result = [];
    const parse = (match) => {
        const value = match[1].startsWith('...') ? match[1].slice(3) : match[1];
        return { required: match[0].startsWith('<'), value, variadic: match[1].startsWith('...') };
    };
    (str.matchAll(/<([^>]+)>/g) || []).forEach(match => result.push(parse(match)));
    (str.matchAll(/\[([^\]]+)\]/g) || []).forEach(match => result.push(parse(match)));
    return result;
};

const deriveCamelcase = (input) => input.replace(/-([a-z])/g, g => g[1].toUpperCase());

const configureCommandLineOptions = (options) => {
    const mriOptions = { alias: {}, boolean: [] };
    options.forEach(option => {
        if (option.names.length > 1) {
            mriOptions.alias[option.names[0]] = option.names.slice(1);
        }
        if (option.isBoolean) {
            mriOptions.boolean.push(option.names[0]);
        }
    });
    return mriOptions;
};

class CommandLineError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

class Option {
    constructor(rawName, description, config = {}) {
        this.rawName = rawName;
        this.description = description;
        this.config = { ...config };
        this.negated = false;
        this.names = rawName
            .replace(/\.\*/g, '')
            .match(/(?:(?:--?)[^ ,]+)[ ,]*/g)
            .map((v) => {
                const name = v.trim().replace(/^-{1,2}/, '');
                if (name.startsWith('no-')) {
                    this.negated = true;
                    return name.substring(3);
                }
                return deriveCamelcase(name);
            }).sort((a, b) => a.length - b.length);
        this.name = this.names[this.names.length - 1];
        
        if (this.negated) this.config.default = true;
        if (rawName.includes('<')) this.required = true;
        else if (rawName.includes('[')) this.required = false;
        else this.isBoolean = true;
    }
}

class Command {
    constructor(rawName, description, { options = [] } = {}, cli) {
        this.rawName = rawName;
        this.description = description;
        this.config = {};
        this.cli = cli;
        this.options = [];
        this.name = rawName.match(/[^ ]+/)[0];
        this.args = parseArgBrackets(rawName);
        this.examples = [];

        options.forEach(opt => this.option(opt.rawName, opt.description, opt.config));
    }
    usage(showUsageText) { this.usageText = showUsageText; return this; }
    option(rawName, description, config = {}) { this.options.push(new Option(rawName, description, config)); return this; }
    action(callback) { this.actionCallback = callback; return this; }
    isMatch(cmdName) { return this.name === cmdName; }
    outputHelp() {
        const { name, description, examples, usageText, options } = this;
        const lines = [
            `${name} - ${description}`,
            '',
            'Usage:',
            `  $ ${name} ${usageText}`,
            '',
            'Options:',
            ...options.map(opt => `  ${opt.rawName}  ${opt.description}`),
        ];
        if (examples.length) {
            lines.push('', 'Examples:', ...examples.map(ex => `  ${ex}`));
        }
        console.log(lines.join('\n'));
    }
    outputVersion() {
        const { name } = this.cli;
        const { version } = this.cli;
        console.log(`${name} version ${version}`);
    }
    checkArgs() {
        const requiredArgs = this.args.filter(a => a.required).length;
        if (this.cli.args.length < requiredArgs) {
            throw new CommandLineError(`Missing required arguments for command "${this.rawName}"`);
        }
    }
}

class GlobalCommand extends Command {
    constructor(cli) { super('@@global@@', '', {}, cli); }
}

class CLI extends EventEmitter {
    constructor(cliName = '') {
        super();
        this.cliName = cliName;
        this.commands = [];
        this.rawArgs = [];
        this.args = [];
        this.options = {};
        this.globalCmd = new GlobalCommand(this);
    }
    command(rawName, description, config) {
        const command = new Command(rawName, description || '', config, this);
        this.commands.push(command);
        return command;
    }
    option(rawName, description, config) {
        this.globalCmd.option(rawName, description, config);
        return this;
    }
    parse(argv, { runCommand = true } = {}) {
        this.rawArgs = argv;
        const commandName = argv[2];
        const command = this.commands.find(cmd => cmd.isMatch(commandName));
        if (command) {
            this.matchedCommand = command;
            const mriOptions = configureCommandLineOptions([...this.globalCmd.options, ...command.options]);
            const parsedArgs = parseArgs(argv.slice(2), mriOptions);
            this.runCommand(command, parsedArgs);
        } else {
            this.outputHelp();
        }
    }
    runCommand(command, parsedArgs) {
        if (command && command.actionCallback) {
            command.checkArgs();
            command.actionCallback(parsedArgs._, parsedArgs);
        }
    }
    outputHelp() { console.log('Help output'); }
}

function createCLI(name = '') {
    return new CLI(name);
}

module.exports = exports = createCLI;
exports.CLI = CLI;
exports.Command = Command;
