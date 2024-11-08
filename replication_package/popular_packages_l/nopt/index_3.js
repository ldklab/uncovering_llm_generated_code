// nopt.js

const path = require("path");

class ArgumentParser {
  constructor() {
    this.types = {
      'String': { type: 'string', validate: (val) => val },
      'Number': { type: 'number', validate: (val) => !isNaN(parseFloat(val)) ? Number(val) : NaN },
      'Boolean': { type: 'boolean', validate: (val) => val === 'true' || val === true },
      'path': { type: 'path', validate: (val) => path.resolve(val) },
      'Array': { type: 'array', validate: (val) => Array.isArray(val) ? val : [val] },
    };
    this.onInvalid = (key, val, type) => console.error(`Invalid value: ${val} for key: ${key}`);
  }

  parseOptions(definedOpts, shortOpts, args = process.argv, start = 2) {
    const result = { argv: { remain: [], original: [...args], processed: [] } };
    args = args.slice(start);
    
    args.forEach((arg, idx) => {
      if (arg.startsWith('--')) {
        this.handleLongFlag(arg, definedOpts, result);
      } else if (arg.startsWith('-')) {
        this.handleShortFlag(arg, shortOpts, args, idx, result);
      } else {
        result.argv.remain.push(arg);
      }
    });

    return result;
  }
  
  handleLongFlag(arg, definedOpts, result) {
    let [key, val] = arg.slice(2).split('=');
    if (val === undefined) val = true; 
    if (key.startsWith('no-')) val = false;
    
    const optTypes = definedOpts[key.replace('no-', '')];
    if (optTypes) {
      val = this.validateType(val, optTypes) || true;
    }
    
    result[key.replace('no-', '')] = val;
  }

  handleShortFlag(arg, shortOpts, args, idx, result) {
    arg.slice(1).split('').forEach(ch => {
      const expandedArgs = shortOpts[ch];
      if (expandedArgs) {
        expandedArgs.forEach(expArg => {
          if (!expArg.startsWith('--')) {
            const val = args[++idx];
            result.argv.remain.push(val);
          } else {
            this.handleLongFlag(expArg, definedOpts, result);
          }
        });
      } else {
        result.argv.remain.push(`-${ch}`);
      }
    });
  }
  
  validateType(val, opts) {
    for (const type of opts) {
      const typeDef = this.types[type.name || type];
      if (typeDef && typeDef.validate(val)) {
        return typeDef.validate(val);
      }
    }
    this.onInvalid(key, val, opts);
    return null;
  }
}

module.exports = new ArgumentParser();
