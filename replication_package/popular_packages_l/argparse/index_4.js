// argparse.js
'use strict';

/**
 * Implements a basic argument parser inspired by Python's argparse.
 */
class ArgumentParser {
  constructor(options = {}) {
    this.description = options.description || '';
    this.arguments = [];
    this.showHelp = options.add_help !== false;

    if (this.showHelp) {
      this.addArgument('-h', '--help', {
        action: 'storeTrue',
        help: 'show this help message and exit'
      });
    }
  }

  addArgument(shortName, longName, options = {}) {
    const arg = {
      shortName: shortName,
      longName: longName,
      options: options,
      dest: this.getDest(longName)
    };

    this.arguments.push(arg);
  }

  getDest(argName) {
    return argName.replace(/^-+/, '').replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
  }

  parseArgs() {
    const args = process.argv.slice(2);
    const result = {};
    let currentArg = null;

    args.forEach((arg) => {
      if (arg.startsWith('-')) {
        const argDef = this.arguments.find(argSet =>
          argSet.shortName === arg || argSet.longName === arg
        );

        if (argDef) {
          currentArg = argDef;
          if (argDef.options.action === 'storeTrue') {
            result[currentArg.dest] = true;
            currentArg = null;
          } else if (argDef.options.action === 'version') {
            console.log(argDef.options.version);
            process.exit(0);
          }
        } else if (arg === '-h' || arg === '--help') {
          this.printHelp();
          process.exit(0);
        } else {
          throw new Error(`unrecognized argument: ${arg}`);
        }
      } else {
        if (currentArg != null) {
          result[currentArg.dest] = arg;
          currentArg = null;
        }
      }
    });

    this.arguments.forEach(arg => {
      if (!result[arg.dest] && arg.options.default) {
        result[arg.dest] = arg.options.default;
      }
    });

    return result;
  }

  printHelp() {
    console.log(`Usage: ${process.argv[1]} [-h] [args...]`);
    console.log(this.description);
    console.log('\nOptional arguments:');
    this.arguments.forEach(arg => {
      const options = arg.options;
      console.log(`  ${arg.shortName}${arg.longName ? ', ' + arg.longName : ''}\t\t${options.help || ''}`);
    });
  }
}

module.exports = { ArgumentParser };

// test.js - Example usage
#!/usr/bin/env node
'use strict';

const { ArgumentParser } = require('./argparse');
const { version } = require('./package.json');

const parser = new ArgumentParser({
  description: 'Argparse example'
});

parser.addArgument('-v', '--version', { action: 'version', version });
parser.addArgument('-f', '--foo', { help: 'foo bar' });
parser.addArgument('-b', '--bar', { help: 'bar foo' });
parser.addArgument('--baz', { help: 'baz bar' });

console.dir(parser.parseArgs());
