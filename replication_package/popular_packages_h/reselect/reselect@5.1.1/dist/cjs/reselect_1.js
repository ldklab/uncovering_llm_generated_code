"use strict";

// Define utility functions for object property management
const defineProperty = Object.defineProperty;
const getOwnPropDesc = Object.getOwnPropertyDescriptor;
const getOwnPropNames = Object.getOwnPropertyNames;
const hasOwnProp = Object.prototype.hasOwnProperty;

// Export function to expose module exports
const exportModule = (target, all) => {
  for (const name in all) {
    defineProperty(target, name, { get: all[name], enumerable: true });
  }
};

// Copy properties from one object to another
const copyProps = (to, from, except, desc) => {
  if (from && (typeof from === "object" || typeof from === "function")) {
    for (let key of getOwnPropNames(from)) {
      if (!hasOwnProp.call(to, key) && key !== except) {
        defineProperty(to, key, {
          get: () => from[key],
          enumerable: !(desc = getOwnPropDesc(from, key)) || desc.enumerable
        });
      }
    }
  }
  return to;
};

// Convert CommonJS module
const toCommonJS = (mod) => copyProps(defineProperty({}, "__esModule", { value: true }), mod);

// Main module code
const src_exports = {};

exportModule(src_exports, {
  createSelector: () => createSelector,
  createSelectorCreator: () => createSelectorCreator,
  createStructuredSelector: () => createStructuredSelector,
  lruMemoize: () => lruMemoize,
  referenceEqualityCheck: () => referenceEqualityCheck,
  setGlobalDevModeChecks: () => setGlobalDevModeChecks,
  unstable_autotrackMemoize: () => autotrackMemoize,
  weakMapMemoize: () => weakMapMemoize
});

module.exports = toCommonJS(src_exports);

// Development mode checks - identity function check
const runIdentityFunctionCheck = (resultFunc, inputSelectorsResults, outputSelectorResult) => {
  if (inputSelectorsResults.length === 1 && inputSelectorsResults[0] === outputSelectorResult) {
    let isInputSameAsOutput = false;
    try {
      const emptyObject = {};
      if (resultFunc(emptyObject) === emptyObject) {
        isInputSameAsOutput = true;
      }
    } catch {}

    if (isInputSameAsOutput) {
      let stack;
      try {
        throw new Error();
      } catch (e) {
        ({ stack } = e);
      }
      console.warn(
        "The result function returned its own inputs without modification. This could lead to inefficient memoization and unnecessary re-renders.",
        { stack }
      );
    }
  }
};

// Development mode checks - input stability check
const runInputStabilityCheck = (inputSelectorResultsObject, options, inputSelectorArgs) => {
  const { memoize, memoizeOptions } = options;
  const { inputSelectorResults, inputSelectorResultsCopy } = inputSelectorResultsObject;
  const createAnEmptyObject = memoize(() => ({}), ...memoizeOptions);

  const areInputsEqual =
    createAnEmptyObject.apply(null, inputSelectorResults) ===
    createAnEmptyObject.apply(null, inputSelectorResultsCopy);

  if (!areInputsEqual) {
    let stack;
    try {
      throw new Error();
    } catch (e) {
      ({ stack } = e);
    }
    console.warn(
      "An input selector returned a different result when passed the same arguments. This may cause the output selector to run more frequently than intended.",
      {
        arguments: inputSelectorArgs,
        inputsFirst: inputSelectorResults,
        inputsSecond: inputSelectorResultsCopy,
        stack
      }
    );
  }
};

// Set global development mode checks
const globalDevModeChecks = {
  inputStabilityCheck: "once",
  identityFunctionCheck: "once"
};

const setGlobalDevModeChecks = (devModeChecks) => {
  Object.assign(globalDevModeChecks, devModeChecks);
};

// Utility functions
const NOT_FOUND = Symbol("NOT_FOUND");
const assertIsFunction = (func, errorMessage = `expected a function, received ${typeof func}`) => {
  if (typeof func !== "function") {
    throw new TypeError(errorMessage);
  }
};
const assertIsObject = (object, errorMessage = `expected an object, received ${typeof object}`) => {
  if (typeof object !== "object") {
    throw new TypeError(errorMessage);
  }
};
const assertIsArrayOfFunctions = (array, errorMessage = `expected an array of functions, received: `) => {
  if (!array.every((item) => typeof item === "function")) {
    const itemTypes = array.map(item => typeof item === "function" ? `function ${item.name || "unnamed"}()` : typeof item).join(", ");
    throw new TypeError(`${errorMessage}[${itemTypes}]`);
  }
};
const ensureIsArray = (item) => Array.isArray(item) ? item : [item];
const getDependencies = (args) => {
  const dependencies = Array.isArray(args[0]) ? args[0] : args;
  assertIsArrayOfFunctions(dependencies, `createSelector expects all input-selectors to be functions.`);
  return dependencies;
};
const collectInputSelectorResults = (dependencies, args) => {
  const results = [];
  for (let dep of dependencies) {
    results.push(dep.apply(null, args));
  }
  return results;
};
const getDevModeChecksExecutionInfo = (firstRun, devModeChecks) => {
  const { identityFunctionCheck, inputStabilityCheck } = {
    ...globalDevModeChecks,
    ...devModeChecks
  };
  return {
    identityFunctionCheck: {
      shouldRun: identityFunctionCheck === "always" || (identityFunctionCheck === "once" && firstRun),
      run: runIdentityFunctionCheck
    },
    inputStabilityCheck: {
      shouldRun: inputStabilityCheck === "always" || (inputStabilityCheck === "once" && firstRun),
      run: runInputStabilityCheck
    }
  };
};

// Autotrack memoization
let $REVISION = 0;
let CURRENT_TRACKER = null;

class Cell {
  constructor(initialValue, isEqual = tripleEq) {
    this._value = this._lastValue = initialValue;
    this._isEqual = isEqual;
    this.revision = $REVISION;
  }

  get value() {
    CURRENT_TRACKER?.add(this);
    return this._value;
  }

  set value(newValue) {
    if (this.value === newValue) return;
    this._value = newValue;
    this.revision = ++$REVISION;
  }
}

const tripleEq = (a, b) => a === b;

class TrackingCache {
  constructor(fn) {
    this.fn = fn;
  }

  clear() {
    this._cachedValue = undefined;
    this._cachedRevision = -1;
    this._deps = [];
    this.hits = 0;
  }

  get value() {
    if (this.revision > this._cachedRevision) {
      const currentTracker = new Set();
      const prevTracker = CURRENT_TRACKER;
      CURRENT_TRACKER = currentTracker;
      this._cachedValue = this.fn();
      CURRENT_TRACKER = prevTracker;

      this.hits++;
      this._deps = Array.from(currentTracker);
      this._cachedRevision = this.revision;
    }

    CURRENT_TRACKER?.add(this);
    return this._cachedValue;
  }

  get revision() {
    return Math.max(...this._deps.map((d) => d.revision), 0);
  }
}

const getValue = (cell) => {
  if (!(cell instanceof Cell)) {
    console.warn("Not a valid cell! ", cell);
  }
  return cell.value;
};

const setValue = (storage, value) => {
  if (!(storage instanceof Cell)) {
    throw new TypeError("setValue must be passed a tracked store created with `createStorage`.");
  }
  storage.value = storage._lastValue = value;
};

function createCell(initialValue, isEqual = tripleEq) {
  return new Cell(initialValue, isEqual);
}

function createCache(fn) {
  assertIsFunction(fn, "the first parameter to `createCache` must be a function");
  return new TrackingCache(fn);
}

// Tracking utilities
const neverEq = () => false;

function createTag() {
  return createCell(null, neverEq);
}

function dirtyTag(tag, value) {
  setValue(tag, value);
}

function consumeCollection(node) {
  let tag = node.collectionTag;
  if (tag === null) {
    tag = node.collectionTag = createTag();
  }
  getValue(tag);
}

function dirtyCollection(node) {
  const tag = node.collectionTag;
  if (tag !== null) {
    dirtyTag(tag, null);
  }
}

// Proxy handlers for autotracked objects
const REDUX_PROXY_LABEL = Symbol();
let nextId = 0;
const proto = Object.getPrototypeOf({});

class ObjectTreeNode {
  constructor(value) {
    this.value = value;
    this.tag.value = value;
  }

  proxy = new Proxy(this, objectProxyHandler);
  tag = createTag();
  tags = {};
  children = {};
  collectionTag = null;
  id = nextId++;
}

const objectProxyHandler = {
  get(node, key) {
    const calculateResult = () => {
      const childValue = Reflect.get(node.value, key);

      if (typeof key === "symbol" || key in proto) {
        return childValue;
      }

      if (typeof childValue === "object" && childValue !== null) {
        let childNode = node.children[key];
        if (!childNode) {
          childNode = node.children[key] = createNode(childValue);
        }
        getValue(childNode.tag);
        return childNode.proxy;
      } else {
        let tag = node.tags[key];
        if (!tag) {
          tag = node.tags[key] = createTag();
          tag.value = childValue;
        }
        getValue(tag);
        return childValue;
      }
    };

    return calculateResult();
  },

  ownKeys(node) {
    consumeCollection(node);
    return Reflect.ownKeys(node.value);
  },

  getOwnPropertyDescriptor(node, key) {
    return Reflect.getOwnPropertyDescriptor(node.value, key);
  },

  has(node, key) {
    return Reflect.has(node.value, key);
  }
};

class ArrayTreeNode {
  constructor(value) {
    this.value = value;
    this.tag.value = value;
  }

  proxy = new Proxy([this], arrayProxyHandler);
  tag = createTag();
  tags = {};
  children = {};
  collectionTag = null;
  id = nextId++;
}

const arrayProxyHandler = {
  get([node], key) {
    if (key === "length") {
      consumeCollection(node);
    }
    return objectProxyHandler.get(node, key);
  },

  ownKeys([node]) {
    return objectProxyHandler.ownKeys(node);
  },

  getOwnPropertyDescriptor([node], key) {
    return objectProxyHandler.getOwnPropertyDescriptor(node, key);
  },

  has([node], key) {
    return objectProxyHandler.has(node, key);
  }
};

function createNode(value) {
  if (Array.isArray(value)) {
    return new ArrayTreeNode(value);
  }
  return new ObjectTreeNode(value);
}

function updateNode(node, newValue) {
  const { value, tags, children } = node;
  node.value = newValue;

  if (Array.isArray(value) && Array.isArray(newValue) && value.length !== newValue.length) {
    dirtyCollection(node);
  } else if (value !== newValue) {
    let oldKeysSize = 0;
    let newKeysSize = 0;
    let anyKeysAdded = false;

    for (const key in value) oldKeysSize++;
    for (const key in newValue) {
      newKeysSize++;
      if (!(key in value)) {
        anyKeysAdded = true;
        break;
      }
    }

    if (anyKeysAdded || oldKeysSize !== newKeysSize) {
      dirtyCollection(node);
    }
  }

  for (const key in tags) {
    const childValue = value[key];
    const newChildValue = newValue[key];
    if (childValue !== newChildValue) {
      dirtyCollection(node);
      dirtyTag(tags[key], newChildValue);
    }
    if (typeof newChildValue === "object" && newChildValue !== null) {
      delete tags[key];
    }
  }

  for (const key in children) {
    const childNode = children[key];
    const newChildValue = newValue[key];
    const childValue = childNode.value;
    if (childValue === newChildValue) {
      continue;
    } else if (typeof newChildValue === "object" && newChildValue !== null) {
      updateNode(childNode, newChildValue);
    } else {
      deleteNode(childNode);
      delete children[key];
    }
  }
}

function deleteNode(node) {
  if (node.tag) {
    dirtyTag(node.tag, null);
  }
  dirtyCollection(node);
  for (const key in node.tags) {
    dirtyTag(node.tags[key], null);
  }
  for (const key in node.children) {
    deleteNode(node.children[key]);
  }
}

// LRU memoization
function createSingletonCache(equals) {
  let entry;

  return {
    get(key) {
      return entry && equals(entry.key, key) ? entry.value : NOT_FOUND;
    },

    put(key, value) {
      entry = { key, value };
    },

    getEntries() {
      return entry ? [entry] : [];
    },

    clear() {
      entry = undefined;
    }
  };
}

function createLruCache(maxSize, equals) {
  let entries = [];

  function get(key) {
    const index = entries.findIndex((entry) => equals(key, entry.key));
    if (index > -1) {
      const entry = entries[index];
      if (index > 0) {
        entries.splice(index, 1);
        entries.unshift(entry);
      }
      return entry.value;
    }
    return NOT_FOUND;
  }

  function put(key, value) {
    if (get(key) === NOT_FOUND) {
      entries.unshift({ key, value });
      if (entries.length > maxSize) entries.pop();
    }
  }

  return { get, put, getEntries: () => entries, clear: () => { entries = []; } };
}

const referenceEqualityCheck = (a, b) => a === b;

function createCacheKeyComparator(equalityCheck) {
  return (prev, next) => {
    if (prev === null || next === null || prev.length !== next.length) {
      return false;
    }
    for (let i = 0; i < prev.length; i++) {
      if (!equalityCheck(prev[i], next[i])) {
        return false;
      }
    }
    return true;
  };
}

function lruMemoize(func, options = {}) {
  const { equalityCheck = referenceEqualityCheck, maxSize = 1, resultEqualityCheck } = options;
  const comparator = createCacheKeyComparator(equalityCheck);
  let resultsCount = 0;
  const cache = maxSize <= 1 ? createSingletonCache(comparator) : createLruCache(maxSize, comparator);

  function memoized() {
    let value = cache.get(arguments);
    if (value === NOT_FOUND) {
      value = func.apply(null, arguments);
      resultsCount++;

      if (resultEqualityCheck) {
        const entries = cache.getEntries();
        const matchingEntry = entries.find((entry) => resultEqualityCheck(entry.value, value));
        if (matchingEntry) {
          value = matchingEntry.value;
          resultsCount !== 0 && resultsCount--;
        }
      }
      cache.put(arguments, value);
    }
    return value;
  }

  memoized.clearCache = () => {
    cache.clear();
    memoized.resetResultsCount();
  };

  memoized.resultsCount = () => resultsCount;
  memoized.resetResultsCount = () => { resultsCount = 0; };

  return memoized;
}

// Autotrack memoization
function autotrackMemoize(func) {
  const node = createNode([]);
  let lastArgs = null;
  const shallowEqual = createCacheKeyComparator(referenceEqualityCheck);
  const cache = createCache(() => func.apply(null, node.proxy));

  function memoized() {
    if (!shallowEqual(lastArgs, arguments)) {
      updateNode(node, arguments);
      lastArgs = arguments;
    }
    return cache.value;
  }

  memoized.clearCache = cache.clear.bind(cache);
  return memoized;
}

// WeakMap memoization
class StrongRef {
  constructor(value) {
    this.value = value;
  }

  deref() {
    return this.value;
  }
}

const Ref = typeof WeakRef !== "undefined" ? WeakRef : StrongRef;

function createCacheNode() {
  return { s: UNTERMINATED, v: undefined, o: null, p: null };
}

function weakMapMemoize(func, options = {}) {
  let fnNode = createCacheNode();
  const { resultEqualityCheck } = options;
  let lastResult;
  let resultsCount = 0;

  function memoized() {
    let cacheNode = fnNode;
    const length = arguments.length;
    for (let i = 0; i < length; i++) {
      const arg = arguments[i];
      if (typeof arg === "function" || (typeof arg === "object" && arg !== null)) {
        let objectCache = cacheNode.o;
        if (objectCache === null) {
          cacheNode.o = objectCache = new WeakMap();
        }
        const objectNode = objectCache.get(arg);
        if (objectNode === undefined) {
          cacheNode = createCacheNode();
          objectCache.set(arg, cacheNode);
        } else {
          cacheNode = objectNode;
        }
      } else {
        let primitiveCache = cacheNode.p;
        if (primitiveCache === null) {
          cacheNode.p = primitiveCache = new Map();
        }
        const primitiveNode = primitiveCache.get(arg);
        if (primitiveNode === undefined) {
          cacheNode = createCacheNode();
          primitiveCache.set(arg, cacheNode);
        } else {
          cacheNode = primitiveNode;
        }
      }
    }
    const terminatedNode = cacheNode;
    let result;

    if (cacheNode.s === TERMINATED) {
      result = cacheNode.v;
    } else {
      result = func.apply(null, arguments);
      resultsCount++;

      if (resultEqualityCheck) {
        const lastResultValue = lastResult?.deref?.() ?? lastResult;
        if (lastResultValue != null && resultEqualityCheck(lastResultValue, result)) {
          result = lastResultValue;
          resultsCount !== 0 && resultsCount--;
        }
        const needsWeakRef = typeof result === "object" && result !== null || typeof result === "function";
        lastResult = needsWeakRef ? new Ref(result) : result;
      }
    }

    terminatedNode.s = TERMINATED;
    terminatedNode.v = result;
    return result;
  }

  memoized.clearCache = () => {
    fnNode = createCacheNode();
    memoized.resetResultsCount();
  };

  memoized.resultsCount = () => resultsCount;
  memoized.resetResultsCount = () => { resultsCount = 0; };

  return memoized;
}

// Create selector creator
function createSelectorCreator(memoizeOrOptions, ...memoizeOptionsFromArgs) {
  const createSelectorCreatorOptions = typeof memoizeOrOptions === "function" ? {
    memoize: memoizeOrOptions,
    memoizeOptions: memoizeOptionsFromArgs
  } : memoizeOrOptions;

  const createSelectorFunction = (...args) => {
    let recomputations = 0;
    let dependencyRecomputations = 0;
    let lastResult;
    let directlyPassedOptions = {};
    let resultFunc = args.pop();

    if (typeof resultFunc === "object") {
      directlyPassedOptions = resultFunc;
      resultFunc = args.pop();
    }

    assertIsFunction(resultFunc, `createSelector expects an output function after inputs, received: [${typeof resultFunc}]`);

    const combinedOptions = { ...createSelectorCreatorOptions, ...directlyPassedOptions };
    const { memoize, memoizeOptions = [], argsMemoize = weakMapMemoize, argsMemoizeOptions = [] } = combinedOptions;
    const finalMemoizeOptions = ensureIsArray(memoizeOptions);
    const finalArgsMemoizeOptions = ensureIsArray(argsMemoizeOptions);
    const dependencies = getDependencies(args);
    const memoizedResultFunc = memoize((...arguments) => {
      recomputations++;
      return resultFunc.apply(null, arguments);
    }, ...finalMemoizeOptions);

    let firstRun = true;

    const selector = argsMemoize(function dependenciesChecker() {
      dependencyRecomputations++;
      const inputSelectorResults = collectInputSelectorResults(dependencies, arguments);
      lastResult = memoizedResultFunc.apply(null, inputSelectorResults);

      if (process.env.NODE_ENV !== "production") {
        const { identityFunctionCheck, inputStabilityCheck } = getDevModeChecksExecutionInfo(firstRun, combinedOptions.devModeChecks);
        
        if (identityFunctionCheck.shouldRun) {
          identityFunctionCheck.run(resultFunc, inputSelectorResults, lastResult);
        }
        
        if (inputStabilityCheck.shouldRun) {
          const inputSelectorResultsCopy = collectInputSelectorResults(dependencies, arguments);
          inputStabilityCheck.run({ inputSelectorResults, inputSelectorResultsCopy }, { memoize, memoizeOptions: finalMemoizeOptions }, arguments);
        }

        if (firstRun) firstRun = false;
      }

      return lastResult;
    }, ...finalArgsMemoizeOptions);

    return Object.assign(selector, {
      resultFunc,
      memoizedResultFunc,
      dependencies,
      dependencyRecomputations: () => dependencyRecomputations,
      resetDependencyRecomputations: () => { dependencyRecomputations = 0; },
      lastResult: () => lastResult,
      recomputations: () => recomputations,
      resetRecomputations: () => { recomputations = 0; },
      memoize,
      argsMemoize
    });
  };
  
  Object.assign(createSelectorFunction, { withTypes: () => createSelectorFunction });
  return createSelectorFunction;
}

const createSelector = createSelectorCreator(weakMapMemoize);

// Create structured selector
const createStructuredSelector = Object.assign(
  (inputSelectors, selectorCreator = createSelector) => {
    assertIsObject(inputSelectors, `createStructuredSelector expects the first argument to be an object where each property is a selector.`);
    const keys = Object.keys(inputSelectors);
    const dependencies = keys.map(key => inputSelectors[key]);

    const structuredSelector = selectorCreator(
      dependencies,
      (...results) => results.reduce((acc, res, index) => {
        acc[keys[index]] = res;
        return acc;
      }, {})
    );

    return structuredSelector;
  },
  { withTypes: () => createStructuredSelector }
);

// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createSelector,
  createSelectorCreator,
  createStructuredSelector,
  lruMemoize,
  referenceEqualityCheck,
  setGlobalDevModeChecks,
  unstable_autotrackMemoize,
  weakMapMemoize
});
