const url = require('url');
const path = require('path');
const { Stream } = require('stream');
const abbrev = require('abbrev');
const os = require('os');

function debugLog(...args) {
  if (process.env.DEBUG_NOPT || process.env.NOPT_DEBUG) {
    console.error(...args);
  }
}

module.exports = nopt;
exports.clean = clean;

exports.typeDefs = {
  String: { type: String, validate: validateString },
  Boolean: { type: Boolean, validate: validateBoolean },
  url: { type: url, validate: validateUrl },
  Number: { type: Number, validate: validateNumber },
  path: { type: path, validate: validatePath },
  Stream: { type: Stream, validate: validateStream },
  Date: { type: Date, validate: validateDate },
};

function nopt(types = {}, shorthands = {}, args = process.argv, slice = 2) {
  args = args.slice(slice);
  const data = {};
  const remain = [];
  const argv = { remain, cooked: args, original: args.slice() };

  parse(args, data, remain, types, shorthands);
  clean(data, types, exports.typeDefs);
  data.argv = argv;
  Object.defineProperty(data.argv, 'toString', {
    value: () => data.argv.original.map(JSON.stringify).join(' '),
    enumerable: false,
  });
  return data;
}

function clean(data, types, typeDefs = exports.typeDefs) {
  const typeDefault = [false, true, null, String, Array];
  const remove = {};

  Object.keys(data).forEach((k) => {
    if (k === 'argv') return;
    let val = data[k],
      isArray = Array.isArray(val),
      type = types[k];

    val = isArray ? val : [val];
    type = type ? (Array.isArray(type) && type.length === 1 ? type[0] : type) : typeDefault;
    if (type === Array) type = typeDefault.concat(Array);

    val = val.map((v) => {
      if (typeof v === 'string') {
        v = v.trim();
        if ((v === 'null' && type.includes(null)) || (v === 'true' && type.includes(true)) || (v === 'false' && type.includes(false))) {
          v = JSON.parse(v);
        } else if (type.includes(Number) && !isNaN(v)) {
          v = +v;
        } else if (type.includes(Date) && !isNaN(Date.parse(v))) {
          v = new Date(v);
        }
      }

      if (!types.hasOwnProperty(k)) return v;

      if (!validate({ [k]: v }, k, v, types[k], typeDefs)) {
        return remove;
      }
      return v;
    }).filter(v => v !== remove);

    if (!val.length && !type.includes(Array)) {
      delete data[k];
    } else if (isArray) {
      data[k] = val;
    } else {
      data[k] = val[0];
    }
  });
}

function validateString(data, k, val) {
  data[k] = String(val);
}

function validatePath(data, k, val) {
  if (val === true) return false;
  if (val === null) return true;

  val = String(val);
  const resolvedPath = process.platform === 'win32' ? /^~(\/|\\)/.test(val) ? path.resolve(os.homedir(), val.substr(2)) : path.resolve(val) : /^~\//.test(val) ? path.resolve(os.homedir(), val.substr(2)) : path.resolve(val);

  data[k] = resolvedPath;
  return true;
}

function validateNumber(data, k, val) {
  if (isNaN(val)) return false;
  data[k] = +val;
}

function validateDate(data, k, val) {
  const parsedDate = Date.parse(val);
  if (isNaN(parsedDate)) return false;
  data[k] = new Date(val);
}

function validateBoolean(data, k, val) {
  if (val instanceof Boolean) val = val.valueOf();
  else if (typeof val === 'string') {
    val = !isNaN(val) ? !!(+val) : (val === 'null' || val === 'false') ? false : true;
  } else {
    val = !!val;
  }
  data[k] = val;
}

function validateUrl(data, k, val) {
  const parsedUrl = url.parse(String(val));
  if (!parsedUrl.host) return false;
  data[k] = parsedUrl.href;
}

function validateStream(data, k, val) {
  if (!(val instanceof Stream)) return false;
  data[k] = val;
}

function validate(data, k, val, type, typeDefs) {
  if (Array.isArray(type)) {
    for (const singleType of type) {
      if (singleType === Array) continue;
      if (validate(data, k, val, singleType, typeDefs)) return true;
    }
    delete data[k];
    return false;
  }
  
  if (type === Array) return true;

  if (type !== type) {
    delete data[k];
    return false;
  }

  if (val === type) {
    data[k] = val;
    return true;
  }

  for (const typeName of Object.keys(typeDefs)) {
    const t = typeDefs[typeName];
    if (t && (type === t.type || (type.name && t.type.name && type.name === t.type.name))) {
      const d = {};
      const isValid = t.validate(d, k, val) !== false;
      if (isValid) {
        data[k] = d[k];
        return true;
      }
    }
  }

  delete data[k];
  return false;
}

function parse(args, data, remain, types, shorthands) {
  const abbrevs = abbrev(Object.keys(types));
  const shortAbbr = abbrev(Object.keys(shorthands));

  for (let i = 0; i < args.length; i++) {
    let arg = args[i];

    if (/^-{2,}$/.test(arg)) {
      remain.push(...args.slice(i + 1));
      args[i] = "--";
      break;
    }

    if (arg.startsWith('-')) {
      const at = arg.indexOf('=');
      const hadEq = at > -1;
      
      if (hadEq) {
        const v = arg.substr(at + 1);
        arg = arg.substr(0, at);
        args.splice(i, 1, arg, v);
      }

      const resolvedShorthand = resolveShort(arg, shorthands, shortAbbr, abbrevs);
      if (resolvedShorthand) {
        args.splice(i, 1, ...resolvedShorthand);
        if (arg !== resolvedShorthand[0]) {
          i--;
          continue;
        }
      }

      arg = arg.replace(/^-+/, "");
      let no = null;
      while (arg.toLowerCase().startsWith("no-")) {
        no = !no;
        arg = arg.substr(3);
      }

      if (abbrevs[arg]) arg = abbrevs[arg];

      let argType = types[arg];
      let isTypeArray = Array.isArray(argType);
      if (isTypeArray && argType.length === 1) {
        argType = argType[0];
        isTypeArray = false;
      }

      let isArray = argType === Array || (isTypeArray && argType.indexOf(Array) !== -1);

      if (!types.hasOwnProperty(arg) && data.hasOwnProperty(arg)) {
        if (!Array.isArray(data[arg])) data[arg] = [data[arg]];
        isArray = true;
      }

      let val;
      let la = args[i + 1];

      const isBool = typeof no === 'boolean' || argType === Boolean || (isTypeArray && argType.includes(Boolean)) || (argType === undefined && !hadEq) || (la === "false" && (argType === null || isTypeArray && argType.includes(null)));

      if (isBool) {
        val = !no;
        if (la === "true" || la === "false") {
          val = JSON.parse(la);
          if (no) val = !val;
          i++;
        }

        if (isTypeArray && la) {
          if (argType.includes(la)) {
            val = la;
            i++;
          } else if (la === "null" && argType.includes(null)) {
            val = null;
            i++;
          } else if (!/^-{2,}[^-]/.test(la) && !isNaN(la) && argType.includes(Number)) {
            val = +la;
            i++;
          } else if (!/^-[^-]/.test(la) && argType.includes(String)) {
            val = la;
            i++;
          }
        }

        if (isArray) (data[arg] = data[arg] || []).push(val);
        else data[arg] = val;

        continue;
      }

      if (argType === String) {
        la = la === undefined || /^-{1,2}[^-]+/.test(la) ? "" : la;
      }

      if (la && /^-{2,}$/.test(la)) {
        la = undefined;
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
    if (!Array.isArray(shorthands[arg])) shorthands[arg] = shorthands[arg].split(/\s+/);
    return shorthands[arg];
  }

  let singles = shorthands.___singles;
  if (!singles) {
    singles = Object.keys(shorthands)
      .filter(s => s.length === 1)
      .reduce((l, r) => ({ ...l, [r]: true }), {});
    shorthands.___singles = singles;
  }

  const chrs = arg.split("").filter(c => singles[c]);
  if (chrs.join("") === arg) return chrs.map(c => shorthands[c]).reduce((l, r) => l.concat(r), []);

  if (abbrevs[arg] && !shorthands[arg]) return null;

  if (shortAbbr[arg]) arg = shortAbbr[arg];

  if (shorthands[arg] && !Array.isArray(shorthands[arg])) shorthands[arg] = shorthands[arg].split(/\s+/);

  return shorthands[arg];
}
