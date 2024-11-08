class CommandLineParser {
  constructor() {
    this.defaultOptions = {
      boolean: [],
      number: [],
      string: [],
    };
  }

  parse(argumentsString, options = {}) {
    const mergedOptions = { ...this.defaultOptions, ...options };
    let parsedResult = { _: [] };

    if (typeof argumentsString === 'string') {
      argumentsString = argumentsString.split(' ');
    }

    argumentsString.forEach((argument, currentIndex) => {
      if (argument.startsWith('--')) {
        this.handleLongOption(argument, argumentsString, currentIndex, mergedOptions, parsedResult);
      } else if (argument.startsWith('-')) {
        this.handleShortOption(argument, argumentsString, currentIndex, mergedOptions, parsedResult);
      } else {
        parsedResult._.push(this.determineValueType(argument, mergedOptions));
      }
    });

    return parsedResult;
  }

  handleLongOption(argument, argumentsString, currentIndex, options, result) {
    const [optionName, optionValue] = argument.slice(2).split('=');
    this.assignArgumentValue(optionName, optionValue, argumentsString, currentIndex, options, result);
  }

  handleShortOption(argument, argumentsString, currentIndex, options, result) {
    const shortFlags = argument.slice(1).split('');
    shortFlags.forEach(shortFlag => {
      this.assignArgumentValue(shortFlag, null, argumentsString, currentIndex, options, result);
    });
  }

  assignArgumentValue(keyName, value, argumentsString, currentIndex, options, result) {
    if (options.boolean.includes(keyName)) {
      result[keyName] = (value !== undefined) ? 
        this.determineValueType(value, options) :
        (!argumentsString[currentIndex + 1] || argumentsString[currentIndex + 1].startsWith('-')) ?
          true : this.determineValueType(argumentsString[++currentIndex], options);
    } else if (options.number.includes(keyName)) {
      result[keyName] = this.determineValueType(value !== undefined ? value : argumentsString[++currentIndex], options);
    } else if (options.string.includes(keyName)) {
      result[keyName] = (value !== undefined) ? value : argumentsString[++currentIndex];
    } else {
      result[keyName] = (value !== undefined) ? this.determineValueType(value, options) : this.determineValueType(argumentsString[++currentIndex], options);
    }
  }

  determineValueType(inputValue, options) {
    if (!isNaN(inputValue) && options.number) {
      return parseFloat(inputValue);
    }
    return inputValue;
  }
}

module.exports = (argsInput, optsInput) => {
  const cmdParser = new CommandLineParser();
  return cmdParser.parse(argsInput, optsInput);
};

// Example usage:
// const argv = require('./command-line-parser')('--foo=33 --bar hello'.split(' '), { boolean: ['verbose'], number: ['foo'] });
// console.log(argv);
```