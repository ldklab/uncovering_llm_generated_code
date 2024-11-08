const debug = process.env.DEBUG_NOPT || process.env.NOPT_DEBUG 
  ? (...args) => console.error(...args) 
  : () => {};

const url = require("url");
const path = require("path");
const Stream = require("stream").Stream;
const abbrev = require("abbrev");
const os = require("os");

module.exports = exports = nopt;
exports.clean = clean;
exports.typeDefs = {
  String: { type: String, validate: validateString },
  Boolean: { type: Boolean, validate: validateBoolean },
  url: { type: url, validate: validateUrl },
  Number: { type: Number, validate: validateNumber },
  path: { type: path, validate: validatePath },
  Stream: { type: Stream, validate: validateStream },
  Date: { type: Date, validate: validateDate }
};

function nopt(types, shorthands, args, slice) {
  args = args || process.argv;
  types = types || {};
  shorthands = shorthands || {};
  
  if (typeof slice !== "number") slice = 2;
  
  debug(types, shorthands, args, slice);
  
  args = args.slice(slice);
  const data = {};
  const argv = {
    remain: [],
    cooked: args,
    original: args.slice(0)
  };
  
  parse(args, data, argv.remain, types, shorthands);
  clean(data, types, exports.typeDefs);
  data.argv = argv;
  Object.defineProperty(data.argv, 'toString', { 
    value: function() {
      return this.original.map(JSON.stringify).join(" ");
    }, 
    enumerable: false 
  });
  
  return data;
}

function clean(data, types, typeDefs) {
  typeDefs = typeDefs || exports.typeDefs;
  const remove = {};
  const typeDefault = [false, true, null, String, Array];
  
  Object.keys(data).forEach(k => {
    if (k === "argv") return;
    
    let val = data[k];
    let isArray = Array.isArray(val);
    let type = types[k];
    
    if (!isArray) val = [val];
    if (!type) type = typeDefault;
    if (type === Array) type = typeDefault.concat(Array);
    if (!Array.isArray(type)) type = [type];
    
    debug("val=%j", val);
    debug("types=", type);
    
    val = val.map(val => {
      if (typeof val === "string") {
        debug("string %j", val);
        val = val.trim();
        if ((val === "null" && ~type.indexOf(null)) ||
            (val === "true" && (~type.indexOf(true) || ~type.indexOf(Boolean))) ||
            (val === "false" && (~type.indexOf(false) || ~type.indexOf(Boolean)))) {
          val = JSON.parse(val);
          debug("jsonable %j", val);
        } else if (~type.indexOf(Number) && !isNaN(val)) {
          debug("convert to number", val);
          val = +val;
        } else if (~type.indexOf(Date) && !isNaN(Date.parse(val))) {
          debug("convert to date", val);
          val = new Date(val);
        }
      }

      if (!types.hasOwnProperty(k)) {
        return val;
      }

      if (val === false && ~type.indexOf(null) &&
          !(~type.indexOf(false) || ~type.indexOf(Boolean))) {
        val = null;
      }

      const d = {};
      d[k] = val;
      debug("prevalidated val", d, val, types[k]);
      
      if (!validate(d, k, val, types[k], typeDefs)) {
        if (exports.invalidHandler) {
          exports.invalidHandler(k, val, types[k], data);
        } else if (exports.invalidHandler !== false) {
          debug("invalid: " + k + "=" + val, types[k]);
        }
        return remove;
      }
      debug("validated val", d, val, types[k]);
      
      return d[k];
    }).filter(val => val !== remove);

    if (!val.length && type.indexOf(Array) === -1) {
      debug('VAL HAS NO LENGTH, DELETE IT', val, k, type.indexOf(Array));
      delete data[k];
    } else if (isArray) {
      debug(isArray, data[k], val);
      data[k] = val;
    } else {
      data[k] = val[0];
    }
    debug("k=%s val=%j", k, val, data[k]);
  });
}

function validateString(data, k, val) {
  data[k] = String(val);
}

function validatePath(data, k, val) {
  if (val === true) return false;
  if (val === null) return true;

  val = String(val);

  const isWin = process.platform === 'win32';
  const homePattern = isWin ? /^~(\/|\\)/ : /^~\//;
  const home = os.homedir();

  if (home && val.match(homePattern)) {
    data[k] = path.resolve(home, val.substr(2));
  } else {
    data[k] = path.resolve(val);
  }
  return true;
}

function validateNumber(data, k, val) {
  debug("validate Number %j %j %j", k, val, isNaN(val));
  if (isNaN(val)) return false;
  data[k] = +val;
}

function validateDate(data, k, val) {
  const s = Date.parse(val);
  debug("validate Date %j %j %j", k, val, s);
  if (isNaN(s)) return false;
  data[k] = new Date(val);
}

function validateBoolean(data, k, val) {
  if (val instanceof Boolean) val = val.valueOf();
  else if (typeof val === "string") {
    if (!isNaN(val)) val = !!(+val);
    else if (val === "null" || val === "false") val = false;
    else val = true;
  } else val = !!val;
  data[k] = val;
}

function validateUrl(data, k, val) {
  val = url.parse(String(val));
  if (!val.host) return false;
  data[k] = val.href;
}

function validateStream(data, k, val) {
  if (!(val instanceof Stream)) return false;
  data[k] = val;
}

function validate(data, k, val, type, typeDefs) {
  if (Array.isArray(type)) {
    for (let i = 0, l = type.length; i < l; i++) {
      if (type[i] === Array) continue;
      if (validate(data, k, val, type[i], typeDefs)) return true;
    }
    delete data[k];
    return false;
  }

  if (type === Array) return true;

  if (type !== type) {
    debug("Poison NaN", k, val, type);
    delete data[k];
    return false;
  }

  if (val === type) {
    debug("Explicitly allowed %j", val);
    data[k] = val;
    return true;
  }

  let ok = false;
  const types = Object.keys(typeDefs);
  for (let i = 0, l = types.length; i < l; i++) {
    debug("test type %j %j %j", k, val, types[i]);
    const t = typeDefs[types[i]];
    if (t && ((type && type.name && t.type && t.type.name) ? (type.name === t.type.name) : (type === t.type))) {
      const d = {};
      ok = false !== t.validate(d, k, val);
      val = d[k];
      if (ok) {
        data[k] = val;
        break;
      }
    }
  }
  debug("OK? %j (%j %j %j)", ok, k, val, types[i]);

  if (!ok) delete data[k];
  return ok;
}

function parse(args, data, remain, types, shorthands) {
  debug("parse", args, data, remain);

  const abbrevs = abbrev(Object.keys(types));
  const shortAbbr = abbrev(Object.keys(shorthands));

  for (let i = 0; i < args.length; i++) {
    let arg = args[i];
    debug("arg", arg);

    if (arg.match(/^-{2,}$/)) {
      remain.push.apply(remain, args.slice(i + 1));
      args[i] = "--";
      break;
    }

    let hadEq = false;
    if (arg.charAt(0) === "-" && arg.length > 1) {
      const at = arg.indexOf('=');
      if (at > -1) {
        hadEq = true;
        const v = arg.substr(at + 1);
        arg = arg.substr(0, at);
        args.splice(i, 1, arg, v);
      }

      const shRes = resolveShort(arg, shorthands, shortAbbr, abbrevs);
      debug("arg=%j shRes=%j", arg, shRes);
      if (shRes) {
        debug(arg, shRes);
        args.splice.apply(args, [i, 1].concat(shRes));
        if (arg !== shRes[0]) {
          i--;
          continue;
        }
      }
      arg = arg.replace(/^-+/, "");
      let no = null;
      while (arg.toLowerCase().indexOf("no-") === 0) {
        no = !no;
        arg = arg.substr(3);
      }

      if (abbrevs[arg]) arg = abbrevs[arg];

      let argType = types[arg];
      let isTypeArray = Array.isArray(argType);
      if (isTypeArray && argType.length === 1) {
        isTypeArray = false;
        argType = argType[0];
      }

      const isArray = argType === Array || (isTypeArray && argType.indexOf(Array) !== -1);

      if (!types.hasOwnProperty(arg) && data.hasOwnProperty(arg)) {
        if (!Array.isArray(data[arg])) data[arg] = [data[arg]];
        isArray = true;
      }

      let val;
      let la = args[i + 1];

      const isBool = typeof no === 'boolean' ||
        argType === Boolean ||
        (isTypeArray && argType.indexOf(Boolean) !== -1) ||
        (typeof argType === 'undefined' && !hadEq) ||
        (la === "false" && (argType === null || (isTypeArray && ~argType.indexOf(null))));

      if (isBool) {
        val = !no;
        if (la === "true" || la === "false") {
          val = JSON.parse(la);
          la = null;
          if (no) val = !val;
          i++;
        }

        if (isTypeArray && la) {
          if (~argType.indexOf(la)) {
            val = la;
            i++;
          } else if (la === "null" && ~argType.indexOf(null)) {
            val = null;
            i++;
          } else if (!la.match(/^-{2,}[^-]/) && !isNaN(la) && ~argType.indexOf(Number)) {
            val = +la;
            i++;
          } else if (!la.match(/^-[^-]/) && ~argType.indexOf(String)) {
            val = la;
            i++;
          }
        }

        if (isArray) (data[arg] = data[arg] || []).push(val);
        else data[arg] = val;

        continue;
      }

      if (argType === String) {
        if (la === undefined) {
          la = "";
        } else if (la.match(/^-{1,2}[^-]+/)) {
          la = "";
          i--;
        }
      }

      if (la && la.match(/^-{2,}$/)) {
        la = undefined;
        i--;
      }

      val = la === undefined ? true : la;
      if (isArray) (data[arg] = data[arg] || []).push(val);
      else data[arg] = val;

      i++;
      continue;
    }

    remain.push(arg);
  }
}

function resolveShort(arg, shorthands, shortAbbr, abbrevs) {
  arg = arg.replace(/^-+/, '');

  if (abbrevs[arg] === arg) return null;

  if (shorthands[arg]) {
    if (shorthands[arg] && !Array.isArray(shorthands[arg])) {
      shorthands[arg] = shorthands[arg].split(/\s+/);
    }
    return shorthands[arg];
  }

  let singles = shorthands.___singles;
  if (!singles) {
    singles = Object.keys(shorthands).filter(s => s.length === 1).reduce((l, r) => {
      l[r] = true;
      return l;
    }, {});
    shorthands.___singles = singles;
    debug('shorthand singles', singles);
  }

  const chrs = arg.split("").filter(c => singles[c]);
  if (chrs.join("") === arg) return chrs.map(c => shorthands[c]).reduce((l, r) => l.concat(r), []);

  if (abbrevs[arg] && !shorthands[arg]) return null;

  if (shortAbbr[arg]) arg = shortAbbr[arg];

  if (shorthands[arg] && !Array.isArray(shorthands[arg])) {
    shorthands[arg] = shorthands[arg].split(/\s+/);
  }
  return shorthands[arg];
}
