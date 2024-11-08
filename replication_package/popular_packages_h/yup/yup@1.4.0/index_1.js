'use strict';

const propertyExpr = require('property-expr');
const tinyCase = require('tiny-case');
const toposort = require('toposort');

const SYMBOL_REGEXP = /^Symbol\((.*)\)(.*)$/;

function isNumber(val) {
  return typeof val === 'number';
}

function isString(val) {
  return typeof val === 'string';
}

function isObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]';
}

function printNumber(val) {
  if (val !== +val) return 'NaN';
  const isNegativeZero = val === 0 && 1 / val < 0;
  return isNegativeZero ? '-0' : '' + val;
}

function printSimpleValue(val, quoteStrings = false) {
  if (val == null || val === true || val === false) return '' + val;
  const typeOf = typeof val;
  if (typeOf === 'number') return printNumber(val);
  if (typeOf === 'string') return quoteStrings ? `"${val}"` : val;
  if (typeOf === 'function') return '[Function ' + (val.name || 'anonymous') + ']';
  if (typeOf === 'symbol') return Symbol.prototype.toString.call(val).replace(SYMBOL_REGEXP, 'Symbol($1)');
  const tag = Object.prototype.toString.call(val).slice(8, -1);
  if (tag === 'Date') return isNaN(val.getTime()) ? '' + val : val.toISOString(val);
  if (tag === 'Error' || val instanceof Error) return '[' + Error.prototype.toString.call(val) + ']';
  if (tag === 'RegExp') return RegExp.prototype.toString.call(val);
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

class ValidationErrorNoStack {
  constructor(errorOrErrors, value, field, type) {
    this.name = 'ValidationError';
    this.message = '';
    this.value = value;
    this.path = field;
    this.type = type;
    this.errors = [];
    this.inner = [];
    toArray(errorOrErrors).forEach(err => {
      if (ValidationError.isError(err)) {
        this.errors.push(...err.errors);
        const innerErrors = err.inner.length ? err.inner : [err];
        this.inner.push(...innerErrors);
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
    if (path !== params.path) params = Object.assign({}, params, { path });
    if (typeof message === 'string') return message.replace(/\$\{\s*(\w+)\s*\}/g, (_, key) => printValue(params[key]));
    if (typeof message === 'function') return message(params);
    return message;
  }

  static isError(err) {
    return err && err.name === 'ValidationError';
  }

  constructor(errorOrErrors, value, field, type, disableStack) {
    const errorNoStack = new ValidationErrorNoStack(errorOrErrors, value, field, type);
    if (disableStack) {
      return errorNoStack;
    }
    super();
    this.name = 'ValidationError';
    this.message = errorNoStack.message;
    this.type = errorNoStack.type;
    this.value = errorNoStack.value;
    this.path = errorNoStack.path;
    this.errors = errorNoStack.errors;
    this.inner = errorNoStack.inner;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }
  }
}

const mixed = {
  default: '${path} is invalid',
  required: '${path} is a required field',
  notType: ({ path, type, value, originalValue }) => {
    let castMsg = originalValue != null && originalValue !== value ? ` (cast from the value \`${printValue(originalValue, true)}\`).` : '.';
    return type !== 'mixed' ? `${path} must be a \`${type}\` type, but the final value was: \`${printValue(value, true)}\`` + castMsg
                             : `${path} must match the configured type. The validated value was: \`${printValue(value, true)}\`` + castMsg;
  }
};

const string = {
  length: '${path} must be exactly ${length} characters',
  min: '${path} must be at least ${min} characters',
  max: '${path} must be at most ${max} characters',
  email: '${path} must be a valid email',
  url: '${path} must be a valid URL'
};

const number = {
  min: '${path} must be greater than or equal to ${min}',
  max: '${path} must be less than or equal to ${max}',
  positive: '${path} must be a positive number'
};

const date = {
  min: '${path} field must be later than ${min}',
  max: '${path} field must be at earlier than ${max}'
};

const object = {
  noUnknown: '${path} field has unspecified keys: ${unknown}'
};

const array = {
  min: '${path} field must have at least ${min} items',
  max: '${path} field must have less than or equal to ${max} items'
};

const locale = Object.assign(Object.create(null), {
  mixed,
  string,
  number,
  date,
  object,
  array
});

const isSchema = obj => obj && obj.__isYupSchema__;

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
    let values = this.refs.map(ref => ref.getValue(options.value, options.parent, options.context));
    let schema = this.fn(values, base, options);
    if (schema === undefined || schema === base) return base;
    if (!isSchema(schema)) throw new TypeError('conditions must return a schema object');
    return schema.resolve(options);
  }
}

const prefixes = {
  context: '$',
  value: '.'
};

function create$9(key, options) {
  return new Reference(key, options);
}

class Reference {
  constructor(key, options = {}) {
    if (typeof key !== 'string') throw new TypeError('ref must be a string, got: ' + key);
    this.key = key.trim();
    if (key === '') throw new TypeError('ref must be a non-empty string');

    this.isContext = this.key[0] === prefixes.context;
    this.isValue = this.key[0] === prefixes.value;
    this.isSibling = !this.isContext && !this.isValue;

    let prefix = this.isContext ? prefixes.context : this.isValue ? prefixes.value : '';
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
    return this.getValue(value, options.parent, options.context);
  }

  resolve() {
    return this;
  }

  describe() {
    return {
      type: 'ref',
      key: this.key
    };
  }

  toString() {
    return `Ref(${this.key})`;
  }

  static isRef(value) {
    return value && value.__isYupRef;
  }
}

Reference.prototype.__isYupRef = true;

const isAbsent = value => value == null;

function createValidation(config) {
  function validate({ value, path = '', options, originalValue, schema }, panic, next) {
    const { name, test, params, message, skipAbsent } = config;
    let { parent, context, abortEarly = schema.spec.abortEarly, disableStackTrace = schema.spec.disableStackTrace } = options;

    function resolve(item) {
      return Reference.isRef(item) ? item.getValue(value, parent, context) : item;
    }

    function createError(overrides = {}) {
      const nextParams = Object.assign({ value, originalValue, label: schema.spec.label, path: overrides.path || path, spec: schema.spec, disableStackTrace: overrides.disableStackTrace || disableStackTrace }, params, overrides.params);
      for (const key of Object.keys(nextParams)) nextParams[key] = resolve(nextParams[key]);

      const error = new ValidationError(ValidationError.formatError(overrides.message || message, nextParams), value, nextParams.path, overrides.type || name, nextParams.disableStackTrace);
      error.params = nextParams;
      return error;
    }

    const invalid = abortEarly ? panic : next;

    let ctx = { path, parent, type: name, from: options.from, createError, resolve, options, originalValue, schema };
    const handleResult = validOrError => {
      if (ValidationError.isError(validOrError)) invalid(validOrError);
      else if (!validOrError) invalid(createError());
      else next(null);
    };
    const handleError = err => {
      if (ValidationError.isError(err)) invalid(err);
      else panic(err);
    };

    if (skipAbsent && isAbsent(value)) {
      return handleResult(true);
    }

    let result;
    try {
      result = test.call(ctx, value, ctx);
      if (typeof result?.then === 'function') {
        if (options.sync) {
          throw new Error(`Validation test of type: "${ctx.type}" returned a Promise during a synchronous validate. This test will finish after the validate call has returned`);
        }
        return Promise.resolve(result).then(handleResult, handleError);
      }
    } catch (err) {
      handleError(err);
      return;
    }
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

      if (value && idx >= value.length) {
        throw new Error(`Yup.reach cannot resolve an array item at index: ${_part}, in the path: ${path}. because there is no value at that index.`);
      }
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
  describe() {
    const description = [];
    for (const item of this.values()) {
      description.push(Reference.isRef(item) ? item.describe() : item);
    }
    return description;
  }

  resolveAll(resolve) {
    let result = [];
    for (const item of this.values()) {
      result.push(resolve(item));
    }
    return result;
  }

  clone() {
    return new ReferenceSet(this.values());
  }

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
    this._mutate = false;
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

    this.withMutation(() => {
      this.typeError(mixed.notType);
    });
  }

  clone(spec) {
    if (this._mutate) {
      if (spec) Object.assign(this.spec, spec);
      return this;
    }
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

  concat(schema) {
    if (!schema || schema === this) return this;
    if (schema.type !== this.type && this.type !== 'mixed') throw new TypeError(`You cannot \`concat()\` schema's of different types: ${this.type} and ${schema.type}`);

    let base = this;
    let combined = schema.clone();
    combined.spec = Object.assign({}, base.spec, combined.spec);
    combined.internalTests = Object.assign({}, base.internalTests, combined.internalTests);
    combined._whitelist = base._whitelist.merge(schema._whitelist, schema._blacklist);
    combined._blacklist = base._blacklist.merge(schema._blacklist, schema._whitelist);
    combined.tests = base.tests;
    combined.exclusiveTests = base.exclusiveTests;

    combined.withMutation(next => {
      schema.tests.forEach(fn => {
        next.test(fn.OPTIONS);
      });
    });
    combined.transforms = [...base.transforms, ...combined.transforms];

    return combined;
  }

  isType(v) {
    if (v == null) {
      if (this.spec.nullable && v === null) return true;
      if (this.spec.optional && v === undefined) return true;
      return false;
    }
    return this._typeCheck(v);
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
      let formattedValue = printValue(value);
      let formattedResult = printValue(result);
      throw new TypeError(`The value of ${options.path || 'field'} could not be cast to a value that satisfies the schema type: "${resolvedSchema.type}". attempted value: ${formattedValue} ` + (formattedResult !== formattedValue ? `result of cast: ${formattedResult}` : ''));
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

    let initialTests = [];
    for (let test of Object.values(this.internalTests)) {
      if (test) initialTests.push(test);
    }
    this.runTests({ path, value, originalValue, options, tests: initialTests }, panic, initialErrors => {
      if (initialErrors.length) {
        return next(initialErrors, value);
      }
      this.runTests({ path, value, originalValue, options, tests: this.tests }, panic, next);
    });
  }

  runTests(runOptions, panic, next) {
    let fired = false;
    let { tests, value, originalValue, path, options } = runOptions;
    let panicOnce = arg => {
      if (fired) return;
      fired = true;
      panic(arg, value);
    };
    let nextOnce = arg => {
      if (fired) return;
      fired = true;
      next(arg, value);
    };

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
    let schema = this.resolve(Object.assign({}, options, { value }));
    let disableStackTrace = options?.disableStackTrace ?? schema.spec.disableStackTrace;
    return new Promise((resolve, reject) => schema._validate(value, options, (error, parsed) => {
      if (ValidationError.isError(error)) error.value = parsed;
      reject(error);
    }, (errors, validated) => {
      if (errors.length) reject(new ValidationError(errors, validated, undefined, undefined, disableStackTrace));
      else resolve(validated);
    }));
  }

  validateSync(value, options) {
    let schema = this.resolve(Object.assign({}, options, { value }));
    let result;
    let disableStackTrace = options?.disableStackTrace ?? schema.spec.disableStackTrace;

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
    let defaultValue = this.spec.default;
    if (defaultValue == null) {
      return defaultValue;
    }
    return typeof defaultValue === 'function' ? defaultValue.call(this, options) : clone(defaultValue);
  }

  getDefault(options) {
    let schema = this.resolve(options || {});
    return schema._getDefault(options);
  }

  default(def) {
    if (arguments.length === 0) {
      return this._getDefault();
    }
    let next = this.clone({ default: def });
    return next;
  }

  strict(isStrict = true) {
    return this.clone({ strict: isStrict });
  }

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
    if (typeof opts.test !== 'function') throw new TypeError('`test` is a required parameter');

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

    const description = {
      meta: next.spec.meta,
      label: next.spec.label,
      optional: next.spec.optional,
      nullable: next.spec.nullable,
      default: next.getDefault(options),
      type: next.type,
      oneOf: next._whitelist.describe(),
      notOneOf: next._blacklist.describe(),
      tests: next.tests.map(fn => ({
        name: fn.OPTIONS.name,
        params: fn.OPTIONS.params
      })).filter((n, idx, list) => list.findIndex(c => c.name === n.name) === idx)
    };

    return description;
  }
}

Schema.prototype.__isYupSchema__ = true;

for (const method of ['validate', 'validateSync']) {
  Schema.prototype[`${method}At`] = function (path, value, options = {}) {
    const { parent, parentPath, schema } = getIn(this, path, value, options.context);
    return schema[method](parent && parent[parentPath], Object.assign({}, options, { parent, path }));
  };
}

for (const alias of ['equals', 'is']) Schema.prototype[alias] = Schema.prototype.oneOf;
for (const alias of ['not', 'nope']) Schema.prototype[alias] = Schema.prototype.notOneOf;

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

  isTrue(message = 'The value must be true') {
    return this.test({
      message,
      name: 'is-value',
      exclusive: true,
      params: { value: 'true' },
      test(value) {
        return isAbsent(value) || value === true;
      }
    });
  }

  isFalse(message = 'The value must be false') {
    return this.test({
      message,
      name: 'is-value',
      exclusive: true,
      params: { value: 'false' },
      test(value) {
        return isAbsent(value) || value === false;
      }
    });
  }
}

create$7.prototype = BooleanSchema.prototype;

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
    return super.required(message).withMutation(schema => schema.test({
      message: message || mixed.required,
      name: 'required',
      skipAbsent: true,
      test: value => value && value.trim().length > 0
    }));
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
      test(value) {
        return value.length === this.resolve(length);
      }
    });
  }

  email(message = string.email) {
    return this.matches(/^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9-]{1,61}\.[a-zA-Z]{2,}$/i, {
      name: 'email',
      message,
      excludeEmptyString: true
    });
  }

  matches(regex, options) {
    let excludeEmptyString = false;
    let message, name;
    if (options) {
      if (typeof options === 'object') {
        ({ excludeEmptyString = false, message, name } = options);
      } else {
        message = options;
      }
    }
    return this.test({
      name: name || 'matches',
      message: message || string.matches,
      params: { regex },
      skipAbsent: true,
      test: value => value === '' && excludeEmptyString || value.search(regex) !== -1
    });
  }
}

create$6.prototype = StringSchema.prototype;

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
    return this.test({
      message,
      name: 'min',
      exclusive: true,
      params: { min },
      skipAbsent: true,
      test(value) {
        return value >= this.resolve(min);
      }
    });
  }

  positive(msg = number.positive) {
    return this.moreThan(0, msg);
  }
}

create$5.prototype = NumberSchema.prototype;

function create$4() {
  return new DateSchema();
}

class DateSchema extends Schema {
  constructor() {
    super({
      type: 'date',
      check(v) {
        return isDate(v) && !isNaN(v.getTime());
      }
    });

    this.withMutation(() => {
      this.transform((value, _raw, ctx) => {
        if (!ctx.spec.coerce || ctx.isType(value) || value === null) return value;
        value = parseIsoDate(value);
        return !isNaN(value) ? new Date(value) : DateSchema.INVALID_DATE;
      });
    });
  }

  min(min, message = date.min) {
    let limit = this.prepareParam(min, 'min');
    return this.test({
      message,
      name: 'min',
      exclusive: true,
      params: { min },
      skipAbsent: true,
      test(value) {
        return value >= this.resolve(limit);
      }
    });
  }
}

DateSchema.INVALID_DATE = new Date('');

create$4.prototype = DateSchema.prototype;
create$4.INVALID_DATE = new Date('');

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

    if (Reference.isRef(value) && value.isSibling) addNode(value.path, key);
    else if (isSchema(value) && 'deps' in value) value.deps.forEach(path => addNode(path, key));
  }

  return toposort.array(Array.from(nodes), edges).reverse();
}

function findIndex(arr, err) {
  let idx = Infinity;
  arr.some((key, ii) => {
    if (err.path && err.path.includes(key)) {
      idx = ii;
      return true;
    }
  });
  return idx;
}

function sortByKeyOrder(keys) {
  return (a, b) => {
    return findIndex(keys, a) - findIndex(keys, b);
  };
}

const defaultSort = sortByKeyOrder([]);

function create$3(spec) {
  return new ObjectSchema(spec);
}

class ObjectSchema extends Schema {
  constructor(spec) {
    super({
      type: 'object',
      check(value) {
        return isObject(value) || typeof value === 'function';
      }
    });

    this.fields = Object.create(null);
    this._sortErrors = defaultSort;
    this._nodes = [];
    this._excludedEdges = [];

    this.withMutation(() => {
      if (spec) {
        this.shape(spec);
      }
    });
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
    let { from = [], originalValue = _value, recursive = this.spec.recursive } = options;
    options.from = [{ schema: this, value: originalValue }, ...from];
    options.__validating = true;
    options.originalValue = originalValue;
    super._validate(_value, options, panic, (objectErrors, value) => {
      if (!recursive || !isObject(value)) {
        next(objectErrors, value);
        return;
      }
      originalValue = originalValue || value;
      let tests = [];
      for (let key of this._nodes) {
        let field = this.fields[key];
        if (!field || Reference.isRef(field)) {
          continue;
        }
        tests.push(field.asNestedTest({ options, key, parent: value, parentPath: options.path, originalParent: originalValue }));
      }
      this.runTests({ tests, value, originalValue, options }, panic, fieldErrors => {
        next(fieldErrors.sort(this._sortErrors).concat(objectErrors), value);
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

  noUnknown(noAllow = true, message = 'Field has unspecified keys: ${unknown}') {
    if (typeof noAllow !== 'boolean') {
      message = noAllow;
      noAllow = true;
    }
    let next = this.test({
      name: 'noUnknown',
      exclusive: true,
      message: message,
      test(value) {
        if (value == null) return true;
        const unknownKeys = unknown(this.schema, value);
        return !noAllow || unknownKeys.length === 0 || this.createError({ params: { unknown: unknownKeys.join(', ') } });
      }
    });
    next.spec.noUnknown = noAllow;
    return next;
  }

  unknown(allow = true, message = 'Field has unspecified keys: ${unknown}') {
    return this.noUnknown(!allow, message);
  }
}

create$3.prototype = ObjectSchema.prototype;

function create$2(type) {
  return new ArraySchema(type);
}

class ArraySchema extends Schema {
  constructor(type) {
    super({ type: 'array', check(v) { return Array.isArray(v); }, spec: { types: type } });

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
    let innerType = this.innerType;
    super._validate(_value, options, panic, (arrayErrors, value) => {
      if (!innerType || !this._typeCheck(value)) {
        next(arrayErrors, value);
        return;
      }
      let tests = value.map((el, idx) => innerType.asNestedTest({ options, index: idx, parent: value, parentPath: options.path, originalParent: _value }));
      this.runTests({ value, tests, originalValue: options.originalValue ?? _value, options }, panic, innerTypeErrors => {
        next(innerTypeErrors.concat(arrayErrors), value);
      });
    });
  }

  clone(spec) {
    const next = super.clone(spec);
    next.innerType = this.innerType;
    return next;
  }

  of(schema) {
    let next = this.clone();
    if (!isSchema(schema)) throw new TypeError('`array.of()` sub-schema must be a valid yup schema not: ' + printValue(schema));
    next.innerType = schema;
    next.spec = Object.assign({}, next.spec, { types: schema });
    return next;
  }
}

create$2.prototype = ArraySchema.prototype;

function create$1(schemas) {
  return new TupleSchema(schemas);
}

class TupleSchema extends Schema {
  constructor(schemas) {
    super({ type: 'tuple', spec: { types: schemas }, check(v) { return Array.isArray(v) && v.length === schemas.length; } });
    this.withMutation(() => this.typeError('is not a valid tuple'));
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
    this.spec = { meta: undefined, optional: false };
    this.builder = builder;
  }

  clone(spec) {
    const next = new Lazy(this.builder);
    next.spec = Object.assign({}, this.spec, spec);
    return next;
  }

  optional() {
    return this.clone({ optional: true });
  }

  resolve(options) {
    let schema = this.builder(options.value, options);
    if (!isSchema(schema)) throw new TypeError('lazy() functions must return a valid schema');
    if (this.spec.optional) schema = schema.optional();
    return schema.resolve(options);
  }

  asNestedTest(config) {
    let { key, index, parent, options } = config;
    let value = parent[index != null ? index : key];
    return this.resolve(Object.assign({}, options, { value, parent })).asNestedTest(config);
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
  if (!schemaType || !isSchema(schemaType.prototype)) throw new TypeError('You must provide a yup schema constructor function');
  if (typeof name !== 'string') throw new TypeError('A Method name must be provided');
  if (typeof fn !== 'function') throw new TypeError('Method function must be provided');
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
exports.lazy = create;
exports.setLocale = setLocale;
exports.mixed = create$8;
exports.boolean = create$7;
exports.string = create$6;
exports.number = create$5;
exports.date = create$4;
exports.object = create$3;
exports.array = create$2;
exports.reach = reach;
exports.ref = create$9;
