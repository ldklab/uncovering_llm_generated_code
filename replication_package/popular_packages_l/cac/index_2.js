class CommandAndConquer {
  constructor(name = 'cli') {
    this.name = name;
    this.commands = [];
    this.globalOptions = [];
    this.rawArgs = process.argv.slice(2);
  }

  command(name, description) {
    const command = new Command(name, description);
    this.commands.push(command);
    return command;
  }

  option(name, description, extraConfig = {}) {
    this.globalOptions.push({ name, description, config: extraConfig });
    return this;
  }

  version(versionText, versionFlags = '-v, --version') {
    this.globalOptions.push({
      name: versionFlags,
      description: 'Output the version number',
      config: { version: versionText }
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

  parse(argv = this.rawArgs) {
    let commandFound = false;
    let result = { args: [], options: {} };

    this.globalOptions.forEach(option => {
      let splitNames = option.name.split(',');
      splitNames.some(flag => 
        argv.includes(flag.trim()) &&
        (
          this.showVersionOrHelp(option) || process.exit(0)
        )
      );
    });

    for (const command of this.commands) {
      if (argv.includes(command.name)) {
        commandFound = true;
        result = this.executeCommand(command, argv);
        break;
      }
    }

    if (!commandFound) {
      this.extractOptions(this.globalOptions, argv, result);
      console.log(JSON.stringify(result, null, 2)); // Example output
    }
    
    return result;
  }

  executeCommand(command, argv) {
    let commandResult = { args: [], options: {} };

    command.options.forEach(option => {
      let parts = option.name.split(',');
      let flagIndex = argv.indexOf(parts[0].trim());
      if (flagIndex !== -1) {
        commandResult.options[parts[0].replace(/^\-+/, '')] = argv[flagIndex + 1] || true;
        argv.splice(flagIndex, 2);
      }
    });

    command.actionCallback(argv, commandResult.options);
    return commandResult;
  }

  extractOptions(options, argv, result) {
    options.forEach(option => {
      const [baseFlag, altFlag] = option.name.split(',').map(flag => flag.trim());
      let usedFlagIdx = argv.indexOf(baseFlag) !== -1 ? argv.indexOf(baseFlag) : argv.indexOf(altFlag);
      if (usedFlagIdx !== -1) {
        result.options[baseFlag.replace(/^\-+/, '')] = argv[usedFlagIdx + 1] || true;
        argv.splice(usedFlagIdx, 2);
      }
    });
    result.args = argv;
  }

  showVersionOrHelp(option) {
    if (option.config.version) {
      console.log(option.config.version);
      return true;
    }
    if (option.name.includes('help')) {
      this.showHelp();
      return true;
    }
    return false;
  }

  showHelp() {
    console.log(`Usage: ${this.name} [options] [command]`);
    console.log('Options:');
    this.globalOptions.forEach(opt => {
      console.log(`  ${opt.name}\t${opt.description}`);
    });

    if (this.commands.length) {
      console.log('Commands:');
      this.commands.forEach(command => {
        console.log(`  ${command.name}\t${command.description}`);
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

  option(name, description, config = {}) {
    this.options.push({ name, description, config });
    return this;
  }

  action(callback) {
    this.actionCallback = callback;
    return this;
  }
}

module.exports = () => new CommandAndConquer();

if (require.main === module) {
  const cli = new CommandAndConquer('example-cac');

  cli
    .command('init <project>', 'Initiate a new project')
    .option('--template <template>', 'Specify a project template')
    .action((args, options) => {
      console.log(`Initialized project: ${args[0]}, Template: ${options.template}`);
    });

  cli.option('--global', 'Example global option')
    .version('1.0.0')
    .help()
    .parse();
}
