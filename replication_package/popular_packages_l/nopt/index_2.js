const path = require("path");

class Nopt {
  constructor() {
    this.typeDefs = {
      'String': { type: 'string', validate: (val) => val },
      'Number': { type: 'number', validate: (val) => !isNaN(parseFloat(val)) ? Number(val) : NaN },
      'Boolean': { type: 'boolean', validate: (val) => val === 'true' || val === true },
      'path': { type: 'path', validate: (val) => path.resolve(val) },
      'Array': { type: 'array', validate: (val) => Array.isArray(val) ? val : [val] }
    };
    this.invalidHandler = (key, val, type) => console.error(`Invalid value: ${val} for key: ${key}`);
  }

  parse(knownOpts, shortHands, args = process.argv, slice = 2) {
    const parsed = { argv: { remain: [], original: [...args], cooked: [] } };
    args.slice(slice).forEach((arg, index) => {
      if (arg.startsWith('--')) {
        this._parseLongFlag(arg, knownOpts, parsed);
      } else if (arg.startsWith('-')) {
        this._parseShortFlag(arg, shortHands, args, index, parsed);
      } else {
        parsed.argv.remain.push(arg);
      }
    });
    return parsed;
  }
  
  _parseLongFlag(arg, knownOpts, parsed) {
    let [key, val] = arg.slice(2).split('=');
    if (val === undefined) val = true;
    if (key.startsWith('no-')) val = false;
    
    const optTypes = knownOpts[key.replace('no-', '')];
    if (optTypes) {
      val = this._validateValue(key.replace('no-', ''), val, optTypes) || true;
    }    
    parsed[key.replace('no-', '')] = val;
  }

  _parseShortFlag(arg, shortHands, args, index, parsed) {
    arg.slice(1).split('').forEach(ch => {
      const expanded = shortHands[ch];
      if (expanded) {
        expanded.forEach(expArg => {
          if (!expArg.startsWith('--')) {
            let val = args[++index];
            parsed.argv.remain.push(val);
          } else {
            this._parseLongFlag(expArg, knownOpts, parsed);
          }
        });
      } else {
        parsed.argv.remain.push(`-${ch}`);
      }
    });
  }
  
  _validateValue(key, val, types) {
    for (let type of types) {
      const typeDef = this.typeDefs[type.name || type];
      if (typeDef && typeDef.validate(val)) {
        return typeDef.validate(val);
      }
    }
    this.invalidHandler(key, val, types);
    return null;
  }
}

module.exports = new Nopt();
