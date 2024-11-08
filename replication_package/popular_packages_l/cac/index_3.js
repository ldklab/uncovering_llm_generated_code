// Simplified Node.js CLI Framework

class CLI {
  constructor(appName = 'cli') {
    this.appName = appName;
    this.commands = [];
    this.globalOptions = [];
    this.matchedCommand = null;
    this.rawArgs = process.argv.slice(2);
  }

  command(name, description) {
    const cmd = new Command(name, description);
    this.commands.push(cmd);
    return cmd;
  }

  globalOption(name, description, options = {}) {
    this.globalOptions.push({ name, description, options });
    return this;
  }

  version(version, flags = '-v, --version') {
    this.globalOption(flags, 'Output the version number', { version });
    return this;
  }

  help() {
    this.globalOption('-h, --help', 'Show help information');
    return this;
  }

  parse(argv = this.rawArgs) {
    const parseResult = { args: [], options: {} };
    let commandIdentified = false;

    this.globalOptions.forEach(opt => {
      const [shortFlag, longFlag] = opt.name.split(',').map(f => f.trim());
      if (argv.includes(shortFlag) || argv.includes(longFlag)) {
        if (opt.options.version) {
          console.log(opt.options.version);
          process.exit();
        }
        if (opt.name.includes('help')) {
          this.displayHelp();
          process.exit();
        }
      }
    });

    for (const cmd of this.commands) {
      if (argv[0] === cmd.name.split(' ')[0]) {
        commandIdentified = true;
        this.matchedCommand = cmd;
        this.executeCommand(cmd, argv);
        break;
      }
    }

    if (!commandIdentified) {
      this.processOptions(this.globalOptions, argv, parseResult);
      console.log(JSON.stringify(parseResult, null, 2));
    }

    return parseResult;
  }

  executeCommand(command, argv) {
    const commandResult = { args: [], options: {} };
    command.options.forEach(opt => {
      const index = argv.indexOf(opt.name.split(',')[0].trim());
      if (index > -1) {
        commandResult.options[opt.name.split(',')[0].trim()] = argv[index + 1] || true;
        argv.splice(index, 2);
      }
    });
    command.actionCallback(argv, commandResult.options);
  }

  processOptions(options, argv, result) {
    options.forEach(opt => {
      const [short, long] = opt.name.split(',').map(o => o.trim());
      const index = argv.indexOf(short) !== -1 ? argv.indexOf(short) : argv.indexOf(long);
      if (index > -1) {
        result.options[short.replace(/^\-\-?/, '')] = argv[index + 1] || true;
        argv.splice(index, 2);
      }
    });
    result.args = argv;
  }

  displayHelp() {
    console.log(`Usage: ${this.appName} [options] [command]`);
    console.log('\nOptions:');
    this.globalOptions.forEach(opt => {
      console.log(`  ${opt.name}  ${opt.description}`);
    });

    if (this.commands.length) {
      console.log('\nCommands:');
      this.commands.forEach(cmd => {
        console.log(`  ${cmd.name}  ${cmd.description}`);
      });
    }
  }
}

class Command {
  constructor(name, description) {
    this.name = name;
    this.description = description;
    this.options = [];
    this.actionCallback = () => {};
  }

  option(name, description) {
    this.options.push({ name, description });
    return this;
  }

  action(callback) {
    this.actionCallback = callback;
    return this;
  }
}

// Example usage
if (require.main === module) {
  const cli = new CLI('example-cli');
  cli.command('start <app>', 'Start the application')
    .option('--force', 'Force start')
    .action((args, options) => {
      const appName = args[0];
      console.log(`Starting ${appName} with options:`, options);
    });

  cli.globalOption('--global', 'A sample global option')
    .version('2.0.0')
    .help()
    .parse();
}
