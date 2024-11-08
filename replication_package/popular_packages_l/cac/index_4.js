// Simplified Node.js CAC (Command And Conquer) Implementation

class CAC {
  constructor(name = 'cli') {
    this.name = name;
    this.commands = [];
    this.globalOptions = [];
    this.matchedCommand = null;
    this.rawArgs = process.argv.slice(2);
    this.args = [];
    this.options = {};
  }

  addCommand(name, description, config = {}) {
    const cmd = new Command(name, description, config);
    this.commands.push(cmd);
    return cmd;
  }

  addOption(name, description, config = {}) {
    this.globalOptions.push({ name, description, config });
    return this;
  }

  setVersion(version, customFlags = '-v, --version') {
    this.globalOptions.push({
      name: customFlags,
      description: 'Output the version number',
      config: { version }
    });
    return this;
  }

  displayHelp() {
    this.globalOptions.push({
      name: '-h, --help',
      description: 'Display help message',
    });
    return this;
  }

  parseArgs(argv = process.argv.slice(2)) {
    const result = {
      args: [],
      options: {},
    };
    let commandMatched = false;

    this.globalOptions.forEach((option) => {
      const [shortFlag, longFlag] = option.name.split(',').map(f => f.trim());
      if (argv.includes(shortFlag) || argv.includes(longFlag)) {
        if (option.config.version) {
          console.log(option.config.version);
          process.exit(0);
        }
        if (option.name.includes('help')) {
          this.showHelp();
          process.exit(0);
        }
      }
    });

    for (const command of this.commands) {
      if (argv.includes(command.name.split(' ')[0])) {
        commandMatched = true;
        this.matchedCommand = command;
        this.processCommand(command, argv);
        break;
      }
    }

    if (!commandMatched) {
      this.processOptions(this.globalOptions, argv, result);
      console.log(JSON.stringify(result, null, 2));
    }

    return result;
  }

  processCommand(command, argv) {
    const result = {
      args: [],
      options: {},
    };

    command.options.forEach((option) => {
      const [flag] = option.name.split(',');
      const index = argv.indexOf(flag.trim());
      if (index !== -1) {
        result.options[flag.trim()] = argv[index + 1] || true;
        argv.splice(index, 2);
      }
    });

    command.executeAction(argv, result.options);
  }

  processOptions(optionsArray, argv, result) {
    optionsArray.forEach((option) => {
      const [shortFlag, longFlag] = option.name.split(',').map(f => f.trim());
      const index = argv.indexOf(shortFlag) !== -1 ? argv.indexOf(shortFlag) : argv.indexOf(longFlag);
      if (index !== -1) {
        result.options[shortFlag.replace(/^\-\-?/, '')] = argv[index + 1] || true;
        argv.splice(index, 2);
      }
    });

    result.args = argv;
  }

  showHelp() {
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

  addOption(name, description, config = {}) {
    this.options.push({ name, description, config });
    return this;
  }

  onExecute(callback) {
    this.actionCallback = callback;
    return this;
  }

  executeAction(args, options) {
    this.actionCallback(args, options);
  }
}

// Exporting the simplified CAC
module.exports = () => new CAC();

// Example usage of Simplified CAC
if (require.main === module) {
  const cli = new CAC('cac-demo');

  cli
    .addCommand('init <project>', 'Create a new project')
    .addOption('--template <template>', 'Provide a project template')
    .onExecute((args, options) => {
      const projectName = args[0];
      const { template } = options;
      console.log(`Initializing project "${projectName}" with template "${template}"`);
    });

  cli.addOption('--global', 'A global option example')
    .setVersion('1.0.0')
    .displayHelp()
    .parseArgs();
}
