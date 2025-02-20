class CommandLineParser {
  constructor() {
    this.defaultOptions = {
      boolean: [],
      number: [],
      string: [],
    };
  }

  parse(argumentsInput, optionsInput = {}) {
    const combinedOptions = { ...this.defaultOptions, ...optionsInput };
    let parsedResult = { _: [] };

    if (typeof argumentsInput === 'string') {
      argumentsInput = argumentsInput.split(' ');
    }

    argumentsInput.forEach((argument, index) => {
      if (argument.startsWith('--')) {
        this.parseCompleteOption(argument, argumentsInput, index, combinedOptions, parsedResult);
      } else if (argument.startsWith('-')) {
        this.parseShorthandOption(argument, argumentsInput, index, combinedOptions, parsedResult);
      } else {
        parsedResult._.push(this.transformValue(argument, combinedOptions));
      }
    });

    return parsedResult;
  }

  parseCompleteOption(argument, argumentsInput, index, combinedOptions, parsedResult) {
    const [key, value] = argument.slice(2).split('=');
    this.assignOptionValue(key, value, argumentsInput, index, combinedOptions, parsedResult);
  }

  parseShorthandOption(argument, argumentsInput, index, combinedOptions, parsedResult) {
    const chars = argument.slice(1).split('');
    chars.forEach(char => {
      this.assignOptionValue(char, null, argumentsInput, index, combinedOptions, parsedResult);
    });
  }

  assignOptionValue(key, value, argumentsInput, index, combinedOptions, parsedResult) {
    if (combinedOptions.boolean.includes(key)) {
      parsedResult[key] = value !== undefined ?
        this.transformValue(value, combinedOptions) :
        !argumentsInput[index + 1] || (argumentsInput[index + 1] && argumentsInput[index + 1][0] === '-') ?
          true : this.transformValue(argumentsInput[++index], combinedOptions);
    } else if (combinedOptions.number.includes(key)) {
      parsedResult[key] = this.transformValue(value !== undefined ? value : argumentsInput[++index], combinedOptions);
    } else if (combinedOptions.string.includes(key)) {
      parsedResult[key] = value !== undefined ? value : argumentsInput[++index];
    } else {
      parsedResult[key] = value !== undefined ? this.transformValue(value, combinedOptions) : this.transformValue(argumentsInput[++index], combinedOptions);
    }
  }

  transformValue(value, combinedOptions) {
    if (!isNaN(value) && combinedOptions.number) {
      return parseFloat(value);
    }
    return value;
  }
}

module.exports = (argumentsInput, optionsInput) => {
  const parser = new CommandLineParser();
  return parser.parse(argumentsInput, optionsInput);
};

// Example usage:
// const argv = require('./command-line-parser')('--foo=33 --bar hello'.split(' '), { boolean: ['verbose'], number: ['foo'] });
// console.log(argv);
```