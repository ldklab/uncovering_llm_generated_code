// argparse.js
'use strict';

/**
 * A simple implementation of an argument parser similar to Python's argparse
 */
class ArgumentParser {
  constructor(options = {}) {
    this.description = options.description || '';
    this.arguments = [];
    this.showHelp = options.add_help !== false;

    if (this.showHelp) {
      this.add_argument('-h', '--help', {
        action: 'storeTrue',
        help: 'show this help message and exit'
      });
    }
  }

  add_argument(shortName, longName, options = {}) {
    const arg = {
      shortName: shortName,
      longName: longName,
      options: options,
      dest: this._getDest(longName)
    };

    this.arguments.push(arg);
  }

  _getDest(argName) {
    return argName.replace(/^-+/, '').replace(/-([a-z])/g, (g) => g[1].toUpperCase());
  }

  parse_args() {
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
          this.print_help();
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

  print_help() {
    console.log(`usage: ${process.argv[1]} [-h] [args...]`);
    console.log(this.description);
    console.log('\noptional arguments:');
    this.arguments.forEach(arg => {
      const options = arg.options;
      console.log(`  ${arg.shortName}${arg.longName ? ', ' + arg.longName : ''}\t\t${options.help || ''}`);
    });
  }
}

// Export the ArgumentParser for use in other files.
exports.ArgumentParser = ArgumentParser;

// test.js - Example usage
#!/usr/bin/env node
'use strict';

const { ArgumentParser } = require('./argparse');
const { version } = require('./package.json');

const parser = new ArgumentParser({
  description: 'Argparse example'
});

parser.add_argument('-v', '--version', { action: 'version', version });
parser.add_argument('-f', '--foo', { help: 'foo bar' });
parser.add_argument('-b', '--bar', { help: 'bar foo' });
parser.add_argument('--baz', { help: 'baz bar' });

console.dir(parser.parse_args());
