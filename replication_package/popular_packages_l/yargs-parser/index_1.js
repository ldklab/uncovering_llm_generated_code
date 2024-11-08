class YargsParser {
  constructor() {
    this.defaults = {
      boolean: [],
      number: [],
      string: [],
    };
  }

  parse(args, opts = {}) {
    const options = { ...this.defaults, ...opts };
    let result = { _: [] };

    if (typeof args === 'string') {
      args = args.split(' ');
    }

    args.forEach((arg, index) => {
      if (arg.startsWith('--')) {
        this.parseLongOption(arg, args, index, options, result);
      } else if (arg.startsWith('-')) {
        this.parseShortOption(arg, args, index, options, result);
      } else {
        result._.push(this.castValue(arg, options));
      }
    });

    return result;
  }

  parseLongOption(arg, args, index, options, result) {
    const [key, value] = arg.slice(2).split('=');
    this.setArgValue(key, value, args, index, options, result);
  }

  parseShortOption(arg, args, index, options, result) {
    const chars = arg.slice(1).split('');
    chars.forEach(char => {
      this.setArgValue(char, null, args, index, options, result);
    });
  }

  setArgValue(key, value, args, index, options, result) {
    if (options.boolean.includes(key)) {
      result[key] = value !== undefined ?
        this.castValue(value, options) :
        !args[index + 1] || (args[index + 1] && args[index + 1][0] === '-') ?
          true : this.castValue(args[++index], options);
    } else if (options.number.includes(key)) {
      result[key] = this.castValue(value !== undefined ? value : args[++index], options);
    } else if (options.string.includes(key)) {
      result[key] = value !== undefined ? value : args[++index];
    } else {
      result[key] = value !== undefined ? this.castValue(value, options) : this.castValue(args[++index], options);
    }
  }

  castValue(value, options) {
    if (!isNaN(value) && options.number) {
      return parseFloat(value);
    }
    return value;
  }
}

module.exports = (args, opts) => {
  const parser = new YargsParser();
  return parser.parse(args, opts);
};

// Example usage:
// const argv = require('./yargs-parser')('--foo=33 --bar hello'.split(' '), { boolean: ['verbose'], number: ['foo'] });
// console.log(argv);
```