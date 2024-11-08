'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const propertyExpr = require('property-expr');
const tinyCase = require('tiny-case');
const toposort = require('toposort');

function _interopDefaultLegacy (e) {
  return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; 
}

const toposort__default = /*#__PURE__*/_interopDefaultLegacy(toposort);

const toString = Object.prototype.toString;
const errorToString = Error.prototype.toString;
const regExpToString = RegExp.prototype.toString;
const symbolToString = typeof Symbol !== 'undefined' ? Symbol.prototype.toString : () => '';
const SYMBOL_REGEXP = /^Symbol\((.*)\)(.*)$/;

function printNumber(val) {
  if (val != +val) return 'NaN';
  const isNegativeZero = val === 0 && 1 / val < 0;
  return isNegativeZero ? '-0' : '' + val;
}

function printSimpleValue(val, quoteStrings = false) {
  if (val == null || val === true || val === false) return '' + val;
  const typeOf = typeof val;
  if (typeOf === 'number') return printNumber(val);
  if (typeOf === 'string') return quoteStrings ? `"${val}"` : val;
  if (typeOf === 'function') return '[Function ' + (val.name || 'anonymous') + ']';
  if (typeOf === 'symbol') return symbolToString.call(val).replace(SYMBOL_REGEXP, 'Symbol($1)');
  const tag = toString.call(val).slice(8, -1);
  if (tag === 'Date') return isNaN(val.getTime()) ? '' + val : val.toISOString(val);
  if (tag === 'Error' || val instanceof Error) return '[' + errorToString.call(val) + ']';
  if (tag === 'RegExp') return regExpToString.call(val);
  return null;
}

function printValue(value, quoteStrings) {
  let result = printSimpleValue(value, quoteStrings);
  if (result !== null) return result;
  return JSON.stringify(value, function (key, value) {
    let result = printSimpleValue(this[key], quoteStrings);
    if (result !== null) return result;
    return value;
  }, 2);
}

function toArray(value) {
  return value == null ? [] : [].concat(value);
}

const isSchema = obj => obj && obj.__isYupSchema__;

class ValidationErrorNoStack {
  constructor(errorOrErrors, value, field, type) {
    this.name = 'ValidationError';
    this.value = value;
    this.path = field;
    this.type = type;
    this.errors = [];
    this.inner = [];
    this[Symbol.toStringTag] = 'Error';
    toArray(errorOrErrors).forEach(err => {
      if (ValidationError.isError(err)) {
        this.errors.push(...err.errors);
        this.inner.push(...(err.inner.length ? err.inner : [err]));
      } else {
        this.errors.push(err);
      }
    });
    this.message = this.errors.length > 1 ? `${this.errors.length} errors occurred` : this.errors[0];
  }
}

class ValidationError extends Error {
  static formatError(message, params) {
    const path = params.label || params.path || 'this';
    params = path !== params.path ? Object.assign({}, params, { path }) : params;
    return typeof message === 'string' ? 
      message.replace(/\$\{\s*(\w+)\s*\}/g, (_, key) => printValue(params[key])) : 
      typeof message === 'function' ? message(params) : message;
  }
  static isError(err) {
    return err && err.name === 'ValidationError';
  }
  constructor(errorOrErrors, value, field, type, disableStack) {
    const errorNoStack = new ValidationErrorNoStack(errorOrErrors, value, field, type);
    super();
    if (disableStack) return errorNoStack;
    Object.assign(this, errorNoStack);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }
  }
  static [Symbol.hasInstance](inst) {
    return ValidationErrorNoStack[Symbol.hasInstance](inst) || super[Symbol.hasInstance](inst);
  }
}

let mixed = {
  default: '${path} is invalid',
  required: '${path} is a required field',
  defined: '${path} must be defined',
  notNull: '${path} cannot be null',
  oneOf: '${path} must be one of the following values: ${values}',
  notOneOf: '${path} must not be one of the following values: ${values}',
  notType: ({path, type, value, originalValue}) => {
    const castMsg = originalValue != null && originalValue !== value ? ` (cast from the value \`${printValue(originalValue, true)}\`).` : '.';
    return type !== 'mixed' ? 
      `${path} must be a \`${type}\` type, but the final value was: \`${printValue(value, true)}\`` + castMsg : 
      `${path} must match the configured type. The validated value was: \`${printValue(value, true)}\`` + castMsg;
  }
};

let string = {
  length: '${path} must be exactly ${length} characters',
  min: '${path} must be at least ${min} characters',
  max: '${path} must be at most ${max} characters',
  matches: '${path} must match the following: "${regex}"',
  email: '${path} must be a valid email',
  url: '${path} must be a valid URL',
  uuid: '${path} must be a valid UUID',
  datetime: '${path} must be a valid ISO date-time',
  datetime_precision: '${path} must be a valid ISO date-time with a sub-second precision of exactly ${precision} digits',
  datetime_offset: '${path} must be a valid ISO date-time with UTC "Z" timezone',
  trim: '${path} must be a trimmed string',
  lowercase: '${path} must be a lowercase string',
  uppercase: '${path} must be a upper case string'
};

let number = {
  min: '${path} must be greater than or equal to ${min}',
  max: '${path} must be less than or equal to ${max}',
  lessThan: '${path} must be less than ${less}',
  moreThan: '${path} must be greater than ${more}',
  positive: '${path} must be a positive number',
  negative: '${path} must be a negative number',
  integer: '${path} must be an integer'
};

let date = {
  min: '${path} field must be later than ${min}',
  max: '${path} field must be at earlier than ${max}'
};

let boolean = {
  isValue: '${path} field must be ${value}'
};

let object = {
  noUnknown: '${path} field has unspecified keys: ${unknown}'
};

let array = {
  min: '${path} field must have at least ${min} items',
  max: '${path} field must have less than or equal to ${max} items',
  length: '${path} must have ${length} items'
};

let tuple = {
  notType: params => {
    const { path, value, spec } = params;
    const typeLen = spec.types.length;
    if (Array.isArray(value)) {
      if (value.length < typeLen) return `${path} tuple value has too few items, expected a length of ${typeLen} but got ${value.length} for value: \`${printValue(value, true)}\``;
      if (value.length > typeLen) return `${path} tuple value has too many items, expected a length of ${typeLen} but got ${value.length} for value: \`${printValue(value, true)}\``;
    }
    return ValidationError.formatError(mixed.notType, params);
  }
};

var locale = Object.assign(Object.create(null), {
  mixed,
  string,
  number,
  date,
  object,
  array,
  boolean,
  tuple
});

class Condition {
  static fromOptions(refs, config) {
    if (!config.then && !config.otherwise) throw new TypeError('either `then:` or `otherwise:` is required for `when()` conditions');
    let { is, then, otherwise } = config;
    let check = typeof is === 'function' ? is : (...values) => values.every(value => value === is);
    return new Condition(refs, (values, schema) => {
      let branch = check(...values) ? then : otherwise;
      return branch ? branch(schema) : schema;
    });
  }
  constructor(refs, builder) {
    this.refs = refs;
    this.fn = builder;
  }
  resolve(base, options) {
    let values = this.refs.map(ref => ref.getValue(options?.value, options?.parent, options?.context));
    let schema = this.fn(values, base, options);
    if (schema === undefined || schema === base) {
      return base;
    }
    if (!isSchema(schema)) throw new TypeError('conditions must return a schema object');
    return schema.resolve(options);
  }
}

function create$9(key, options) {
  return new Reference(key, options);
}

class Reference {
  constructor(key, options = {}) {
    if (typeof key !== 'string') throw new TypeError('ref must be a string, got: ' + key);
    this.key = key.trim();
    if (key === '') throw new TypeError('ref must be a non-empty string');
    this.isContext = this.key[0] === '$';
    this.isValue = this.key[0] === '.';
    this.isSibling = !this.isContext && !this.isValue;
    let prefix = this.isContext ? '$' : this.isValue ? '.' : '';
    this.path = this.key.slice(prefix.length);
    this.getter = this.path && propertyExpr.getter(this.path, true);
    this.map = options.map;
  }
  getValue(value, parent, context) {
    let result = this.isContext ? context : this.isValue ? value : parent;
    if (this.getter) result = this.getter(result || {});
    if (this.map) result = this.map(result);
    return result;
  }
  cast(value, options) {
    return this.getValue(value, options?.parent, options?.context);
  }
  resolve() { return this; }
  describe() { return { type: 'ref', key: this.key }; }
  toString() { return `Ref(${this.key})`; }
  static isRef(value) { return value && value.__isYupRef; }
}

Reference.prototype.__isYupRef = true;

function createValidation(config) {
  function validate({ value, path = '', options, originalValue, schema }, panic, next) {
    const { name, test, params, message, skipAbsent } = config;
    let { parent, context, abortEarly = schema.spec.abortEarly, disableStackTrace = schema.spec.disableStackTrace } = options;
    function resolve(item) { return Reference.isRef(item) ? item.getValue(value, parent, context) : item; }
    function createError(overrides = {}) {
      const nextParams = Object.assign({ value, originalValue, label: schema.spec.label, path: overrides.path || path, spec: schema.spec, disableStackTrace: overrides.disableStackTrace || disableStackTrace }, params, overrides.params);
      for (const key of Object.keys(nextParams)) nextParams[key] = resolve(nextParams[key]);
      const error = new ValidationError(ValidationError.formatError(overrides.message || message, nextParams), value, nextParams.path, overrides.type || name, nextParams.disableStackTrace);
      error.params = nextParams;
      return error;
    }
    const invalid = abortEarly ? panic : next;
    let ctx = { path, parent, type: name, from: options.from, createError, resolve, options, originalValue, schema };
    const handleResult = validOrError => { if (ValidationError.isError(validOrError)) invalid(validOrError); else if (!validOrError) invalid(createError()); else next(null); };
    const handleError = err => { if (ValidationError.isError(err)) invalid(err); else panic(err); };
    const shouldSkip = skipAbsent && isAbsent(value);
    if (shouldSkip) return handleResult(true);
    let result;
    try {
      result = test.call(ctx, value, ctx);
      if (result?.then) {
        if (options.sync) throw new Error(`Validation test of type: "${ctx.type}" returned a Promise during a synchronous validate. This test will finish after the validate call has returned`);
        return Promise.resolve(result).then(handleResult, handleError);
      }
    } catch (err) { handleError(err); return; }
    handleResult(result);
  }
  validate.OPTIONS = config;
  return validate;
}

function getIn(schema, path, value, context = value) {
  let parent, lastPart, lastPartDebug;
  if (!path) return { parent, parentPath: path, schema };
  propertyExpr.forEach(path, (_part, isBracket, isArray) => {
    let part = isBracket ? _part.slice(1, _part.length - 1) : _part;
    schema = schema.resolve({ context, parent, value });
    let isTuple = schema.type === 'tuple';
    let idx = isArray ? parseInt(part, 10) : 0;
    if (schema.innerType || isTuple) {
      if (isTuple && !isArray) throw new Error(`Yup.reach cannot implicitly index into a tuple type. the path part "${lastPartDebug}" must contain an index to the tuple element, e.g. "${lastPartDebug}[0]"`);
      if (value && idx >= value.length) throw new Error(`Yup.reach cannot resolve an array item at index: ${_part}, in the path: ${path}. because there is no value at that index.`);
      parent = value;
      value = value && value[idx];
      schema = isTuple ? schema.spec.types[idx] : schema.innerType;
    }
    if (!isArray) {
      if (!schema.fields || !schema.fields[part]) throw new Error(`The schema does not contain the path: ${path}. (failed at: ${lastPartDebug} which is a type: "${schema.type}")`);
      parent = value;
      value = value && value[part];
      schema = schema.fields[part];
    }
    lastPart = part;
    lastPartDebug = isBracket ? '[' + _part + ']' : '.' + _part;
  });
  return { schema, parent, parentPath: lastPart };
}

function reach(obj, path, value, context) {
  return getIn(obj, path, value, context).schema;
}

class ReferenceSet extends Set {
  describe() { const description = [...this.values()].map(item => Reference.isRef(item) ? item.describe() : item); return description; }
  resolveAll(resolve) { return [...this.values()].map(item => resolve(item)); }
  clone() { return new ReferenceSet(this.values()); }
  merge(newItems, removeItems) {
    const next = this.clone();
    newItems.forEach(value => next.add(value));
    removeItems.forEach(value => next.delete(value));
    return next;
  }
}

function clone(src, seen = new Map()) {
  if (isSchema(src) || !src || typeof src !== 'object') return src;
  if (seen.has(src)) return seen.get(src);
  let copy;
  if (src instanceof Date) {
    copy = new Date(src.getTime());
    seen.set(src, copy);
  } else if (src instanceof RegExp) {
    copy = new RegExp(src);
    seen.set(src, copy);
  } else if (Array.isArray(src)) {
    copy = new Array(src.length);
    seen.set(src, copy);
    for (let i = 0; i < src.length; i++) copy[i] = clone(src[i], seen);
  } else if (src instanceof Map) {
    copy = new Map();
    seen.set(src, copy);
    for (const [k, v] of src.entries()) copy.set(k, clone(v, seen));
  } else if (src instanceof Set) {
    copy = new Set();
    seen.set(src, copy);
    for (const v of src) copy.add(clone(v, seen));
  } else if (src instanceof Object) {
    copy = {};
    seen.set(src, copy);
    for (const [k, v] of Object.entries(src)) copy[k] = clone(v, seen);
  } else {
    throw Error(`Unable to clone ${src}`);
  }
  return copy;
}

class Schema {
  constructor(options) {
    this.type = options.type;
    this.deps = [];
    this.tests = [];
    this.transforms = [];
    this.conditions = [];
    this.internalTests = {};
    this._whitelist = new ReferenceSet();
    this._blacklist = new ReferenceSet();
    this.exclusiveTests = Object.create(null);
    this._typeCheck = options.check;
    this.spec = Object.assign({
      strip: false,
      strict: false,
      abortEarly: true,
      recursive: true,
      disableStackTrace: false,
      nullable: false,
      optional: true,
      coerce: true
    }, options.spec);
    this.withMutation(s => s.nonNullable());
    this.withMutation(() => this.typeError(mixed.notType));
  }
  clone(spec) {
    const next = Object.create(Object.getPrototypeOf(this));
    next.type = this.type;
    next._typeCheck = this._typeCheck;
    next._whitelist = this._whitelist.clone();
    next._blacklist = this._blacklist.clone();
    next.internalTests = Object.assign({}, this.internalTests);
    next.exclusiveTests = Object.assign({}, this.exclusiveTests);
    next.deps = [...this.deps];
    next.conditions = [...this.conditions];
    next.tests = [...this.tests];
    next.transforms = [...this.transforms];
    next.spec = clone(Object.assign({}, this.spec, spec));
    return next;
  }
  label(label) {
    let next = this.clone();
    next.spec.label = label;
    return next;
  }
  meta(...args) {
    if (args.length === 0) return this.spec.meta;
    let next = this.clone();
    next.spec.meta = Object.assign(next.spec.meta || {}, args[0]);
    return next;
  }
  withMutation(fn) {
    let before = this._mutate;
    this._mutate = true;
    let result = fn(this);
    this._mutate = before;
    return result;
  }
  resolve(options) {
    let schema = this;
    if (schema.conditions.length) {
      let conditions = schema.conditions;
      schema = schema.clone();
      schema.conditions = [];
      schema = conditions.reduce((prevSchema, condition) => condition.resolve(prevSchema, options), schema);
      schema = schema.resolve(options);
    }
    return schema;
  }
  resolveOptions(options) {
    return Object.assign({}, options, {
      from: options.from || [],
      strict: options.strict ?? this.spec.strict,
      abortEarly: options.abortEarly ?? this.spec.abortEarly,
      recursive: options.recursive ?? this.spec.recursive,
      disableStackTrace: options.disableStackTrace ?? this.spec.disableStackTrace
    });
  }
  cast(value, options = {}) {
    let resolvedSchema = this.resolve(Object.assign({ value }, options));
    let allowOptionality = options.assert === 'ignore-optionality';
    let result = resolvedSchema._cast(value, options);
    if (options.assert !== false && !resolvedSchema.isType(result)) {
      if (allowOptionality && isAbsent(result)) {
        return result;
      }
      throw new TypeError(`The value of ${options.path || 'field'} could not be cast to a value ` +
                          `that satisfies the schema type: "${resolvedSchema.type}".\n\n` +
                          `attempted value: ${printValue(value)}\n` + 
                          (printValue(result) !== printValue(value) ? `result of cast: ${printValue(result)}` : ''));
    }
    return result;
  }
  _cast(rawValue, options) {
    let value = rawValue === undefined ? rawValue : this.transforms.reduce((prevValue, fn) => fn.call(this, prevValue, rawValue, this), rawValue);
    if (value === undefined) {
      value = this.getDefault(options);
    }
    return value;
  }
  _validate(_value, options = {}, panic, next) {
    let { path, originalValue = _value, strict = this.spec.strict } = options;
    let value = _value;
    if (!strict) {
      value = this._cast(value, Object.assign({ assert: false }, options));
    }
    const tests = Object.values(this.internalTests);
    this.runTests({ path, value, originalValue, options, tests: tests }, panic, initialErrors => {
      if (initialErrors.length) {
        return next(initialErrors, value);
      }
      this.runTests({ path, value, originalValue, options, tests: this.tests }, panic, next);
    });
  }
  runTests(runOptions, panic, next) {
    let fired = false;
    let { tests, value, originalValue, path, options } = runOptions;
    let panicOnce = arg => { if (fired) return; fired = true; panic(arg, value); };
    let nextOnce = arg => { if (fired) return; fired = true; next(arg, value); };
    let count = tests.length;
    let nestedErrors = [];
    if (!count) return nextOnce([]);
    let args = { value, originalValue, path, options, schema: this };
    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      test(args, panicOnce, function finishTestRun(err) {
        if (err) {
          Array.isArray(err) ? nestedErrors.push(...err) : nestedErrors.push(err);
        }
        if (--count <= 0) {
          nextOnce(nestedErrors);
        }
      });
    }
  }
  asNestedTest({ key, index, parent, parentPath, originalParent, options }) {
    const k = key != null ? key : index;
    if (k == null) {
      throw TypeError('Must include `key` or `index` for nested validations');
    }
    const isIndex = typeof k === 'number';
    let value = parent[k];
    const testOptions = Object.assign({}, options, {
      strict: true,
      parent,
      value,
      originalValue: originalParent[k],
      [isIndex ? 'index' : 'key']: k,
      path: isIndex || k.includes('.') ? `${parentPath || ''}[${isIndex ? k : `"${k}"`}]` : (parentPath ? `${parentPath}.` : '') + key
    });
    return (_, panic, next) => this.resolve(testOptions)._validate(value, testOptions, panic, next);
  }
  validate(value, options) {
    const schema = this.resolve(Object.assign({}, options, { value }));
    const disableStackTrace = options?.disableStackTrace ?? schema.spec.disableStackTrace;
    return new Promise((resolve, reject) => 
      schema._validate(value, options, (error, parsed) => {
        if (ValidationError.isError(error)) error.value = parsed;
        reject(error);
      }, (errors, validated) => {
        if (errors.length) reject(new ValidationError(errors, validated, undefined, undefined, disableStackTrace)); else resolve(validated);
      })
    );
  }
  validateSync(value, options) {
    const schema = this.resolve(Object.assign({}, options, { value }));
    let result;
    const disableStackTrace = options?.disableStackTrace ?? schema.spec.disableStackTrace;
    schema._validate(value, Object.assign({}, options, { sync: true }), (error, parsed) => {
      if (ValidationError.isError(error)) error.value = parsed;
      throw error;
    }, (errors, validated) => {
      if (errors.length) throw new ValidationError(errors, value, undefined, undefined, disableStackTrace);
      result = validated;
    });
    return result;
  }
  isValid(value, options) {
    return this.validate(value, options).then(() => true, err => {
      if (ValidationError.isError(err)) return false;
      throw err;
    });
  }
  isValidSync(value, options) {
    try {
      this.validateSync(value, options);
      return true;
    } catch (err) {
      if (ValidationError.isError(err)) return false;
      throw err;
    }
  }
  _getDefault(options) {
    const defaultValue = this.spec.default;
    if (defaultValue == null) return defaultValue;
    return typeof defaultValue === 'function' ? defaultValue.call(this, options) : clone(defaultValue);
  }
  getDefault(options) {
    const schema = this.resolve(options || {});
    return schema._getDefault(options);
  }
  default(def) {
    const next = this.clone({ default: def });
    return next;
  }
  strict(isStrict = true) {
    return this.clone({ strict: isStrict });
  }
  nullability(nullable, message) {
    const next = this.clone({ nullable });
    next.internalTests.nullable = createValidation({
      message,
      name: 'nullable',
      test(value) { return value === null ? this.schema.spec.nullable : true; }
    });
    return next;
  }
  optionality(optional, message) {
    const next = this.clone({ optional });
    next.internalTests.optionality = createValidation({
      message,
      name: 'optionality',
      test(value) { return value === undefined ? this.schema.spec.optional : true; }
    });
    return next;
  }
  optional() { return this.optionality(true); }
  defined(message = mixed.defined) { return this.optionality(false, message); }
  nullable() { return this.nullability(true); }
  nonNullable(message = mixed.notNull) { return this.nullability(false, message); }
  required(message = mixed.required) {
    return this.clone().withMutation(next => next.nonNullable(message).defined(message));
  }
  notRequired() {
    return this.clone().withMutation(next => next.nullable().optional());
  }
  transform(fn) {
    let next = this.clone();
    next.transforms.push(fn);
    return next;
  }
  test(...args) {
    let opts;
    if (args.length === 1) {
      if (typeof args[0] === 'function') {
        opts = { test: args[0] };
      } else {
        opts = args[0];
      }
    } else if (args.length === 2) {
      opts = { name: args[0], test: args[1] };
    } else {
      opts = { name: args[0], message: args[1], test: args[2] };
    }
    if (opts.message === undefined) opts.message = mixed.default;
    if (typeof opts.test !== 'function') throw new TypeError('`test` is a required parameters');
    let next = this.clone();
    let validate = createValidation(opts);
    let isExclusive = opts.exclusive || opts.name && next.exclusiveTests[opts.name] === true;
    if (opts.exclusive) {
      if (!opts.name) throw new TypeError('Exclusive tests must provide a unique `name` identifying the test');
    }
    if (opts.name) next.exclusiveTests[opts.name] = !!opts.exclusive;
    next.tests = next.tests.filter(fn => {
      if (fn.OPTIONS.name === opts.name) {
        if (isExclusive) return false;
        if (fn.OPTIONS.test === validate.OPTIONS.test) return false;
      }
      return true;
    });
    next.tests.push(validate);
    return next;
  }
  when(keys, options) {
    if (!Array.isArray(keys) && typeof keys !== 'string') {
      options = keys;
      keys = '.';
    }
    let next = this.clone();
    let deps = toArray(keys).map(key => new Reference(key));
    deps.forEach(dep => {
      if (dep.isSibling) next.deps.push(dep.key);
    });
    next.conditions.push(typeof options === 'function' ? new Condition(deps, options) : Condition.fromOptions(deps, options));
    return next;
  }
  typeError(message) {
    let next = this.clone();
    next.internalTests.typeError = createValidation({
      message,
      name: 'typeError',
      skipAbsent: true,
      test(value) {
        if (!this.schema._typeCheck(value)) return this.createError({ params: { type: this.schema.type } });
        return true;
      }
    });
    return next;
  }
  oneOf(enums, message = mixed.oneOf) {
    let next = this.clone();
    enums.forEach(val => {
      next._whitelist.add(val);
      next._blacklist.delete(val);
    });
    next.internalTests.whiteList = createValidation({
      message,
      name: 'oneOf',
      skipAbsent: true,
      test(value) {
        let valids = this.schema._whitelist;
        let resolved = valids.resolveAll(this.resolve);
        return resolved.includes(value) ? true : this.createError({ params: { values: Array.from(valids).join(', '), resolved } });
      }
    });
    return next;
  }
  notOneOf(enums, message = mixed.notOneOf) {
    let next = this.clone();
    enums.forEach(val => {
      next._blacklist.add(val);
      next._whitelist.delete(val);
    });
    next.internalTests.blacklist = createValidation({
      message,
      name: 'notOneOf',
      test(value) {
        let invalids = this.schema._blacklist;
        let resolved = invalids.resolveAll(this.resolve);
        if (resolved.includes(value)) return this.createError({ params: { values: Array.from(invalids).join(', '), resolved } });
        return true;
      }
    });
    return next;
  }
  strip(strip = true) {
    let next = this.clone();
    next.spec.strip = strip;
    return next;
  }
  describe(options) {
    const next = (options ? this.resolve(options) : this).clone();
    const { label, meta, optional, nullable } = next.spec;
    const description = {
      meta, label, optional, nullable,
      default: next.getDefault(options),
      type: next.type,
      oneOf: next._whitelist.describe(),
      notOneOf: next._blacklist.describe(),
      tests: next.tests.map(fn => ({ name: fn.OPTIONS.name, params: fn.OPTIONS.params }))
          .filter((n, idx, list) => list.findIndex(c => c.name === n.name) === idx)
    };
    return description;
  }
}

Schema.prototype.__isYupSchema__ = true;
for (const method of ['validate', 'validateSync']) 
  Schema.prototype[`${method}At`] = function (path, value, options = {}) {
  const { parent, parentPath, schema } = getIn(this, path, value, options.context);
  return schema[method](parent && parent[parentPath], Object.assign({}, options, { parent, path }));
};

for (const alias of ['equals', 'is']) Schema.prototype[alias] = Schema.prototype.oneOf;
for (const alias of ['not', 'nope']) Schema.prototype[alias] = Schema.prototype.notOneOf;

const returnsTrue = () => true;

function create$8(spec) {
  return new MixedSchema(spec);
}

class MixedSchema extends Schema {
  constructor(spec) {
    super(typeof spec === 'function' ? { type: 'mixed', check: spec } : Object.assign({ type: 'mixed', check: returnsTrue }, spec));
  }
}

create$8.prototype = MixedSchema.prototype;

function create$7() {
  return new BooleanSchema();
}

class BooleanSchema extends Schema {
  constructor() {
    super({
      type: 'boolean',
      check(v) {
        if (v instanceof Boolean) v = v.valueOf();
        return typeof v === 'boolean';
      }
    });
    this.withMutation(() => {
      this.transform((value, _raw, ctx) => {
        if (ctx.spec.coerce && !ctx.isType(value)) {
          if (/^(true|1)$/i.test(String(value))) return true;
          if (/^(false|0)$/i.test(String(value))) return false;
        }
        return value;
      });
    });
  }
  isTrue(message = boolean.isValue) {
    return this.test({
      message,
      name: 'is-value',
      exclusive: true,
      params: { value: 'true' },
      test(value) { return isAbsent(value) || value === true; }
    });
  }
  isFalse(message = boolean.isValue) {
    return this.test({
      message,
      name: 'is-value',
      exclusive: true,
      params: { value: 'false' },
      test(value) { return isAbsent(value) || value === false; }
    });
  }
}

create$7.prototype = BooleanSchema.prototype;

const isoReg = /^(\d{4}|[+-]\d{6})(?:-?(\d{2})(?:-?(\d{2}))?)?(?:[ T]?(\d{2}):?(\d{2})(?::?(\d{2})(?:[,.](\d{1,}))?)?(?:(Z)|([+-])(\d{2})(?::?(\d{2}))?)?)?$/;

function parseIsoDate(date) {
  const struct = parseDateStruct(date);
  if (!struct) return Date.parse ? Date.parse(date) : Number.NaN;
  if (struct.z === undefined && struct.plusMinus === undefined) {
    return new Date(struct.year, struct.month, struct.day, struct.hour, struct.minute, struct.second, struct.millisecond).valueOf();
  }
  let totalMinutesOffset = 0;
  if (struct.z !== 'Z' && struct.plusMinus !== undefined) {
    totalMinutesOffset = struct.hourOffset * 60 + struct.minuteOffset;
    if (struct.plusMinus === '+') totalMinutesOffset = 0 - totalMinutesOffset;
  }
  return Date.UTC(struct.year, struct.month, struct.day, struct.hour, struct.minute + totalMinutesOffset, struct.second, struct.millisecond);
}

function parseDateStruct(date) {
  const regexResult = isoReg.exec(date);
  if (!regexResult) return null;
  return {
    year: toNumber(regexResult[1]),
    month: toNumber(regexResult[2], 1) - 1,
    day: toNumber(regexResult[3], 1),
    hour: toNumber(regexResult[4]),
    minute: toNumber(regexResult[5]),
    second: toNumber(regexResult[6]),
    millisecond: regexResult[7] ? toNumber(regexResult[7].substring(0, 3)) : 0,
    precision: regexResult[7]?.length,
    z: regexResult[8],
    plusMinus: regexResult[9],
    hourOffset: toNumber(regexResult[10]),
    minuteOffset: toNumber(regexResult[11])
  };
}

function toNumber(str, defaultValue = 0) {
  return Number(str) || defaultValue;
}

let rEmail = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
let rUrl = /^((https?|ftp):)?\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i;

let rUUID = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;
let yearMonthDay = '^\\d{4}-\\d{2}-\\d{2}';
let hourMinuteSecond = '\\d{2}:\\d{2}:\\d{2}';
let zOrOffset = '(([+-]\\d{2}(:?\\d{2})?)|Z)';
let rIsoDateTime = new RegExp(`${yearMonthDay}T${hourMinuteSecond}(\\.\\d+)?${zOrOffset}$`);
let isTrimmed = value => isAbsent(value) || value === value.trim();

function create$6() {
  return new StringSchema();
}

class StringSchema extends Schema {
  constructor() {
    super({
      type: 'string',
      check(value) {
        if (value instanceof String) value = value.valueOf();
        return typeof value === 'string';
      }
    });
    this.withMutation(() => {
      this.transform((value, _raw, ctx) => {
        if (!ctx.spec.coerce || ctx.isType(value)) return value;
        if (Array.isArray(value)) return value;
        const strValue = value != null && value.toString ? value.toString() : value;
        if (strValue === '[object Object]') return value;
        return strValue;
      });
    });
  }
  required(message) {
    return super.required(message).withMutation(schema => 
      schema.test({ message: message || mixed.required, name: 'required', skipAbsent: true, test: value => !!value.length })
    );
  }
  notRequired() {
    return super.notRequired().withMutation(schema => {
      schema.tests = schema.tests.filter(t => t.OPTIONS.name !== 'required');
      return schema;
    });
  }
  length(length, message = string.length) {
    return this.test({
      message,
      name: 'length',
      exclusive: true,
      params: { length },
      skipAbsent: true,
      test(value) { return value.length === this.resolve(length); }
    });
  }
  min(min, message = string.min) {
    return this.test({
      message,
      name: 'min',
      exclusive: true,
      params: { min },
      skipAbsent: true,
      test(value) { return value.length >= this.resolve(min); }
    });
  }
  max(max, message = string.max) {
    return this.test({
      name: 'max',
      message,
      assert: true,
      params: { max },
      skipAbsent: true,
      test(value) { return value.length <= this.resolve(max); }
    });
  }
  matches(regex, options) {
    let excludeEmptyString = false;
    let message;
    let name;
    if (options) {
      if (typeof options === 'object') ({ excludeEmptyString = false, message, name } = options);
      else message = options;
    }
    return this.test({
      name: name || 'matches',
      message: message || string.matches,
      params: { regex },
      skipAbsent: true,
      test: value => value === '' && excludeEmptyString || value.search(regex) !== -1
    });
  }
  email(message = string.email) {
    return this.matches(rEmail, { name: 'email', message, excludeEmptyString: true });
  }
  url(message = string.url) {
    return this.matches(rUrl, { name: 'url', message, excludeEmptyString: true });
  }
  uuid(message = string.uuid) {
    return this.matches(rUUID, { name: 'uuid', message, excludeEmptyString: false });
  }
  datetime(options) {
    let allowOffset, precision, message = '';
    if (options) {
      if (typeof options === 'object') ({ message = '', allowOffset = false, precision = undefined } = options);
      else message = options;
    }
    return this.matches(rIsoDateTime, {
      name: 'datetime',
      message: message || string.datetime,
      excludeEmptyString: true
    }).test({
      name: 'datetime_offset',
      message: message || string.datetime_offset,
      params: { allowOffset },
      skipAbsent: true,
      test: value => !value || allowOffset || parseDateStruct(value)?.z
    }).test({
      name: 'datetime_precision',
      message: message || string.datetime_precision,
      params: { precision },
      skipAbsent: true,
      test: value => {
        if (!value || precision == undefined) return true;
        const struct = parseDateStruct(value);
        if (!struct) return false;
        return struct.precision === precision;
      }
    });
  }

  ensure() {
    return this.default('').transform(val => val === null ? '' : val);
  }
  trim(message = string.trim) {
    return this.transform(val => val != null ? val.trim() : val).test({
      message,
      name: 'trim',
      test: isTrimmed
    });
  }
  lowercase(message = string.lowercase) {
    return this.transform(value => !isAbsent(value) ? value.toLowerCase() : value).test({
      message,
      name: 'string_case',
      exclusive: true,
      skipAbsent: true,
      test: value => isAbsent(value) || value === value.toLowerCase()
    });
  }
  uppercase(message = string.uppercase) {
    return this.transform(value => !isAbsent(value) ? value.toUpperCase() : value).test({
      message,
      name: 'string_case',
      exclusive: true,
      skipAbsent: true,
      test: value => isAbsent(value) || value === value.toUpperCase()
    });
  }
}

create$6.prototype = StringSchema.prototype;

//

let isNaN$1 = value => value != +value;

function create$5() {
  return new NumberSchema();
}

class NumberSchema extends Schema {
  constructor() {
    super({
      type: 'number',
      check(value) {
        if (value instanceof Number) value = value.valueOf();
        return typeof value === 'number' && !isNaN$1(value);
      }
    });
    this.withMutation(() => {
      this.transform((value, _raw, ctx) => {
        if (!ctx.spec.coerce) return value;
        let parsed = value;
        if (typeof parsed === 'string') {
          parsed = parsed.replace(/\s/g, '');
          if (parsed === '') return NaN;
          parsed = +parsed;
        }
        if (ctx.isType(parsed) || parsed === null) return parsed;
        return parseFloat(parsed);
      });
    });
  }
  min(min, message = number.min) {
    return this.test({ message, name: 'min', exclusive: true, params: { min }, skipAbsent: true, test(value) { return value >= this.resolve(min); } });
  }
  max(max, message = number.max) {
    return this.test({ message, name: 'max', exclusive: true, params: { max }, skipAbsent: true, test(value) { return value <= this.resolve(max); } });
  }
  lessThan(less, message = number.lessThan) {
    return this.test({ message, name: 'max', exclusive: true, params: { less }, skipAbsent: true, test(value) { return value < this.resolve(less); } });
  }
  moreThan(more, message = number.moreThan) {
    return this.test({ message, name: 'min', exclusive: true, params: { more }, skipAbsent: true, test(value) { return value > this.resolve(more); } });
  }
  positive(msg = number.positive) { return this.moreThan(0, msg); }
  negative(msg = number.negative) { return this.lessThan(0, msg); }
  integer(message = number.integer) {
    return this.test({ name: 'integer', message, skipAbsent: true, test: val => Number.isInteger(val) });
  }
  truncate() {
    return this.transform(value => !isAbsent(value) ? value | 0 : value);
  }
  round(method) {
    let avail = ['ceil', 'floor', 'round', 'trunc'];
    method = method?.toLowerCase() || 'round';
    if (method === 'trunc') return this.truncate();
    if (avail.indexOf(method.toLowerCase()) === -1) throw new TypeError('Only valid options for round() are: ' + avail.join(', '));
    return this.transform(value => !isAbsent(value) ? Math[method](value) : value);
  }
}

create$5.prototype = NumberSchema.prototype;

//

let invalidDate = new Date('');
let isDate = obj => Object.prototype.toString.call(obj) === '[object Date]';

function create$4() {
  return new DateSchema();
}

class DateSchema extends Schema {
  constructor() {
    super({
      type: 'date',
      check(v) { return isDate(v) && !isNaN(v.getTime()); }
    });
    this.withMutation(() => {
      this.transform((value, _raw, ctx) => {
        if (!ctx.spec.coerce || ctx.isType(value) || value === null) return value;
        value = parseIsoDate(value);
        return !isNaN(value) ? new Date(value) : DateSchema.INVALID_DATE;
      });
    });
  }
  prepareParam(ref, name) {
    let param;
    if (!Reference.isRef(ref)) {
      let cast = this.cast(ref);
      if (!this._typeCheck(cast)) throw new TypeError(`\`${name}\` must be a Date or a value that can be \`cast()\` to a Date`);
      param = cast;
    } else {
      param = ref;
    }
    return param;
  }
  min(min, message = date.min) {
    let limit = this.prepareParam(min, 'min');
    return this.test({ message, name: 'min', exclusive: true, params: { min }, skipAbsent: true, test(value) { return value >= this.resolve(limit); } });
  }
  max(max, message = date.max) {
    let limit = this.prepareParam(max, 'max');
    return this.test({ message, name: 'max', exclusive: true, params: { max }, skipAbsent: true, test(value) { return value <= this.resolve(limit); } });
  }
}

DateSchema.INVALID_DATE = invalidDate;
create$4.prototype = DateSchema.prototype;
create$4.INVALID_DATE = invalidDate;

//

function sortFields(fields, excludedEdges = []) {
  let edges = [];
  let nodes = new Set();
  let excludes = new Set(excludedEdges.map(([a, b]) => `${a}-${b}`));
  function addNode(depPath, key) {
    let node = propertyExpr.split(depPath)[0];
    nodes.add(node);
    if (!excludes.has(`${key}-${node}`)) edges.push([key, node]);
  }
  for (const key of Object.keys(fields)) {
    let value = fields[key];
    nodes.add(key);
    if (Reference.isRef(value) && value.isSibling) addNode(value.path, key); else if (isSchema(value) && 'deps' in value) value.deps.forEach(path => addNode(path, key));
  }
  return toposort__default["default"].array(Array.from(nodes), edges).reverse();
}

function findIndex(arr, err) {
  let idx = Infinity;
  arr.some((key, ii) => {
    if (err.path?.includes(key)) {
      idx = ii;
      return true;
    }
  });
  return idx;
}

function sortByKeyOrder(keys) {
  return (a, b) => findIndex(keys, a) - findIndex(keys, b);
}

const parseJson = (value, _, ctx) => {
  if (typeof value !== 'string') {
    return value;
  }
  let parsed = value;
  try {
    parsed = JSON.parse(value);
  } catch (err) {
    /* */
  }
  return ctx.isType(parsed) ? parsed : value;
};

function deepPartial(schema) {
  if ('fields' in schema) {
    const partial = {};
    for (const [key, fieldSchema] of Object.entries(schema.fields)) {
      partial[key] = deepPartial(fieldSchema);
    }
    return schema.setFields(partial);
  }
  if (schema.type === 'array') {
    const nextArray = schema.optional();
    if (nextArray.innerType) nextArray.innerType = deepPartial(nextArray.innerType);
    return nextArray;
  }
  if (schema.type === 'tuple') {
    return schema.optional().clone({ types: schema.spec.types.map(deepPartial) });
  }
  if ('optional' in schema) {
    return schema.optional();
  }
  return schema;
}

const deepHas = (obj, p) => {
  const path = [...propertyExpr.normalizePath(p)];
  if (path.length === 1) return path[0] in obj;
  let last = path.pop();
  let parent = propertyExpr.getter(propertyExpr.join(path), true)(obj);
  return !!(parent && last in parent);
};

let isObject = obj => Object.prototype.toString.call(obj) === '[object Object]';

function unknown(ctx, value) {
  let known = Object.keys(ctx.fields);
  return Object.keys(value).filter(key => known.indexOf(key) === -1);
}

const defaultSort = sortByKeyOrder([]);

function create$3(spec) {
  return new ObjectSchema(spec);
}

class ObjectSchema extends Schema {
  constructor(spec) {
    super({
      type: 'object',
      check(value) { return isObject(value) || typeof value === 'function'; }
    });
    this.fields = Object.create(null);
    this._sortErrors = defaultSort;
    this._nodes = [];
    this._excludedEdges = [];
    this.withMutation(() => { if (spec) this.shape(spec); });
  }
  _cast(_value, options = {}) {
    let value = super._cast(_value, options);
    if (value === undefined) return this.getDefault(options);
    if (!this._typeCheck(value)) return value;
    let fields = this.fields;
    let strip = options.stripUnknown ?? this.spec.noUnknown;
    let props = [].concat(this._nodes, Object.keys(value).filter(v => !this._nodes.includes(v)));
    let intermediateValue = {};
    let innerOptions = Object.assign({}, options, { parent: intermediateValue, __validating: options.__validating || false });
    let isChanged = false;
    for (const prop of props) {
      let field = fields[prop];
      let exists = (prop in value);
      if (field) {
        let fieldValue;
        let inputValue = value[prop];
        innerOptions.path = (options.path ? `${options.path}.` : '') + prop;
        field = field.resolve({ value: inputValue, context: options.context, parent: intermediateValue });
        let fieldSpec = field instanceof Schema ? field.spec : undefined;
        let strict = fieldSpec?.strict;
        if (fieldSpec?.strip) {
          isChanged = isChanged || prop in value;
          continue;
        }
        fieldValue = !options.__validating || !strict ? field.cast(value[prop], innerOptions) : value[prop];
        if (fieldValue !== undefined) {
          intermediateValue[prop] = fieldValue;
        }
      } else if (exists && !strip) {
        intermediateValue[prop] = value[prop];
      }
      if (exists !== prop in intermediateValue || intermediateValue[prop] !== value[prop]) {
        isChanged = true;
      }
    }
    return isChanged ? intermediateValue : value;
  }
  _validate(_value, options = {}, panic, next) {
    const { from = [], originalValue = _value, recursive = this.spec.recursive } = options;
    options.from = [{ schema: this, value: originalValue }, ...from];
    options.__validating = true;
    options.originalValue = originalValue;
    super._validate(_value, options, panic, (objectErrors, value) => {
      if (!recursive || !isObject(value)) {
        next(objectErrors, value);
        return;
      }
      const initialTests = [];
      for (let [key, test] of Object.entries(this.internalTests)) {
        initialTests.push(test);
      }
      this.runTests({ path: options.path, value, originalValue, options, tests: initialTests }, panic, initialErrors => {
        if (initialErrors.length) {
          return next(initialErrors, value);
        }
        originalValue = originalValue || value;
        let tests = [];
        for (let key of this._nodes) {
          let field = this.fields[key];
          if (!field || Reference.isRef(field)) {
            continue;
          }
          tests.push(field.asNestedTest({
            options,
            key,
            parent: value,
            parentPath: options.path,
            originalParent: originalValue
          }));
        }
        this.runTests({ tests, value, originalValue, options }, panic, fieldErrors => {
          next(fieldErrors.sort(this._sortErrors).concat(objectErrors), value);
        });
      });
    });
  }
  clone(spec) {
    const next = super.clone(spec);
    next.fields = Object.assign({}, this.fields);
    next._nodes = this._nodes;
    next._excludedEdges = this._excludedEdges;
    next._sortErrors = this._sortErrors;
    return next;
  }
  concat(schema) {
    let next = super.concat(schema);

    let nextFields = next.fields;
    for (let [field, schemaOrRef] of Object.entries(this.fields)) {
      const target = nextFields[field];
      nextFields[field] = target === undefined ? schemaOrRef : target;
    }
    return next.withMutation(s => s.setFields(nextFields, [...this._excludedEdges, ...schema._excludedEdges]));
  }
  _getDefault(options) {
    if ('default' in this.spec) {
      return super._getDefault(options);
    }
    if (!this._nodes.length) {
      return undefined;
    }
    let dft = {};
    this._nodes.forEach(key => {
      const field = this.fields[key];
      let innerOptions = options;
      if (innerOptions?.value) {
        innerOptions = Object.assign({}, innerOptions, { parent: innerOptions.value, value: innerOptions.value[key] });
      }
      dft[key] = field && 'getDefault' in field ? field.getDefault(innerOptions) : undefined;
    });
    return dft;
  }
  setFields(shape, excludedEdges) {
    let next = this.clone();
    next.fields = shape;
    next._nodes = sortFields(shape, excludedEdges);
    next._sortErrors = sortByKeyOrder(Object.keys(shape));
    if (excludedEdges) next._excludedEdges = excludedEdges;
    return next;
  }
  shape(additions, excludes = []) {
    return this.clone().withMutation(next => {
      let edges = next._excludedEdges;
      if (excludes.length) {
        if (!Array.isArray(excludes[0])) excludes = [excludes];
        edges = [...next._excludedEdges, ...excludes];
      }
      return next.setFields(Object.assign(next.fields, additions), edges);
    });
  }
  partial() {
    const partial = {};
    for (const [key, schema] of Object.entries(this.fields)) {
      partial[key] = 'optional' in schema && schema.optional instanceof Function ? schema.optional() : schema;
    }
    return this.setFields(partial);
  }
  deepPartial() {
    const next = deepPartial(this);
    return next;
  }
  pick(keys) {
    const picked = {};
    for (const key of keys) {
      if (this.fields[key]) picked[key] = this.fields[key];
    }
    return this.setFields(picked, this._excludedEdges.filter(([a, b]) => keys.includes(a) && keys.includes(b)));
  }
  omit(keys) {
    const remaining = [];
    for (const key of Object.keys(this.fields)) {
      if (keys.includes(key)) continue;
      remaining.push(key);
    }
    return this.pick(remaining);
  }
  from(from, to, alias) {
    let fromGetter = propertyExpr.getter(from, true);
    return this.transform(obj => {
      if (!obj) return obj;
      let newObj = obj;
      if (deepHas(obj, from)) {
        newObj = Object.assign({}, obj);
        if (!alias) delete newObj[from];
        newObj[to] = fromGetter(obj);
      }
      return newObj;
    });
  }
  json() { return this.transform(parseJson); }
  noUnknown(noAllow = true, message = object.noUnknown) {
    if (typeof noAllow !== 'boolean') {
      message = noAllow;
      noAllow = true;
    }
    let next = this.test({
      name: 'noUnknown',
      exclusive: true,
      message: message,
      test(value) { return value == null || unknown(this.schema, value).length === 0 || this.createError({ params: { unknown: unknown(this.schema, value).join(', ') } }); }
    });
    next.spec.noUnknown = noAllow;
    return next;
  }
  unknown(allow = true, message = object.noUnknown) {
    return this.noUnknown(!allow, message);
  }
  transformKeys(fn) {
    return this.transform(obj => {
      if (!obj) return obj;
      const result = {};
      for (const key of Object.keys(obj)) result[fn(key)] = obj[key];
      return result;
    });
  }
  camelCase() { return this.transformKeys(tinyCase.camelCase); }
  snakeCase() { return this.transformKeys(tinyCase.snakeCase); }
  constantCase() { return this.transformKeys(key => tinyCase.snakeCase(key).toUpperCase()); }
  describe(options) {
    const next = (options ? this.resolve(options) : this).clone();
    const base = super.describe(options);
    base.fields = {};
    for (const [key, value] of Object.entries(next.fields)) {
      let innerOptions = options;
      if (innerOptions?.value) {
        innerOptions = Object.assign({}, innerOptions, { parent: innerOptions.value, value: innerOptions.value[key] });
      }
      base.fields[key] = value.describe(innerOptions);
    }
    return base;
  }
}

create$3.prototype = ObjectSchema.prototype;

function create$2(type) {
  return new ArraySchema(type);
}

class ArraySchema extends Schema {
  constructor(type) {
    super({
      type: 'array',
      spec: { types: type },
      check(v) { return Array.isArray(v); }
    });
    this.innerType = type;
  }
  _cast(_value, _opts) {
    const value = super._cast(_value, _opts);
    if (!this._typeCheck(value) || !this.innerType) {
      return value;
    }
    let isChanged = false;
    const castArray = value.map((v, idx) => {
      const castElement = this.innerType.cast(v, Object.assign({}, _opts, { path: `${_opts.path || ''}[${idx}]` }));
      if (castElement !== v) {
        isChanged = true;
      }
      return castElement;
    });
    return isChanged ? castArray : value;
  }
  _validate(_value, options = {}, panic, next) {
    const { recursive = this.spec.recursive } = options;
    const innerType = this.innerType;
    options.originalValue = options.originalValue ?? _value;
    super._validate(_value, options, panic, (arrayErrors, value) => {
      if (!recursive || !innerType || !this._typeCheck(value)) {
        next(arrayErrors, value);
        return;
      }
      const tests = value.map((v, idx) => innerType.asNestedTest({ options, index: idx, parent: value, parentPath: options.path, originalParent: options.originalValue ?? _value }));
      this.runTests({ value, tests, originalValue: options.originalValue ?? _value, options }, panic, innerTypeErrors => next(innerTypeErrors.concat(arrayErrors), value));
    });
  }
  clone(spec) {
    const next = super.clone(spec);
    next.innerType = this.innerType;
    return next;
  }
  json() { return this.transform(parseJson); }
  concat(schema) {
    let next = super.concat(schema);
    next.innerType = this.innerType;
    if (schema.innerType) next.innerType = next.innerType ? next.innerType.concat(schema.innerType) : schema.innerType;
    return next;
  }
  of(schema) {
    let next = this.clone();
    if (!isSchema(schema)) throw new TypeError('`array.of()` sub-schema must be a valid schema not: ' + printValue(schema));
    next.innerType = schema;
    next.spec = Object.assign({}, next.spec, { types: schema });
    return next;
  }
  length(length, message = array.length) {
    return this.test({ message, name: 'length', exclusive: true, params: { length }, skipAbsent: true, test(value) { return value.length === this.resolve(length); } });
  }
  min(min, message) {
    message = message || array.min;
    return this.test({ message, name: 'min', exclusive: true, params: { min }, skipAbsent: true, test(value) { return value.length >= this.resolve(min); } });
  }
  max(max, message) {
    message = message || array.max;
    return this.test({ message, name: 'max', exclusive: true, params: { max }, skipAbsent: true, test(value) { return value.length <= this.resolve(max); } });
  }
  ensure() {
    return this.default(() => []).transform((val, original) => { if (this._typeCheck(val)) return val; return original == null ? [] : [].concat(original); });
  }
  compact(rejector) {
    const reject = !rejector ? v => !!v : (v, i, a) => !rejector(v, i, a);
    return this.transform(values => values != null ? values.filter(reject) : values);
  }
  describe(options) {
    const next = (options ? this.resolve(options) : this).clone();
    const base = super.describe(options);
    if (next.innerType) {
      let innerOptions = options;
      if (innerOptions?.value) {
        innerOptions = Object.assign({}, innerOptions, { parent: innerOptions.value, value: innerOptions.value[0] });
      }
      base.innerType = next.innerType.describe(innerOptions);
    }
    return base;
  }
}

create$2.prototype = ArraySchema.prototype;

function create$1(schemas) {
  return new TupleSchema(schemas);
}

class TupleSchema extends Schema {
  constructor(schemas) {
    super({
      type: 'tuple',
      spec: { types: schemas },
      check(v) {
        const types = this.spec.types;
        return Array.isArray(v) && v.length === types.length;
      }
    });
    this.withMutation(() => {
      this.typeError(tuple.notType);
    });
  }
  _cast(inputValue, options) {
    const { types } = this.spec;
    const value = super._cast(inputValue, options);
    if (!this._typeCheck(value)) {
      return value;
    }
    let isChanged = false;
    const castArray = types.map((type, idx) => {
      const castElement = type.cast(value[idx], Object.assign({}, options, { path: `${options.path || ''}[${idx}]` }));
      if (castElement !== value[idx]) isChanged = true;
      return castElement;
    });
    return isChanged ? castArray : value;
  }
  _validate(_value, options = {}, panic, next) {
    const itemTypes = this.spec.types;
    super._validate(_value, options, panic, (tupleErrors, value) => {
      if (!this._typeCheck(value)) {
        next(tupleErrors, value);
        return;
      }
      const tests = itemTypes.map((itemSchema, idx) => itemSchema.asNestedTest({ options, index: idx, parent: value, parentPath: options.path, originalParent: options.originalValue ?? _value }));
      this.runTests({ value, tests, originalValue: options.originalValue ?? _value, options }, panic, innerTypeErrors => next(innerTypeErrors.concat(tupleErrors), value));
    });
  }
  describe(options) {
    const next = (options ? this.resolve(options) : this).clone();
    const base = super.describe(options);
    base.innerType = next.spec.types.map((schema, idx) => {
      let innerOptions = options;
      if (innerOptions?.value) {
        innerOptions = Object.assign({}, innerOptions, { parent: innerOptions.value, value: innerOptions.value[idx] });
      }
      return schema.describe(innerOptions);
    });
    return base;
  }
}

create$1.prototype = TupleSchema.prototype;

function create(builder) {
  return new Lazy(builder);
}

class Lazy {
  constructor(builder) {
    this.type = 'lazy';
    this.__isYupSchema__ = true;
    this.builder = builder;
    this.spec = { meta: undefined, optional: false };
  }
  clone(spec) {
    const next = new Lazy(this.builder);
    next.spec = Object.assign({}, this.spec, spec);
    return next;
  }
  optionality(optional) {
    const next = this.clone({ optional });
    return next;
  }
  optional() { return this.optionality(true); }
  resolve(options) {
    return this._resolve(options.value, options);
  }
  _resolve(value, options = {}) {
    let schema = this.builder(value, options);
    if (!isSchema(schema)) throw new TypeError('lazy() functions must return a valid schema');
    if (this.spec.optional) schema = schema.optional();
    return schema.resolve(options);
  }
  cast(value, options) {
    return this._resolve(value, options).cast(value, options);
  }
  asNestedTest(config) {
    let { key, index, parent, options } = config;
    let value = parent[index != null ? index : key];
    return this._resolve(value, Object.assign({}, options, { value, parent })).asNestedTest(config);
  }
  validate(value, options) {
    return this._resolve(value, options).validate(value, options);
  }
  validateSync(value, options) {
    return this._resolve(value, options).validateSync(value, options);
  }
  validateAt(path, value, options) {
    return this._resolve(value, options).validateAt(path, value, options);
  }
  validateSyncAt(path, value, options) {
    return this._resolve(value, options).validateSyncAt(path, value, options);
  }
  isValid(value, options) {
    return this._resolve(value, options).isValid(value, options);
  }
  isValidSync(value, options) {
    return this._resolve(value, options).isValidSync(value, options);
  }
  describe(options) {
    return options ? this.resolve(options).describe(options) : { type: 'lazy', meta: this.spec.meta };
  }
  meta(...args) {
    if (args.length === 0) return this.spec.meta;
    let next = this.clone();
    next.spec.meta = Object.assign(next.spec.meta || {}, args[0]);
    return next;
  }
}

function setLocale(custom) {
  Object.keys(custom).forEach(type => {
    Object.keys(custom[type]).forEach(method => {
      locale[type][method] = custom[type][method];
    });
  });
}

function addMethod(schemaType, name, fn) {
  if (!schemaType || !isSchema(schemaType.prototype))
    throw new TypeError('You must provide a yup schema constructor function');
  if (typeof name !== 'string')
    throw new TypeError('A Method name must be provided');
  if (typeof fn !== 'function')
    throw new TypeError('Method function must be provided');
  schemaType.prototype[name] = fn;
}

exports.ArraySchema = ArraySchema;
exports.BooleanSchema = BooleanSchema;
exports.DateSchema = DateSchema;
exports.MixedSchema = MixedSchema;
exports.NumberSchema = NumberSchema;
exports.ObjectSchema = ObjectSchema;
exports.Schema = Schema;
exports.StringSchema = StringSchema;
exports.TupleSchema = TupleSchema;
exports.ValidationError = ValidationError;
exports.addMethod = addMethod;
exports.array = create$2;
exports.bool = create$7;
exports.boolean = create$7;
exports.date = create$4;
exports.defaultLocale = locale;
exports.getIn = getIn;
exports.isSchema = isSchema;
exports.lazy = create;
exports.mixed = create$8;
exports.number = create$5;
exports.object = create$3;
exports.printValue = printValue;
exports.reach = reach;
exports.ref = create$9;
exports.setLocale = setLocale;
exports.string = create$6;
exports.tuple = create$1;
