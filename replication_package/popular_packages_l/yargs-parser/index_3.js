class ArgParser {
  constructor() {
    this.defaultTypes = {
      boolean: [],
      number: [],
      string: [],
    };
  }

  parseInput(args, options = {}) {
    const configuredOptions = { ...this.defaultTypes, ...options };
    let parsedResults = { _: [] };

    if (typeof args === 'string') {
      args = args.split(' ');
    }

    args.forEach((arg, i) => {
      if (arg.startsWith('--')) {
        this.handleLongOption(arg, args, i, configuredOptions, parsedResults);
      } else if (arg.startsWith('-')) {
        this.handleShortOption(arg, args, i, configuredOptions, parsedResults);
      } else {
        parsedResults._.push(this.convertValue(arg, configuredOptions));
      }
    });

    return parsedResults;
  }

  handleLongOption(arg, args, idx, options, results) {
    const [key, val] = arg.slice(2).split('=');
    this.assignArgumentValue(key, val, args, idx, options, results);
  }

  handleShortOption(arg, args, idx, options, results) {
    const shortOpts = arg.slice(1).split('');
    shortOpts.forEach(opt => {
      this.assignArgumentValue(opt, null, args, idx, options, results);
    });
  }

  assignArgumentValue(key, val = undefined, args, idx, options, results) {
    if (options.boolean.includes(key)) {
      results[key] = val !== undefined ? 
        this.convertValue(val, options) : 
        (args[idx + 1] && args[idx + 1][0] !== '-') ? 
          this.convertValue(args[++idx], options) : true;
    } else if (options.number.includes(key)) {
      results[key] = this.convertValue(val !== undefined ? val : args[++idx], options);
    } else if (options.string.includes(key)) {
      results[key] = val !== undefined ? val : args[++idx];
    } else {
      results[key] = val !== undefined ? this.convertValue(val, options) : this.convertValue(args[++idx], options);
    }
  }

  convertValue(value, options) {
    if (!isNaN(value) && options.number) {
      return parseFloat(value);
    }
    return value;
  }
}

module.exports = (args, opts) => {
  const argParser = new ArgParser();
  return argParser.parseInput(args, opts);
};

// Example use:
// const inputArgs = require('./arg-parser')('--foo=123 --bar world'.split(' '), { boolean: ['debug'], number: ['foo'] });
// console.log(inputArgs);
```