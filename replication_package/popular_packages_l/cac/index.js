// Simplified Node.js CAC (Command And Conquer) Implementation

class CAC {
  constructor(name) {
    this.name = name || 'cli';
    this.commands = [];
    this.globalOptions = [];
    this.matchedCommand = null;
    this.rawArgs = process.argv.slice(2);
    this.args = [];
    this.options = {};
  }

  command(name, description, config = {}) {
    const cmd = new Command(name, description, config);
    this.commands.push(cmd);
    return cmd;
  }

  option(name, description, config = {}) {
    this.globalOptions.push({ name, description, config });
    return this;
  }

  version(version, customFlags = '-v, --version') {
    this.globalOptions.push({
      name: customFlags,
      description: 'Output the version number',
      config: { version }
    });
    return this;
  }

  help() {
    this.globalOptions.push({
      name: '-h, --help',
      description: 'Display help message',
    });
    return this;
  }

  parse(argv = process.argv.slice(2)) {
    const result = {
      args: [],
      options: {},
    };

    let commandMatched = false;

    // Look for version and help flags in global options
    this.globalOptions.forEach((option) => {
      if (argv.includes(option.name.split(',')[0].trim()) || argv.includes(option.name.split(',')[1].trim())) {
        if (option.config.version) {
          console.log(option.config.version);
          process.exit(0);
        }
        if (option.name.includes('help')) {
          this.outputHelp();
          process.exit(0);
        }
      }
    });

    // Match commands
    for (const command of this.commands) {
      if (argv.includes(command.name.split(' ')[0])) {
        commandMatched = true;
        this.matchedCommand = command;
        this.handleCommand(command, argv);
        break;
      }
    }

    if (!commandMatched) {
      this.handleOptions(this.globalOptions, argv, result);
      console.log(JSON.stringify(result, null, 2));
    }

    return result;
  }

  handleCommand(command, argv) {
    const result = {
      args: [],
      options: {},
    };

    command.options.forEach((option) => {
      if (argv.includes(option.name.split(',')[0].trim())) {
        const index = argv.indexOf(option.name.split(',')[0].trim());
        result.options[option.name.split(',')[0].trim()] = argv[index + 1] || true;
        argv.splice(index, 2);
      }
    });

    command.action.apply(null, [argv, result.options]);
  }

  handleOptions(optionsArray, argv, result) {
    optionsArray.forEach((option) => {
      const names = option.name.split(',');
      if (argv.includes(names[0].trim()) || (names[1] && argv.includes(names[1].trim()))) {
        const index = argv.indexOf(names[0].trim()) !== -1 ? argv.indexOf(names[0].trim()) : argv.indexOf(names[1].trim());
        result.options[names[0].trim().replace(/^\-\-?/, '')] = argv[index + 1] || true;
        argv.splice(index, 2);
      }
    });

    result.args = argv;
  }

  outputHelp() {
    console.log(`Usage: ${this.name} [options] [command]`);

    console.log('\nOptions:');
    this.globalOptions.forEach((opt) => {
      console.log(`  ${opt.name} \t ${opt.description}`);
    });

    if (this.commands.length > 0) {
      console.log('\nCommands:');
      this.commands.forEach((cmd) => {
        console.log(`  ${cmd.name} \t ${cmd.description}`);
      });
    }
  }
}

class Command {
  constructor(name, description, config) {
    this.name = name;
    this.description = description;
    this.config = config;
    this.options = [];
    this.actionCallback = () => {};
  }

  option(name, description, config = {}) {
    this.options.push({ name, description, config });
    return this;
  }

  action(callback) {
    this.actionCallback = callback;
    return this;
  }

  alias(name) {
    // Additional Logic for Alias (not implemented)
    return this;
  }

  allowUnknownOptions() {
    // Additional Logic for Unknown Options (not implemented)
    return this;
  }

  example(example) {
    // Additional Logic for Example (not implemented)
    return this;
  }

  usage(text) {
    // Additional Logic for Usage Text (not implemented)
    return this;
  }
}

// Exporting the simplified CAC
module.exports = () => new CAC();

// Example usage of Simplified CAC
if (require.main === module) {
  const cli = new CAC('cac-demo');

  cli
    .command('init <project>', 'Create a new project')
    .option('--template <template>', 'Provide a project template')
    .action((args, options) => {
      const projectName = args[0];
      const { template } = options;
      console.log(`Initializing project "${projectName}" with template "${template}"`);
    });

  cli.option('--global', 'A global option example')
    .version('1.0.0')
    .help()
    .parse();
}
