// Simplified Node.js CAC (Command And Conquer) Implementation

class CAC {
  constructor(name) {
    this.name = name || 'cli';
    this.commands = [];
    this.globalOptions = [];
    this.matchedCommand = null;
    this.rawArgs = process.argv.slice(2);
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
    const result = { args: [], options: {} };

    // Handle global options for version and help
    this.globalOptions.forEach((option) => {
      const [shortFlag, longFlag] = option.name.split(',').map(flag => flag.trim());
      if (argv.includes(shortFlag) || argv.includes(longFlag)) {
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

    // Check for command matches
    for (const command of this.commands) {
      if (argv.includes(command.name.split(' ')[0])) {
        this.matchedCommand = command;
        this.executeCommand(command, argv);
        return;
      }
    }

    // Handle global options if no commands are matched
    this.extractOptions(this.globalOptions, argv, result);
    console.log(JSON.stringify(result, null, 2));
  }

  executeCommand(command, argv) {
    const result = { args: [], options: {} };

    command.options.forEach((option) => {
      const shortOpt = option.name.split(',')[0].trim();
      if (argv.includes(shortOpt)) {
        const index = argv.indexOf(shortOpt);
        result.options[shortOpt] = (argv[index + 1] || true);
        argv.splice(index, 2);
      }
    });

    command.actionCallback(argv, result.options);
  }

  extractOptions(optionsArray, argv, result) {
    optionsArray.forEach(({ name }) => {
      const [shortFlag, longFlag] = name.split(',').map(flag => flag.trim());
      if (argv.includes(shortFlag) || (longFlag && argv.includes(longFlag))) {
        const index = argv.includes(shortFlag) ? argv.indexOf(shortFlag) : argv.indexOf(longFlag);
        result.options[shortFlag.replace(/^\-\-?/, '')] = argv[index + 1] || true;
        argv.splice(index, 2);
      }
    });
    result.args = argv;
  }

  outputHelp() {
    console.log(`Usage: ${this.name} [options] [command]`);
    console.log('\nOptions:');
    this.globalOptions.forEach(({ name, description }) => console.log(`  ${name}\t${description}`));
    if (this.commands.length > 0) {
      console.log('\nCommands:');
      this.commands.forEach(({ name, description }) => console.log(`  ${name}\t${description}`));
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
}

// Exporting the simplified CAC
module.exports = () => new CAC();

// Example usage of Simplified CAC
if (require.main === module) {
  const cli = new CAC('cac-demo');
  
  cli
    .command('init <project>', 'Create a new project')
    .option('--template <template>', 'Provide a project template')
    .action((args, { template }) => {
      const project = args[0];
      console.log(`Initializing project "${project}" with template "${template}"`);
    });

  cli.option('--global', 'A global option example')
    .version('1.0.0')
    .help()
    .parse();
}
