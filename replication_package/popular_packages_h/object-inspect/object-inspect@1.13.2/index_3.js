const hasMap = typeof Map === 'function';
const mapProps = hasMap && {
  size: Object.getOwnPropertyDescriptor(Map.prototype, 'size'),
  forEach: Map.prototype.forEach,
};

const hasSet = typeof Set === 'function';
const setProps = hasSet && {
  size: Object.getOwnPropertyDescriptor(Set.prototype, 'size'),
  forEach: Set.prototype.forEach,
};

const hasWeakMap = typeof WeakMap === 'function';
const hasWeakSet = typeof WeakSet === 'function';
const hasWeakRef = typeof WeakRef === 'function';

const utils = {
  booleanValueOf: Boolean.prototype.valueOf,
  objectToString: Object.prototype.toString,
  functionToString: Function.prototype.toString,
  stringMethods: {
    match: String.prototype.match,
    slice: String.prototype.slice,
    replace: String.prototype.replace,
    toUpperCase: String.prototype.toUpperCase,
    toLowerCase: String.prototype.toLowerCase,
  },
  regexTest: RegExp.prototype.test,
  arrayMethods: {
    concat: Array.prototype.concat,
    join: Array.prototype.join,
    slice: Array.prototype.slice,
  },
  mathFloor: Math.floor,
  bigIntValueOf: typeof BigInt === 'function' ? BigInt.prototype.valueOf : null,
  gOPS: Object.getOwnPropertySymbols,
  symToString: typeof Symbol === 'function' ? Symbol.prototype.toString : null,
  hasShammedSymbols: typeof Symbol === 'function' && typeof Symbol.iterator === 'object',
  toStringTag: typeof Symbol === 'function' ? Symbol.toStringTag : null,
  isEnumerable: Object.prototype.propertyIsEnumerable,
  getPrototypeOf: Object.getPrototypeOf,
};

if (typeof Reflect === 'function' && Reflect.getPrototypeOf) {
  utils.getPrototypeOf = Reflect.getPrototypeOf;
} else if ([].__proto__ === Array.prototype) { // eslint-disable-line no-proto
  utils.getPrototypeOf = (O) => O.__proto__; // eslint-disable-line no-proto
}

function addNumericSeparator(num, str) {
  if (
    num === Infinity || num === -Infinity || num !== num ||
    (num && num > -1000 && num < 1000) || utils.regexTest.call(/e/, str)
  ) return str;

  const sepRegex = /[0-9](?=(?:[0-9]{3})+(?![0-9]))/g;
  const intPart = utils.mathFloor(Math.abs(num));
  if (intPart !== num) {
    const intStr = String(intPart);
    const dec = utils.stringMethods.slice.call(str, intStr.length + 1);
    return utils.stringMethods.replace.call(intStr, sepRegex, '$&_') + '.' +
      utils.stringMethods.replace.call(utils.stringMethods.replace.call(dec, /([0-9]{3})/g, '$&_'), /_$/, '');
  }

  return utils.stringMethods.replace.call(str, sepRegex, '$&_');
}

const utilInspect = require('./util.inspect');
const inspectCustom = utilInspect.custom;
const inspectSymbol = typeof inspectCustom === 'symbol' ? inspectCustom : null;

module.exports = function inspect_(obj, options, depth = 0, seen = []) {
  const opts = options || {};

  if (opts.quoteStyle && opts.quoteStyle !== 'single' && opts.quoteStyle !== 'double') {
    throw new TypeError('option "quoteStyle" must be "single" or "double"');
  }

  if (
    opts.maxStringLength !== undefined &&
    (typeof opts.maxStringLength !== 'number' || opts.maxStringLength < 0 && opts.maxStringLength !== Infinity)
  ) {
    throw new TypeError('option "maxStringLength", if provided, must be a positive integer, Infinity, or `null`');
  }

  const customInspect = opts.hasOwnProperty('customInspect') ? opts.customInspect : true;

  if (typeof customInspect !== 'boolean' && customInspect !== 'symbol') {
    throw new TypeError('option "customInspect", if provided, must be `true`, `false`, or `\'symbol\'`');
  }

  if (
    opts.indent !== undefined &&
    opts.indent !== null &&
    opts.indent !== '\t' &&
    !(parseInt(opts.indent, 10) === opts.indent && opts.indent > 0)
  ) {
    throw new TypeError('option "indent" must be "\\t", an integer > 0, or `null`');
  }

  if (
    opts.numericSeparator !== undefined &&
    typeof opts.numericSeparator !== 'boolean'
  ) {
    throw new TypeError('option "numericSeparator", if provided, must be `true` or `false`');
  }

  if (typeof obj === 'undefined') return 'undefined';
  if (obj === null) return 'null';
  if (typeof obj === 'boolean') return obj ? 'true' : 'false';

  if (typeof obj === 'string') {
    return inspectString(obj, opts);
  }

  const numericSeparator = opts.numericSeparator;

  if (typeof obj === 'number') {
    const str = String(obj);
    return numericSeparator ? addNumericSeparator(obj, str) : str;
  }

  if (typeof obj === 'bigint') {
    const str = String(obj) + 'n';
    return numericSeparator ? addNumericSeparator(obj, str) : str;
  }

  const maxDepth = opts.depth ?? 5;
  if (depth >= maxDepth && maxDepth > 0 && typeof obj === 'object') {
    return Array.isArray(obj) ? '[Array]' : '[Object]';
  }

  if (indexOf(seen, obj) >= 0) {
    return '[Circular]';
  }

  seen = utils.arrayMethods.slice.call(seen);
  seen.push(obj);

  const indent = getIndent(opts, depth);

  const inspectValue = (value, noIndent) => {
    if (noIndent) {
      const newOpts = { depth: opts.depth };
      if (opts.hasOwnProperty('quoteStyle')) newOpts.quoteStyle = opts.quoteStyle;
      return inspect_(value, newOpts, depth + 1, seen);
    }
    return inspect_(value, opts, depth + 1, seen);
  };

  if (typeof obj === 'function' && !isRegExp(obj)) {
    const name = nameOf(obj);
    const keys = arrObjKeys(obj, inspectValue);
    return '[Function' + (name ? ': ' + name : ' (anonymous)') + ']' +
      (keys.length ? ' { ' + utils.arrayMethods.join.call(keys, ', ') + ' }' : '');
  }

  if (isSymbol(obj)) {
    const str = utils.hasShammedSymbols
      ? utils.stringMethods.replace.call(String(obj), /^(Symbol\(.*\))_[^)]*$/, '$1')
      : utils.symToString.call(obj);
    return typeof obj === 'object' ? markBoxed(str) : str;
  }

  if (isElement(obj)) {
    const nodeName = String(obj.nodeName).toLowerCase();
    let s = `<${nodeName}`;
    const attrs = obj.attributes || [];
    for (let i = 0; i < attrs.length; i++) {
      s += ` ${attrs[i].name}=${wrapQuotes(quote(attrs[i].value), 'double', opts)}`;
    }
    s += '>';
    if (obj.childNodes && obj.childNodes.length) s += '...';
    s += `</${nodeName}>`;
    return s;
  }

  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]';

    const xs = arrObjKeys(obj, inspectValue);
    if (indent && !singleLineValues(xs)) {
      return '[' + indentedJoin(xs, indent) + ']';
    }

    return `[ ${utils.arrayMethods.join.call(xs, ', ')} ]`;
  }

  if (isError(obj)) {
    const parts = arrObjKeys(obj, inspectValue);
    if (!('cause' in Error.prototype) && 'cause' in obj && !utils.isEnumerable.call(obj, 'cause')) {
      return `{ [${String(obj)}] ${utils.arrayMethods.join.call(utils.arrayMethods.concat.call(['[cause]: ' + inspectValue(obj.cause)], parts), ', ')}}`;
    }

    return parts.length === 0 ? `[${String(obj)}]` : `{ [${String(obj)}] ${utils.arrayMethods.join.call(parts, ', ')}}`;
  }

  if (typeof obj === 'object' && customInspect) {
    if (inspectSymbol && typeof obj[inspectSymbol] === 'function' && utilInspect) {
      return utilInspect(obj, { depth: maxDepth - depth });
    }

    if (customInspect !== 'symbol' && typeof obj.inspect === 'function') {
      return obj.inspect();
    }
  }

  if (isMap(obj)) {
    const entries = [];
    if (mapProps.forEach) {
      mapProps.forEach.call(obj, (value, key) => {
        entries.push(`${inspectValue(key, true)} => ${inspectValue(value)}`);
      });
    }

    return collectionOf('Map', mapProps.size.call(obj), entries, indent);
  }

  if (isSet(obj)) {
    const entries = [];
    if (setProps.forEach) {
      setProps.forEach.call(obj, (value) => {
        entries.push(inspectValue(value));
      });
    }

    return collectionOf('Set', setProps.size.call(obj), entries, indent);
  }

  if (isWeakMap(obj)) return weakCollectionOf('WeakMap');
  if (isWeakSet(obj)) return weakCollectionOf('WeakSet');
  if (isWeakRef(obj)) return weakCollectionOf('WeakRef');
  if (isNumber(obj)) return markBoxed(inspectValue(Number(obj)));
  if (isBigInt(obj)) return markBoxed(inspectValue(utils.bigIntValueOf.call(obj)));
  if (isBoolean(obj)) return markBoxed(inspectValue(utils.booleanValueOf.call(obj)));
  if (isString(obj)) return markBoxed(inspectValue(String(obj)));

  const globalObjects = { window, globalThis, global };
  const globalEntries = Object.entries(globalObjects).find(([k, v]) => typeof v !== 'undefined' && obj === v);
  const globalObjectName = globalEntries ? globalEntries[0] : null;

  if (globalObjectName) {
    return `{ [object ${globalObjectName}] }`;
  }

  if (!isDate(obj) && !isRegExp(obj)) {
    const entries = arrObjKeys(obj, inspectValue);
    const isPlainObject = utils.getPrototypeOf(obj) === Object.prototype;
    const stringTag = toStringTag && utils.objectToString.call(obj) === '[object Object]' && toStringTag in obj
      ? utils.stringMethods.slice.call(utils.objectToString.call(obj), 8, -1)
      : '';
    const constructorName = obj.constructor && obj.constructor.name ? obj.constructor.name + ' ' : '';
    const tag = constructorName + (stringTag ? `[${stringTag}] ` : '');
    
    return entries.length === 0 ? `${tag}{}` : `${tag}{ ${utils.arrayMethods.join.call(entries, ', ')} }`;
  }

  return String(obj);
};

function wrapQuotes(s, defaultStyle, opts) {
  const quoteChar = (opts.quoteStyle || defaultStyle) === 'double' ? '"' : "'";
  return `${quoteChar}${s}${quoteChar}`;
}

function quote(s) {
  return utils.stringMethods.replace.call(String(s), /"/g, '&quot;');
}

function isArray(obj) {
  return utils.objectToString.call(obj) === '[object Array]';
}

function isDate(obj) {
  return utils.objectToString.call(obj) === '[object Date]';
}

function isRegExp(obj) {
  return utils.objectToString.call(obj) === '[object RegExp]';
}

function isError(obj) {
  return utils.objectToString.call(obj) === '[object Error]';
}

function isString(obj) {
  return utils.objectToString.call(obj) === '[object String]';
}

function isNumber(obj) {
  return utils.objectToString.call(obj) === '[object Number]';
}

function isBoolean(obj) {
  return utils.objectToString.call(obj) === '[object Boolean]';
}

function isSymbol(obj) {
  if (utils.hasShammedSymbols) {
    return obj instanceof Symbol;
  }
  
  if (typeof obj === 'symbol') return true;
  
  if (!obj || typeof obj !== 'object' || !utils.symToString) return false;
  
  try {
    utils.symToString.call(obj);
    return true;
  } catch (e) {
    return false;
  }
}

function isBigInt(obj) {
  if (!obj || typeof obj !== 'object' || !utils.bigIntValueOf) return false;
  
  try {
    utils.bigIntValueOf.call(obj);
    return true;
  } catch (e) {
    return false;
  }
}

function has(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

function nameOf(f) {
  return f.name || (utils.stringMethods.match.call(utils.functionToString.call(f), /^function\s*([\w$]+)/) || [])[1] || null;
}

function indexOf(arr, item) {
  return arr.indexOf ? arr.indexOf(item) : arr.findIndex(el => el === item);
}

function isMap(x) {
  if (!mapProps.size || !x || typeof x !== 'object') return false;
  
  try {
    mapProps.size.call(x);
    try {
      setProps.size.call(x);
    } catch (s) {
      return true;
    }
    return x instanceof Map;
  } catch (e) {
    return false;
  }
}

function isWeakMap(x) {
  if (!hasWeakMap || !x || typeof x !== 'object') return false;
  
  try {
    hasWeakMap.prototype.has.call(x, hasWeakMap);
    try {
      hasWeakSet.prototype.has.call(x, hasWeakSet);
    } catch (s) {
      return true;
    }
    return x instanceof WeakMap;
  } catch (e) {
    return false;
  }
}

function isWeakRef(x) {
  if (!hasWeakRef || !x || typeof x !== 'object') return false;
  
  try {
    hasWeakRef.prototype.deref.call(x);
    return true;
  } catch (e) {
    return false;
  }
}

function isSet(x) {
  if (!setProps.size || !x || typeof x !== 'object') return false;
  
  try {
    setProps.size.call(x);
    try {
      mapProps.size.call(x);
    } catch (m) {
      return true;
    }
    return x instanceof Set;
  } catch (e) {
    return false;
  }
}

function isWeakSet(x) {
  if (!hasWeakSet || !x || typeof x !== 'object') return false;
  
  try {
    hasWeakSet.prototype.has.call(x, hasWeakSet);
    try {
      hasWeakMap.prototype.has.call(x, hasWeakMap);
    } catch (s) {
      return true;
    }
    return x instanceof WeakSet;
  } catch (e) {
    return false;
  }
}

function isElement(x) {
  if (!x || typeof x !== 'object') return false;
  if (typeof HTMLElement !== 'undefined' && x instanceof HTMLElement) return true;
  return typeof x.nodeName === 'string' && typeof x.getAttribute === 'function';
}

function inspectString(str, opts) {
  if (str.length > (opts.maxStringLength || Infinity)) {
    const remaining = str.length - opts.maxStringLength;
    const trailer = `... ${remaining} more character${remaining > 1 ? 's' : ''}`;
    return inspectString(utils.stringMethods.slice.call(str, 0, opts.maxStringLength), opts) + trailer;
  }
  
  // eslint-disable-next-line no-control-regex
  const s = utils.stringMethods.replace.call(utils.stringMethods.replace.call(str, /(['\\])/g, '\\$1'), /[\x00-\x1f]/g, lowbyte);
  return wrapQuotes(s, 'single', opts);
}

function lowbyte(c) {
  const n = c.charCodeAt(0);
  const x = {
    8: 'b',
    9: 't',
    10: 'n',
    12: 'f',
    13: 'r'
  }[n];
  
  if (x) return `\\${x}`;
  return `\\x${(n < 0x10 ? '0' : '')}${n.toString(16)}`;
}

function markBoxed(str) {
  return `Object(${str})`;
}

function weakCollectionOf(type) {
  return `${type} { ? }`;
}

function collectionOf(type, size, entries, indent) {
  return `${type} (${size}) {${indent ? indentedJoin(entries, indent) : utils.arrayMethods.join.call(entries, ', ')}}`;
}

function singleLineValues(xs) {
  return xs.every(x => !x.includes('\n'));
}

function getIndent(opts, depth) {
  const indentCharacter = opts.indent;

  if (indentCharacter === '\t') {
    return {
      base: '\t',
      prev: '\t'.repeat(depth)
    };
  }
  
  if (indentCharacter && typeof indentCharacter === 'number' && indentCharacter > 0) {
    const spacer = ' '.repeat(indentCharacter);
    return {
      base: spacer,
      prev: spacer.repeat(depth),
    };
  }
  
  return null;
}

function indentedJoin(xs, indent) {
  if (xs.length === 0) return '';
  return `\n${indent.prev}${indent.base}${xs.join(`,\n${indent.prev}${indent.base}`)}\n${indent.prev}`;
}

function arrObjKeys(obj, inspect) {
  const isArr = Array.isArray(obj);
  const keys = [];
  
  if (isArr) {
    keys.length = obj.length;
    for (let i = 0; i < obj.length; i++) {
      keys[i] = obj.hasOwnProperty(i) ? inspect(obj[i], obj) : '';
    }
  }
  
  const syms = typeof utils.gOPS === 'function' ? utils.gOPS(obj) : [];
  const symMap = utils.hasShammedSymbols ? syms.reduce((map, key) => {
    map[`$${key}`] = key;
    return map;
  }, {}) : {};

  for (const key in obj) {
    if (!obj.hasOwnProperty(key) || (isArr && String(Number(key)) === key && key < obj.length)) continue;
    if (utils.hasShammedSymbols && symMap[`$${key}`] instanceof Symbol) continue;
    
    if (utils.regexTest.call(/[^\w$]/, key)) {
      keys.push(`${inspect(key, obj)}: ${inspect(obj[key], obj)}`);
    } else {
      keys.push(`${key}: ${inspect(obj[key], obj)}`);
    }
  }
  
  if (typeof utils.gOPS === 'function') {
    for (const sym of syms) {
      if (utils.isEnumerable.call(obj, sym)) {
        keys.push(`[${inspect(sym)}]: ${inspect(obj[sym], obj)}`);
      }
    }
  }
  
  return keys;
}
