(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    // Node.js/CJS module environment
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    // AMD module environment
    define('underscore', factory);
  } else {
    // Browser global environment
    const previousUnderscore = root._;
    root._ = factory();
    root._.noConflict = function() {
      root._ = previousUnderscore;
      return this;
    };
  }
}(typeof self !== 'undefined' ? self : this, function () {

  const VERSION = '1.12.0';

  const root = typeof self !== 'undefined' ? self :
                typeof global !== 'undefined' ? global :
                Function('return this')();

  const ArrayProto = Array.prototype;
  const ObjProto = Object.prototype;
  const SymbolProto = typeof Symbol !== 'undefined' ? Symbol.prototype : null;

  const push = ArrayProto.push, slice = ArrayProto.slice;
  const toString = ObjProto.toString;
  const hasOwnProperty = ObjProto.hasOwnProperty;

  const nativeIsArray = Array.isArray;
  const nativeKeys = Object.keys;
  const nativeCreate = Object.create;
  const nativeIsView = typeof ArrayBuffer !== 'undefined' && ArrayBuffer.isView;

  const _isNaN = isNaN, _isFinite = isFinite;

  const hasEnumBug = !({toString: null}).propertyIsEnumerable('toString');
  const nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
    'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

  const MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;

  function restArguments(func, startIndex) {
    startIndex = startIndex == null ? func.length - 1 : +startIndex;
    return function() {
      let length = Math.max(arguments.length - startIndex, 0);
      let rest = Array(length), index = 0;
      for (; index < length; index++) rest[index] = arguments[index + startIndex];
      switch (startIndex) {
        case 0: return func.call(this, rest);
        case 1: return func.call(this, arguments[0], rest);
        case 2: return func.call(this, arguments[0], arguments[1], rest);
      }
      let args = Array(startIndex + 1);
      for (index = 0; index < startIndex; index++) args[index] = arguments[index];
      args[startIndex] = rest;
      return func.apply(this, args);
    };
  }

  function isObject(obj) {
    let type = typeof obj;
    return type === 'function' || (type === 'object' && !!obj);
  }

  function isNull(obj) {
    return obj === null;
  }

  function isUndefined(obj) {
    return obj === void 0;
  }

  function isBoolean(obj) {
    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
  }

  function isElement(obj) {
    return !!(obj && obj.nodeType === 1);
  }

  function tagTester(name) {
    const tag = '[object ' + name + ']';
    return function(obj) {
      return toString.call(obj) === tag;
    };
  }

  const isString = tagTester('String');
  const isNumber = tagTester('Number');
  const isDate = tagTester('Date');
  const isRegExp = tagTester('RegExp');
  const isError = tagTester('Error');
  const isSymbol = tagTester('Symbol');
  const isArrayBuffer = tagTester('ArrayBuffer');
  const isFunction = tagTester('Function');

  const nodelist = root.document && root.document.childNodes; 
  if (typeof /./ != 'function' &&
      typeof Int8Array !== 'object' &&
      typeof nodelist != 'function') {
    isFunction = function(obj) {
      return typeof obj == 'function' || false;
    };
  }

  const hasObjectTag = tagTester('Object');
  const supportsArrayBuffer = typeof ArrayBuffer !== 'undefined';
  const supportsDataView = typeof DataView !== 'undefined';

  const hasStringTagBug = (supportsDataView && hasObjectTag(new DataView(new ArrayBuffer(8))));
  const isIE11 = (typeof Map !== 'undefined' && hasObjectTag(new Map));

  const isDataView = tagTester('DataView');
  function ie10IsDataView(obj) {
    return obj != null && isFunction(obj.getInt8) && isArrayBuffer(obj.buffer);
  }
  
  const isDataViewCheck = hasStringTagBug ? ie10IsDataView : isDataView;

  const isArray = nativeIsArray || tagTester('Array');

  function has(obj, key) {
    return obj != null && hasOwnProperty.call(obj, key);
  }

  let isArguments = tagTester('Arguments');
  (function() {
    if (!isArguments(arguments)) {
      isArguments = function(obj) {
        return has(obj, 'callee');
      };
    }
  }());

  function isFiniteNumber(obj) {
    return !isSymbol(obj) && _isFinite(obj) && !isNaN(parseFloat(obj));
  }

  function isNaNCheck(obj) {
    return isNumber(obj) && _isNaN(obj);
  }

  function constant(value) {
    return function() {
      return value;
    };
  }

  function createSizePropertyCheck(getSizeProperty) {
    return function(collection) {
      let sizeProperty = getSizeProperty(collection);
      return typeof sizeProperty == 'number' && sizeProperty >= 0 && sizeProperty <= MAX_ARRAY_INDEX;
    }
  }

  function shallowProperty(key) {
    return function(obj) {
      return obj == null ? void 0 : obj[key];
    };
  }

  const getByteLength = shallowProperty('byteLength');
  const isBufferLike = createSizePropertyCheck(getByteLength);

  const typedArrayPattern = /\[object ((I|Ui)nt(8|16|32)|Float(32|64)|Uint8Clamped|Big(I|Ui)nt64)Array\]/;
  function isTypedArray(obj) {
    return nativeIsView ? (nativeIsView(obj) && !isDataViewCheck(obj)) :
              isBufferLike(obj) && typedArrayPattern.test(toString.call(obj));
  }

  const isTypedArrayCheck = supportsArrayBuffer ? isTypedArray : constant(false);

  const getLength = shallowProperty('length');

  function emulatedSet(keys) {
    const hash = {};
    for (let l = keys.length, i = 0; i < l; ++i) hash[keys[i]] = true;
    return {
      contains(key) { return hash[key]; },
      push(key) {
        hash[key] = true;
        return keys.push(key);
      }
    };
  }

  function collectNonEnumProps(obj, keys) {
    keys = emulatedSet(keys);
    const nonEnumIdx = nonEnumerableProps.length;
    const constructor = obj.constructor;
    const proto = isFunction(constructor) && constructor.prototype || ObjProto;

    let prop = 'constructor';
    if (has(obj, prop) && !keys.contains(prop)) keys.push(prop);

    while (nonEnumIdx--) {
      prop = nonEnumerableProps[nonEnumIdx];
      if (prop in obj && obj[prop] !== proto[prop] && !keys.contains(prop)) {
        keys.push(prop);
      }
    }
  }

  function keys(obj) {
    if (!isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    const keys = [];
    for (let key in obj) if (has(obj, key)) keys.push(key);
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  }

  function isEmpty(obj) {
    if (obj == null) return true;
    const length = getLength(obj);
    if (typeof length == 'number' && (
      isArray(obj) || isString(obj) || isArguments(obj)
    )) return length === 0;
    return getLength(keys(obj)) === 0;
  }

  function isMatch(object, attrs) {
    const keysList = keys(attrs), length = keysList.length;
    if (object == null) return !length;
    const obj = Object(object);
    for (let i = 0; i < length; i++) {
      const key = keysList[i];
      if (attrs[key] !== obj[key] || !(key in obj)) return false;
    }
    return true;
  }

  function _(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  }

  _.VERSION = VERSION;

  _.prototype.value = function() {
    return this._wrapped;
  };

  _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;

  _.prototype.toString = function() {
    return String(this._wrapped);
  };

  function toBufferView(bufferSource) {
    return new Uint8Array(
      bufferSource.buffer || bufferSource,
      bufferSource.byteOffset || 0,
      getByteLength(bufferSource)
    );
  }

  const tagDataView = '[object DataView]';

  function eq(a, b, aStack, bStack) {
    if (a === b) return a !== 0 || 1 / a === 1 / b;
    if (a == null || b == null) return false;
    if (a !== a) return b !== b;
    const type = typeof a;
    if (type !== 'function' && type !== 'object' && typeof b != 'object') return false;
    return deepEq(a, b, aStack, bStack);
  }

  function deepEq(a, b, aStack, bStack) {
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;

    let className = toString.call(a);
    if (className !== toString.call(b)) return false;

    if (hasStringTagBug && className == '[object Object]' && isDataViewCheck(a)) {
      if (!isDataViewCheck(b)) return false;
      className = tagDataView;
    }

    switch (className) {
      case '[object RegExp]':
      case '[object String]':
        return '' + a === '' + b;
      case '[object Number]':
        if (+a !== +a) return +b !== +b;
        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
      case '[object Date]':
      case '[object Boolean]':
        return +a === +b;
      case '[object Symbol]':
        return SymbolProto.valueOf.call(a) === SymbolProto.valueOf.call(b);
      case '[object ArrayBuffer]':
      case tagDataView:
        return deepEq(toBufferView(a), toBufferView(b), aStack, bStack);
    }

    const areArrays = className === '[object Array]';
    if (!areArrays && isTypedArrayCheck(a)) {
        const byteLength = getByteLength(a);
        if (byteLength !== getByteLength(b)) return false;
        if (a.buffer === b.buffer && a.byteOffset === b.byteOffset) return true;
        areArrays = true;
    }

    if (!areArrays) {
      if (typeof a != 'object' || typeof b != 'object') return false;
    
      const aCtor = a.constructor, bCtor = b.constructor;
      if (aCtor !== bCtor && !(isFunction(aCtor) && aCtor instanceof aCtor &&
                               isFunction(bCtor) && bCtor instanceof bCtor)
                          && ('constructor' in a && 'constructor' in b)) {
        return false;
      }
    }

    aStack = aStack || [];
    bStack = bStack || [];
    let length = aStack.length;
    while (length--) {
      if (aStack[length] === a) return bStack[length] === b;
    }

    aStack.push(a);
    bStack.push(b);

    if (areArrays) {
      length = a.length;
      if (length !== b.length) return false;
      while (length--) {
        if (!eq(a[length], b[length], aStack, bStack)) return false;
      }
    } else {
      const keysList = keys(a), key;
      length = keysList.length;
      if (keys(b).length !== length) return false;
      while (length--) {
        key = keysList[length];
        if (!has(b, key) || !eq(a[key], b[key], aStack, bStack)) return false;
      }
    }

    aStack.pop();
    bStack.pop();
    return true;
  }

  function isEqual(a, b) {
    return eq(a, b);
  }

  function allKeys(obj) {
    if (!isObject(obj)) return [];
    const keys = [];
    for (let key in obj) keys.push(key);
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  }

  function ie11fingerprint(methods) {
    const length = getLength(methods);
    return function(obj) {
      if (obj == null) return false;
      const keys = allKeys(obj);
      if (getLength(keys)) return false;
      for (let i = 0; i < length; i++) {
        if (!isFunction(obj[methods[i]])) return false;
      }
      return methods !== weakMapMethods || !isFunction(obj[forEachName]);
    };
  }

  const forEachName = 'forEach', hasName = 'has',
        commonInit = ['clear', 'delete'],
        mapTail = ['get', hasName, 'set'];

  const mapMethods = commonInit.concat(forEachName, mapTail),
        weakMapMethods = commonInit.concat(mapTail),
        setMethods = ['add'].concat(commonInit, forEachName, hasName);

  const isMap = isIE11 ? ie11fingerprint(mapMethods) : tagTester('Map');
  const isWeakMap = isIE11 ? ie11fingerprint(weakMapMethods) : tagTester('WeakMap');
  const isSet = isIE11 ? ie11fingerprint(setMethods) : tagTester('Set');
  const isWeakSet = tagTester('WeakSet');

  function values(obj) {
    const keysList = keys(obj);
    const length = keysList.length;
    const values = Array(length);
    for (let i = 0; i < length; i++) {
      values[i] = obj[keysList[i]];
    }
    return values;
  }

  function pairs(obj) {
    const keysList = keys(obj);
    const length = keysList.length;
    const pairs = Array(length);
    for (let i = 0; i < length; i++) {
      pairs[i] = [keysList[i], obj[keysList[i]]];
    }
    return pairs;
  }

  function invert(obj) {
    const result = {};
    const keysList = keys(obj);
    for (let i = 0, length = keysList.length; i < length; i++) {
      result[obj[keysList[i]]] = keysList[i];
    }
    return result;
  }

  function functions(obj) {
    const names = [];
    for (let key in obj) {
      if (isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  }

  function createAssigner(keysFunc, defaults) {
    return function(obj) {
      const length = arguments.length;
      if (defaults) obj = Object(obj);
      if (length < 2 || obj == null) return obj;
      for (let index = 1; index < length; index++) {
        const source = arguments[index],
              keys = keysFunc(source),
              l = keys.length;
        for (let i = 0; i < l; i++) {
          const key = keys[i];
          if (!defaults || obj[key] === void 0) obj[key] = source[key];
        }
      }
      return obj;
    };
  }

  const extend = createAssigner(allKeys);
  const extendOwn = createAssigner(keys);
  const defaults = createAssigner(allKeys, true);

  function ctor() {
    return function(){};
  }

  function baseCreate(prototype) {
    if (!isObject(prototype)) return {};
    if (nativeCreate) return nativeCreate(prototype);
    const Ctor = ctor();
    Ctor.prototype = prototype;
    const result = new Ctor;
    Ctor.prototype = null;
    return result;
  }

  function create(prototype, props) {
    const result = baseCreate(prototype);
    if (props) extendOwn(result, props);
    return result;
  }

  function clone(obj) {
    if (!isObject(obj)) return obj;
    return isArray(obj) ? obj.slice() : extend({}, obj);
  }

  function tap(obj, interceptor) {
    interceptor(obj);
    return obj;
  }

  function toPath(path) {
    return isArray(path) ? path : [path];
  }
  _.toPath = toPath;

  function toPathCheck(path) {
    return _.toPath(path);
  }

  function deepGet(obj, path) {
    const length = path.length;
    for (let i = 0; i < length; i++) {
      if (obj == null) return void 0;
      obj = obj[path[i]];
    }
    return length ? obj : void 0;
  }

  function get(object, path, defaultValue) {
    const value = deepGet(object, toPathCheck(path));
    return isUndefined(value) ? defaultValue : value;
  }

  function has$1(obj, path) {
    path = toPathCheck(path);
    const length = path.length;
    for (let i = 0; i < length; i++) {
      const key = path[i];
      if (!has(obj, key)) return false;
      obj = obj[key];
    }
    return !!length;
  }

  function identity(value) {
    return value;
  }

  function matcher(attrs) {
    attrs = extendOwn({}, attrs);
    return function(obj) {
      return isMatch(obj, attrs);
    };
  }

  function property(path) {
    path = toPathCheck(path);
    return function(obj) {
      return deepGet(obj, path);
    };
  }

  function optimizeCb(func, context, argCount) {
    if (context === void 0) return func;
    switch (argCount == null ? 3 : argCount) {
      case 1: return function(value) {
        return func.call(context, value);
      };
      case 3: return function(value, index, collection) {
        return func.call(context, value, index, collection);
      };
      case 4: return function(accumulator, value, index, collection) {
        return func.call(context, accumulator, value, index, collection);
      };
    }
    return function() {
      return func.apply(context, arguments);
    };
  }

  function baseIteratee(value, context, argCount) {
    if (value == null) return identity;
    if (isFunction(value)) return optimizeCb(value, context, argCount);
    if (isObject(value) && !isArray(value)) return matcher(value);
    return property(value);
  }

  function iteratee(value, context) {
    return baseIteratee(value, context, Infinity);
  }
  _.iteratee = iteratee;

  function cb(value, context, argCount) {
    if (_.iteratee !== iteratee) return _.iteratee(value, context);
    return baseIteratee(value, context, argCount);
  }

  function mapObject(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    const keysList = keys(obj),
          length = keysList.length,
          results = {};
    for (let index = 0; index < length; index++) {
      const currentKey = keysList[index];
      results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  }

  function noop(){}

  function propertyOf(obj) {
    if (obj == null) return noop;
    return function(path) {
      return get(obj, path);
    };
  }

  function times(n, iteratee, context) {
    const accum = Array(Math.max(0, n));
    iteratee = optimizeCb(iteratee, context, 1);
    for (let i = 0; i < n; i++) accum[i] = iteratee(i);
    return accum;
  }

  function random(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  }

  const now = Date.now || function() {
    return new Date().getTime();
  };

  function createEscaper(map) {
    const escaper = function(match) {
      return map[match];
    };
    const source = '(?:' + keys(map).join('|') + ')';
    const testRegexp = RegExp(source);
    const replaceRegexp = RegExp(source, 'g');
    return function(string) {
      string = string == null ? '' : '' + string;
      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
    };
  }

  const escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
  };

  const _escape = createEscaper(escapeMap);
  const unescapeMap = invert(escapeMap);
  const _unescape = createEscaper(unescapeMap);

  const templateSettings = _.templateSettings = {
    evaluate: /<%([\s\S]+?)%>/g,
    interpolate: /<%=([\s\S]+?)%>/g,
    escape: /<%-([\s\S]+?)%>/g
  };

  const noMatch = /(.)^/;

  const escapes = {
    "'": "'",
    '\\': '\\',
    '\r': 'r',
    '\n': 'n',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  const escapeRegExp = /\\|'|\r|\n|\u2028|\u2029/g;

  function escapeChar(match) {
    return '\\' + escapes[match];
  }

  function template(text, settings, oldSettings) {
    if (!settings && oldSettings) settings = oldSettings;
    settings = defaults({}, settings, _.templateSettings);

    const matcher = RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    let index = 0;
    let source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset).replace(escapeRegExp, escapeChar);
      index = offset + match.length;

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      } else if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      } else if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }
      return match;
    });
    source += "';\n";

    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + 'return __p;\n';

    let render;
    try {
      render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    const template = function(data) {
      return render.call(this, data, _);
    };

    const argument = settings.variable || 'obj';
    template.source = 'function(' + argument + '){\n' + source + '}';

    return template;
  }

  function result(obj, path, fallback) {
    path = toPathCheck(path);
    const length = path.length;
    if (!length) {
      return isFunction(fallback) ? fallback.call(obj) : fallback;
    }
    for (let i = 0; i < length; i++) {
      let prop = obj == null ? void 0 : obj[path[i]];
      if (prop === void 0) {
        prop = fallback;
        i = length;
      }
      obj = isFunction(prop) ? prop.call(obj) : prop;
    }
    return obj;
  }

  let idCounter = 0;
  function uniqueId(prefix) {
    const id = ++idCounter + '';
    return prefix ? prefix + id : id;
  }

  function chain(obj) {
    const instance = _(obj);
    instance._chain = true;
    return instance;
  }

  function executeBound(sourceFunc, boundFunc, context, callingContext, args) {
    if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
    const self = baseCreate(sourceFunc.prototype);
    const result = sourceFunc.apply(self, args);
    if (isObject(result)) return result;
    return self;
  }

  const partial = restArguments(function(func, boundArgs) {
    const placeholder = partial.placeholder;
    const bound = function() {
      let position = 0, length = boundArgs.length;
      const args = Array(length);
      for (let i = 0; i < length; i++) {
        args[i] = boundArgs[i] === placeholder ? arguments[position++] : boundArgs[i];
      }
      while (position < arguments.length) args.push(arguments[position++]);
      return executeBound(func, bound, this, this, args);
    };
    return bound;
  });

  partial.placeholder = _;

  const bind = restArguments(function(func, context, args) {
    if (!isFunction(func)) throw new TypeError('Bind must be called on a function');
    const bound = restArguments(function(callArgs) {
      return executeBound(func, bound, context, this, args.concat(callArgs));
    });
    return bound;
  });

  const isArrayLike = createSizePropertyCheck(getLength);

  function flatten(input, depth, strict, output) {
    output = output || [];
    if (!depth && depth !== 0) {
      depth = Infinity;
    } else if (depth <= 0) {
      return output.concat(input);
    }
    let idx = output.length;
    for (let i = 0, length = getLength(input); i < length; i++) {
      const value = input[i];
      if (isArrayLike(value) && (isArray(value) || isArguments(value))) {
        if (depth > 1) {
          flatten(value, depth - 1, strict, output);
          idx = output.length;
        } else {
          let j = 0, len = value.length;
          while (j < len) output[idx++] = value[j++];
        }
      } else if (!strict) {
        output[idx++] = value;
      }
    }
    return output;
  }

  const bindAll = restArguments(function(obj, keys) {
    keys = flatten(keys, false, false);
    let index = keys.length;
    if (index < 1) throw new Error('bindAll must be passed function names');
    while (index--) {
      const key = keys[index];
      obj[key] = bind(obj[key], obj);
    }
    return obj;
  });

  function memoize(func, hasher) {
    const memoize = function(key) {
      const cache = memoize.cache;
      const address = '' + (hasher ? hasher.apply(this, arguments) : key);
      if (!has(cache, address)) cache[address] = func.apply(this, arguments);
      return cache[address];
    };
    memoize.cache = {};
    return memoize;
  }

  const delay = restArguments(function(func, wait, args) {
    return setTimeout(function() {
      return func.apply(null, args);
    }, wait);
  });

  const defer = partial(delay, _, 1);

  function throttle(func, wait, options) {
    let timeout, context, args, result;
    let previous = 0;
    if (!options) options = {};

    const later = function() {
      previous = options.leading === false ? 0 : now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };

    const throttled = function() {
      const _now = now();
      if (!previous && options.leading === false) previous = _now;
      const remaining = wait - (_now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = _now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };

    throttled.cancel = function() {
      clearTimeout(timeout);
      previous = 0;
      timeout = context = args = null;
    };

    return throttled;
  }

  function debounce(func, wait, immediate) {
    let timeout, result;

    const later = function(context, args) {
      timeout = null;
      if (args) result = func.apply(context, args);
    };

    const debounced = restArguments(function(args) {
      if (timeout) clearTimeout(timeout);
      if (immediate) {
        const callNow = !timeout;
        timeout = setTimeout(later, wait);
        if (callNow) result = func.apply(this, args);
      } else {
        timeout = delay(later, wait, this, args);
      }

      return result;
    });

    debounced.cancel = function() {
      clearTimeout(timeout);
      timeout = null;
    };

    return debounced;
  }

  function wrap(func, wrapper) {
    return partial(wrapper, func);
  }

  function negate(predicate) {
    return function() {
      return !predicate.apply(this, arguments);
    };
  }

  function compose() {
    const args = arguments;
    const start = args.length - 1;
    return function() {
      let i = start;
      let result = args[start].apply(this, arguments);
      while (i--) result = args[i].call(this, result);
      return result;
    };
  }

  function after(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  }

  function before(times, func) {
    let memo;
    return function() {
      if (--times > 0) {
        memo = func.apply(this, arguments);
      }
      if (times <= 1) func = null;
      return memo;
    };
  }

  const once = partial(before, 2);

  function findKey(obj, predicate, context) {
    predicate = cb(predicate, context);
    const keysList = keys(obj), key;
    for (let i = 0, length = keysList.length; i < length; i++) {
      key = keysList[i];
      if (predicate(obj[key], key, obj)) return key;
    }
  }

  function createPredicateIndexFinder(dir) {
    return function(array, predicate, context) {
      predicate = cb(predicate, context);
      const length = getLength(array);
      let index = dir > 0 ? 0 : length - 1;
      for (; index >= 0 && index < length; index += dir) {
        if (predicate(array[index], index, array)) return index;
      }
      return -1;
    };
  }

  const findIndex = createPredicateIndexFinder(1);
  const findLastIndex = createPredicateIndexFinder(-1);

  function sortedIndex(array, obj, iteratee, context) {
    iteratee = cb(iteratee, context, 1);
    const value = iteratee(obj);
    let low = 0, high = getLength(array);
    while (low < high) {
      const mid = Math.floor((low + high) / 2);
      if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
    }
    return low;
  }

  function createIndexFinder(dir, predicateFind, sortedIndex) {
    return function(array, item, idx) {
      let i = 0, length = getLength(array);
      if (typeof idx == 'number') {
        if (dir > 0) {
          i = idx >= 0 ? idx : Math.max(idx + length, i);
        } else {
          length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
        }
      } else if (sortedIndex && idx && length) {
        idx = sortedIndex(array, item);
        return array[idx] === item ? idx : -1;
      }
      if (item !== item) {
        idx = predicateFind(slice.call(array, i, length), isNaNCheck);
        return idx >= 0 ? idx + i : -1;
      }
      for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
        if (array[idx] === item) return idx;
      }
      return -1;
    };
  }

  const indexOf = createIndexFinder(1, findIndex, sortedIndex);
  const lastIndexOf = createIndexFinder(-1, findLastIndex);

  function find(obj, predicate, context) {
    const keyFinder = isArrayLike(obj) ? findIndex : findKey;
    const key = keyFinder(obj, predicate, context);
    if (key !== void 0 && key !== -1) return obj[key];
  }

  function findWhere(obj, attrs) {
    return find(obj, matcher(attrs));
  }

  function each(obj, iteratee, context) {
    iteratee = optimizeCb(iteratee, context);
    let i, length;
    if (isArrayLike(obj)) {
      for (i = 0, length = obj.length; i < length; i++) {
        iteratee(obj[i], i, obj);
      }
    } else {
      const keysList = keys(obj);
      for (i = 0, length = keysList.length; i < length; i++) {
        iteratee(obj[keysList[i]], keysList[i], obj);
      }
    }
    return obj;
  }

  function map(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    const keysList = !isArrayLike(obj) && keys(obj),
          length = (keysList || obj).length,
          results = Array(length);
    for (let index = 0; index < length; index++) {
      const currentKey = keysList ? keysList[index] : index;
      results[index] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  }

  function createReduce(dir) {
    const reducer = function(obj, iteratee, memo, initial) {
      const keysList = !isArrayLike(obj) && keys(obj),
            length = (keysList || obj).length,
            index = dir > 0 ? 0 : length - 1;
      if (!initial) {
        memo = obj[keysList ? keysList[index] : index];
        index += dir;
      }
      for (; index >= 0 && index < length; index += dir) {
        const currentKey = keysList ? keysList[index] : index;
        memo = iteratee(memo, obj[currentKey], currentKey, obj);
      }
      return memo;
    };

    return function(obj, iteratee, memo, context) {
      const initial = arguments.length >= 3;
      return reducer(obj, optimizeCb(iteratee, context, 4), memo, initial);
    };
  }

  const reduce = createReduce(1);
  const reduceRight = createReduce(-1);

  function filter(obj, predicate, context) {
    const results = [];
    predicate = cb(predicate, context);
    each(obj, function(value, index, list) {
      if (predicate(value, index, list)) results.push(value);
    });
    return results;
  }

  function reject(obj, predicate, context) {
    return filter(obj, negate(cb(predicate)), context);
  }

  function every(obj, predicate, context) {
    predicate = cb(predicate, context);
    const keysList = !isArrayLike(obj) && keys(obj),
          length = (keysList || obj).length;
    for (let index = 0; index < length; index++) {
      const currentKey = keysList ? keysList[index] : index;
      if (!predicate(obj[currentKey], currentKey, obj)) return false;
    }
    return true;
  }

  function some(obj, predicate, context) {
    predicate = cb(predicate, context);
    const keysList = !isArrayLike(obj) && keys(obj),
          length = (keysList || obj).length;
    for (let index = 0; index < length; index++) {
      const currentKey = keysList ? keysList[index] : index;
      if (predicate(obj[currentKey], currentKey, obj)) return true;
    }
    return false;
  }

  function contains(obj, item, fromIndex, guard) {
    if (!isArrayLike(obj)) obj = values(obj);
    if (typeof fromIndex != 'number' || guard) fromIndex = 0;
    return indexOf(obj, item, fromIndex) >= 0;
  }

  const invoke = restArguments(function(obj, path, args) {
    let contextPath, func;
    if (isFunction(path)) {
      func = path;
    } else {
      path = toPathCheck(path);
      contextPath = path.slice(0, -1);
      path = path[path.length - 1];
    }
    return map(obj, function(context) {
      let method = func;
      if (!method) {
        if (contextPath && contextPath.length) {
          context = deepGet(context, contextPath);
        }
        if (context == null) return void 0;
        method = context[path];
      }
      return method == null ? method : method.apply(context, args);
    });
  });

  function pluck(obj, key) {
    return map(obj, property(key));
  }

  function where(obj, attrs) {
    return filter(obj, matcher(attrs));
  }

  function max(obj, iteratee, context) {
    let result = -Infinity, lastComputed = -Infinity,
        value, computed;
    if (iteratee == null || (typeof iteratee == 'number' && typeof obj[0] != 'object' && obj != null)) {
      obj = isArrayLike(obj) ? obj : values(obj);
      for (let i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value != null && value > result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      each(obj, function(v, index, list) {
        computed = iteratee(v, index, list);
        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
          result = v;
          lastComputed = computed;
        }
      });
    }
    return result;
  }

  function min(obj, iteratee, context) {
    let result = Infinity, lastComputed = Infinity,
        value, computed;
    if (iteratee == null || (typeof iteratee == 'number' && typeof obj[0] != 'object' && obj != null)) {
      obj = isArrayLike(obj) ? obj : values(obj);
      for (let i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value != null && value < result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      each(obj, function(v, index, list) {
        computed = iteratee(v, index, list);
        if (computed < lastComputed || computed === Infinity && result === Infinity) {
          result = v;
          lastComputed = computed;
        }
      });
    }
    return result;
  }

  function sample(obj, n, guard) {
    if (n == null || guard) {
      if (!isArrayLike(obj)) obj = values(obj);
      return obj[random(obj.length - 1)];
    }
    const sample = isArrayLike(obj) ? clone(obj) : values(obj);
    const length = getLength(sample);
    n = Math.max(Math.min(n, length), 0);
    const last = length - 1;
    for (let index = 0; index < n; index++) {
      const rand = random(index, last);
      const temp = sample[index];
      sample[index] = sample[rand];
      sample[rand] = temp;
    }
    return sample.slice(0, n);
  }

  function shuffle(obj) {
    return sample(obj, Infinity);
  }

  function sortBy(obj, iteratee, context) {
    let index = 0;
    iteratee = cb(iteratee, context);
    return pluck(map(obj, function(value, key, list) {
      return {
        value: value,
        index: index++,
        criteria: iteratee(value, key, list)
      };
    }).sort(function(left, right) {
      const a = left.criteria;
      const b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  }

  function group(behavior, partition) {
    return function(obj, iteratee, context) {
      const result = partition ? [[], []] : {};
      iteratee = cb(iteratee, context);
      each(obj, function(value, index) {
        const key = iteratee(value, index, obj);
        behavior(result, value, key);
      });
      return result;
    };
  }

  const groupBy = group(function(result, value, key) {
    if (has(result, key)) result[key].push(value); else result[key] = [value];
  });

  const indexBy = group(function(result, value, key) {
    result[key] = value;
  });

  const countBy = group(function(result, value, key) {
    if (has(result, key)) result[key]++; else result[key] = 1;
  });

  const partition = group(function(result, value, pass) {
    result[pass ? 0 : 1].push(value);
  }, true);

  const reStrSymbol = /[^\ud800-\udfff]|[\ud800-\udbff][\udc00-\udfff]|[\ud800-\udfff]/g;
  function toArray(obj) {
    if (!obj) return [];
    if (isArray(obj)) return slice.call(obj);
    if (isString(obj)) {
      return obj.match(reStrSymbol);
    }
    if (isArrayLike(obj)) return map(obj, identity);
    return values(obj);
  }

  function size(obj) {
    if (obj == null) return 0;
    return isArrayLike(obj) ? obj.length : keys(obj).length;
  }

  function keyInObj(value, key, obj) {
    return key in obj;
  }

  const pick = restArguments(function(obj, keys) {
    const result = {}, iteratee = keys[0];
    if (obj == null) return result;
    if (isFunction(iteratee)) {
      if (keys.length > 1) iteratee = optimizeCb(iteratee, keys[1]);
      keys = allKeys(obj);
    } else {
      iteratee = keyInObj;
      keys = flatten(keys, false, false);
      obj = Object(obj);
    }
    for (let i = 0, length = keys.length; i < length; i++) {
      const key = keys[i];
      const value = obj[key];
      if (iteratee(value, key, obj)) result[key] = value;
    }
    return result;
  });

  const omit = restArguments(function(obj, keys) {
    let iteratee = keys[0], context;
    if (isFunction(iteratee)) {
      iteratee = negate(iteratee);
      if (keys.length > 1) context = keys[1];
    } else {
      keys = map(flatten(keys, false, false), String);
      iteratee = function(value, key) {
        return !contains(keys, key);
      };
    }
    return pick(obj, iteratee, context);
  });

  function initial(array, n, guard) {
    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
  }

  function first(array, n, guard) {
    if (array == null || array.length < 1) return n == null || guard ? void 0 : [];
    if (n == null || guard) return array[0];
    return initial(array, array.length - n);
  }

  function rest(array, n, guard) {
    return slice.call(array, n == null || guard ? 1 : n);
  }

  function last(array, n, guard) {
    if (array == null || array.length < 1) return n == null || guard ? void 0 : [];
    if (n == null || guard) return array[array.length - 1];
    return rest(array, Math.max(0, array.length - n));
  }

  function compact(array) {
    return filter(array, Boolean);
  }

  function flatten$1(array, depth) {
    return flatten(array, depth, false);
  }

  const difference = restArguments(function(array, rest) {
    rest = flatten(rest, true, true);
    return filter(array, function(value){
      return !contains(rest, value);
    });
  });

  const without = restArguments(function(array, otherArrays) {
    return difference(array, otherArrays);
  });

  function uniq(array, isSorted, iteratee, context) {
    if (!isBoolean(isSorted)) {
      context = iteratee;
      iteratee = isSorted;
      isSorted = false;
    }
    if (iteratee != null) iteratee = cb(iteratee, context);
    const result = [];
    const seen = [];
    for (let i = 0, length = getLength(array); i < length; i++) {
      const value = array[i],
            computed = iteratee ? iteratee(value, i, array) : value;
      if (isSorted && !iteratee) {
        if (!i || seen !== computed) result.push(value);
        seen = computed;
      } else if (iteratee) {
        if (!contains(seen, computed)) {
          seen.push(computed);
          result.push(value);
        }
      } else if (!contains(result, value)) {
        result.push(value);
      }
    }
    return result;
  }

  const union = restArguments(function(arrays) {
    return uniq(flatten(arrays, true, true));
  });

  function intersection(array) {
    const result = [];
    const argsLength = arguments.length;
    for (let i = 0, length = getLength(array); i < length; i++) {
      const item = array[i];
      if (contains(result, item)) continue;
      let j;
      for (j = 1; j < argsLength; j++) {
        if (!contains(arguments[j], item)) break;
      }
      if (j === argsLength) result.push(item);
    }
    return result;
  }

  function unzip(array) {
    const length = array && max(array, getLength).length || 0;
    const result = Array(length);

    for (let index = 0; index < length; index++) {
      result[index] = pluck(array, index);
    }
    return result;
  }

  const zip = restArguments(unzip);

  function object(list, values) {
    const result = {};
    for (let i = 0, length = getLength(list); i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  }

  function range(start, stop, step) {
    if (stop == null) {
      stop = start || 0;
      start = 0;
    }
    if (!step) {
      step = stop < start ? -1 : 1;
    }

    const length = Math.max(Math.ceil((stop - start) / step), 0);
    const range = Array(length);

    for (let idx = 0; idx < length; idx++, start += step) {
      range[idx] = start;
    }

    return range;
  }

  function chunk(array, count) {
    if (count == null || count < 1) return [];
    const result = [];
    let i = 0, length = array.length;
    while (i < length) {
      result.push(slice.call(array, i, i += count));
    }
    return result;
  }

  function chainResult(instance, obj) {
    return instance._chain ? _(obj).chain() : obj;
  }

  function mixin(obj) {
    each(functions(obj), function(name) {
      const func = _[name] = obj[name];
      _.prototype[name] = function() {
        const args = [this._wrapped];
        push.apply(args, arguments);
        return chainResult(this, func.apply(_, args));
      };
    });
    return _;
  }

  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    const method = ArrayProto[name];
    _.prototype[name] = function() {
      const obj = this._wrapped;
      if (obj != null) {
        method.apply(obj, arguments);
        if ((name === 'shift' || name === 'splice') && obj.length === 0) {
          delete obj[0];
        }
      }
      return chainResult(this, obj);
    };
  });

  each(['concat', 'join', 'slice'], function(name) {
    const method = ArrayProto[name];
    _.prototype[name] = function() {
      let obj = this._wrapped;
      if (obj != null) obj = method.apply(obj, arguments);
      return chainResult(this, obj);
    };
  });

  const allExports = {
    __proto__: null,
    VERSION: VERSION,
    restArguments: restArguments,
    isObject: isObject,
    isNull: isNull,
    isUndefined: isUndefined,
    isBoolean: isBoolean,
    isElement: isElement,
    isString: isString,
    isNumber: isNumber,
    isDate: isDate,
    isRegExp: isRegExp,
    isError: isError,
    isSymbol: isSymbol,
    isArrayBuffer: isArrayBuffer,
    isDataView: isDataViewCheck,
    isArray: isArray,
    isFunction: isFunction,
    isArguments: isArguments,
    isFinite: isFiniteNumber,
    isNaN: isNaNCheck,
    isTypedArray: isTypedArrayCheck,
    isEmpty: isEmpty,
    isMatch: isMatch,
    isEqual: isEqual,
    isMap: isMap,
    isWeakMap: isWeakMap,
    isSet: isSet,
    isWeakSet: isWeakSet,
    keys: keys,
    allKeys: allKeys,
    values: values,
    pairs: pairs,
    invert: invert,
    functions: functions,
    methods: functions,
    extend: extend,
    extendOwn: extendOwn,
    assign: extendOwn,
    defaults: defaults,
    create: create,
    clone: clone,
    tap: tap,
    get: get,
    has: has$1,
    mapObject: mapObject,
    identity: identity,
    constant: constant,
    noop: noop,
    toPath: toPath,
    property: property,
    propertyOf: propertyOf,
    matcher: matcher,
    matches: matcher,
    times: times,
    random: random,
    now: now,
    escape: _escape,
    unescape: _unescape,
    templateSettings: templateSettings,
    template: template,
    result: result,
    uniqueId: uniqueId,
    chain: chain,
    iteratee: iteratee,
    partial: partial,
    bind: bind,
    bindAll: bindAll,
    memoize: memoize,
    delay: delay,
    defer: defer,
    throttle: throttle,
    debounce: debounce,
    wrap: wrap,
    negate: negate,
    compose: compose,
    after: after,
    before: before,
    once: once,
    findKey: findKey,
    findIndex: findIndex,
    findLastIndex: findLastIndex,
    sortedIndex: sortedIndex,
    indexOf: indexOf,
    lastIndexOf: lastIndexOf,
    find: find,
    detect: find,
    findWhere: findWhere,
    each: each,
    forEach: each,
    map: map,
    collect: map,
    reduce: reduce,
    foldl: reduce,
    inject: reduce,
    reduceRight: reduceRight,
    foldr: reduceRight,
    filter: filter,
    select: filter,
    reject: reject,
    every: every,
    all: every,
    some: some,
    any: some,
    contains: contains,
    includes: contains,
    include: contains,
    invoke: invoke,
    pluck: pluck,
    where: where,
    max: max,
    min: min,
    shuffle: shuffle,
    sample: sample,
    sortBy: sortBy,
    groupBy: groupBy,
    indexBy: indexBy,
    countBy: countBy,
    partition: partition,
    toArray: toArray,
    size: size,
    pick: pick,
    omit: omit,
    first: first,
    head: first,
    take: first,
    initial: initial,
    last: last,
    rest: rest,
    tail: rest,
    drop: rest,
    compact: compact,
    flatten: flatten$1,
    without: without,
    uniq: uniq,
    unique: uniq,
    union: union,
    intersection: intersection,
    difference: difference,
    unzip: unzip,
    transpose: unzip,
    zip: zip,
    object: object,
    range: range,
    chunk: chunk,
    mixin: mixin,
    'default': _
  };

  const underscore = mixin(allExports);
  underscore._ = underscore;

  return underscore;

}));
