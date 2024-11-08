// nopt.js

const path = require("path");

class Nopt {
  constructor() {
    this.typeDefinitions = {
      'String': { type: 'string', validate: (val) => val },
      'Number': { type: 'number', validate: (val) => !isNaN(parseFloat(val)) ? Number(val) : NaN },
      'Boolean': { type: 'boolean', validate: (val) => val === 'true' || val === true },
      'path': { type: 'path', validate: (val) => path.resolve(val) },
      'Array': { type: 'array', validate: (val) => Array.isArray(val) ? val : [val] },
    };
    this.invalidHandler = (key, val, type) => console.error(`Invalid value: ${val} for key: ${key}`);
  }

  parse(knownOptions, shorthandFlags, args = process.argv, offset = 2) {
    const output = { argv: { remain: [], original: [...args], cooked: [] } };
    const slicedArgs = args.slice(offset);

    slicedArgs.forEach((arg, i) => {
      if (arg.startsWith('--')) {
        this._handleLongFlag(arg, knownOptions, output);
      } else if (arg.startsWith('-')) {
        this._handleShortFlag(arg, shorthandFlags, slicedArgs, i, output);
      } else {
        output.argv.remain.push(arg);
      }
    });

    return output;
  }

  _handleLongFlag(arg, knownOptions, output) {
    let [key, val] = arg.slice(2).split('=');
    val = val === undefined ? true : val; // Handle flags like --flag
    if (key.startsWith('no-')) val = false;
    
    const optionTypes = knownOptions[key.replace('no-', '')];
    if (optionTypes) {
      val = this._checkValue(val, optionTypes) || true;
    }
    
    output[key.replace('no-', '')] = val;
  }

  _handleShortFlag(arg, shorthandFlags, args, index, output) {
    arg.slice(1).split('').forEach(char => {
      const expandedFlags = shorthandFlags[char];
      if (expandedFlags) {
        expandedFlags.forEach(expArg => {
          if (!expArg.startsWith('--')) {
            const val = args[++index];
            output.argv.remain.push(val);
          } else {
            this._handleLongFlag(expArg, knownOptions, output);
          }
        });
      } else {
        output.argv.remain.push(`-${char}`);
      }
    });
  }

  _checkValue(val, types) {
    for (const type of types) {
      const typeDefinition = this.typeDefinitions[type.name || type];
      if (typeDefinition && typeDefinition.validate(val)) {
        return typeDefinition.validate(val);
      }
    }
    this.invalidHandler(key, val, types);
    return null;
  }
}

module.exports = new Nopt();
