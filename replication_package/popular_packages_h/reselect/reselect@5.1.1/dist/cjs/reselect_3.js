"use strict";

function wrapExports(target, all) {
  for (const name in all) {
    Object.defineProperty(target, name, { get: all[name], enumerable: true });
  }
}

function copyProperties(to, from, except) {
  if (from && (typeof from === "object" || typeof from === "function")) {
    for (const key of Object.getOwnPropertyNames(from)) {
      if (!Object.prototype.hasOwnProperty.call(to, key) && key !== except) {
        Object.defineProperty(to, key, { get: () => from[key], enumerable: !!Object.getOwnPropertyDescriptor(from, key)?.enumerable });
      }
    }
  }
  return to;
}

function toCommonJS(mod) {
  return copyProperties(Object.defineProperty({}, "__esModule", { value: true }), mod);
}

// Exports setup
const src_exports = {};

wrapExports(src_exports, {
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

// Function for checking if result function returns its inputs directly
function runIdentityFunctionCheck(resultFunc, inputSelectorsResults, outputSelectorResult) {
  if (inputSelectorsResults.length === 1 && inputSelectorsResults[0] === outputSelectorResult) {
    let isInputSameAsOutput = false;
    try {
      const emptyObject = {};
      if (resultFunc(emptyObject) === emptyObject) isInputSameAsOutput = true;
    } catch {}

    if (isInputSameAsOutput) {
      let stack;
      try {
        throw new Error();
      } catch (e) {
        stack = e.stack;
      }
      console.warn(
        "The result function returned its own inputs without modification. This could lead to inefficient memoization and unnecessary re-renders.",
        { stack }
      );
    }
  }
}

// Function for ensuring input selectors are stable
function runInputStabilityCheck(inputSelectorResultsObject, options, inputSelectorArgs) {
  const { memoize, memoizeOptions } = options;
  const { inputSelectorResults, inputSelectorResultsCopy } = inputSelectorResultsObject;
  const createAnEmptyObject = memoize(() => ({}), ...memoizeOptions);
  const areInputSelectorResultsEqual = createAnEmptyObject.apply(null, inputSelectorResults) === createAnEmptyObject.apply(null, inputSelectorResultsCopy);

  if (!areInputSelectorResultsEqual) {
    let stack;
    try {
      throw new Error();
    } catch (e) {
      stack = e.stack;
    }
    console.warn(
      "An input selector returned a different result when passed same arguments. This means your output selector will likely run more frequently than intended.",
      { arguments: inputSelectorArgs, firstInputs: inputSelectorResults, secondInputs: inputSelectorResultsCopy, stack }
    );
  }
}

// Global dev mode checks and updater
const globalDevModeChecks = { inputStabilityCheck: "once", identityFunctionCheck: "once" };

function setGlobalDevModeChecks(devModeChecks) {
  Object.assign(globalDevModeChecks, devModeChecks);
}

// Utility functions for asserting types and managing dependencies
const NOT_FOUND = Symbol("NOT_FOUND");

function assertIsFunction(func, errorMessage = `expected a function, instead received ${typeof func}`) {
  if (typeof func !== "function") {
    throw new TypeError(errorMessage);
  }
}

function assertIsObject(object, errorMessage = `expected an object, instead received ${typeof object}`) {
  if (typeof object !== "object") {
    throw new TypeError(errorMessage);
  }
}

function assertIsArrayOfFunctions(array, errorMessage = `expected all items to be functions, instead received the following types: `) {
  if (!array.every((item) => typeof item === "function")) {
    const itemTypes = array.map(item => typeof item === "function" ? `function ${item.name || "unnamed"}()` : typeof item).join(", ");
    throw new TypeError(`${errorMessage}[${itemTypes}]`);
  }
}

const ensureIsArray = (item) => Array.isArray(item) ? item : [item];

function getDependencies(createSelectorArgs) {
  const dependencies = Array.isArray(createSelectorArgs[0]) ? createSelectorArgs[0] : createSelectorArgs;
  assertIsArrayOfFunctions(dependencies, `createSelector expects all input-selectors to be functions, but received the following types: `);
  return dependencies;
}

function collectInputSelectorResults(dependencies, inputSelectorArgs) {
  return dependencies.map(dep => dep.apply(null, inputSelectorArgs));
}

function getDevModeChecksExecutionInfo(firstRun, devModeChecks) {
  const { identityFunctionCheck, inputStabilityCheck } = { ...globalDevModeChecks, ...devModeChecks };
  return {
    identityFunctionCheck: { shouldRun: identityFunctionCheck === "always" || (identityFunctionCheck === "once" && firstRun), run: runIdentityFunctionCheck },
    inputStabilityCheck: { shouldRun: inputStabilityCheck === "always" || (inputStabilityCheck === "once" && firstRun), run: runInputStabilityCheck }
  };
}

// Autotracking and memoization classes/functions
const $REVISION = 0;
let CURRENT_TRACKER = null;

class Cell {
  revision = $REVISION;
  _value;
  _lastValue;
  _isEqual = tripleEq;

  constructor(initialValue, isEqual = tripleEq) {
    this._value = this._lastValue = initialValue;
    this._isEqual = isEqual;
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

function tripleEq(a, b) {
  return a === b;
}

class TrackingCache {
  _cachedValue;
  _cachedRevision = -1;
  _deps = [];
  hits = 0;
  fn;

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
    return Math.max(...this._deps.map(d => d.revision), 0);
  }
}

function getValue(cell) {
  if (!(cell instanceof Cell)) {
    console.warn("Not a valid cell! ", cell);
  }
  return cell.value;
}

function setValue(storage, value) {
  if (!(storage instanceof Cell)) {
    throw new TypeError("setValue must be passed a tracked store created with `createStorage`.");
  }
  storage.value = storage._lastValue = value;
}

function createCell(initialValue, isEqual = tripleEq) {
  return new Cell(initialValue, isEqual);
}

function createCache(fn) {
  assertIsFunction(fn, "the first parameter to `createCache` must be a function");
  return new TrackingCache(fn);
}

// Proxy handling for array and objects
function createNode(value) {
  return Array.isArray(value) ? new ArrayTreeNode(value) : new ObjectTreeNode(value);
}

function updateNode(node, newValue) {
  const { value, tags, children } = node;
  node.value = newValue;
  if (Array.isArray(value) && Array.isArray(newValue) && value.length !== newValue.length) {
    dirtyCollection(node);
  } else {
    if (value !== newValue) {
      let oldKeysSize = 0;
      let newKeysSize = 0;
      let anyKeysAdded = false;
      for (const _key in value) oldKeysSize++;
      for (const key in newValue) {
        newKeysSize++;
        if (!(key in value)) {
          anyKeysAdded = true;
          break;
        }
      }
      if (anyKeysAdded || oldKeysSize !== newKeysSize) dirtyCollection(node);
    }
  }

  for (const key in tags) {
    const childValue = value[key];
    const newChildValue = newValue[key];
    if (childValue !== newChildValue) {
      dirtyCollection(node);
      dirtyTag(tags[key], newChildValue);
    }
    if (typeof newChildValue === "object" && newChildValue !== null) delete tags[key];
  }

  for (const key in children) {
    const childNode = children[key];
    const newChildValue = newValue[key];
    const childValue = childNode.value;
    if (childValue === newChildValue) continue;
    else if (typeof newChildValue === "object" && newChildValue !== null) {
      updateNode(childNode, newChildValue);
    } else {
      deleteNode(childNode);
      delete children[key];
    }
  }
}

function deleteNode(node) {
  if (node.tag) dirtyTag(node.tag, null);
  dirtyCollection(node);
  for (const key in node.tags) dirtyTag(node.tags[key], null);
  for (const key in node.children) deleteNode(node.children[key]);
}

class ObjectTreeNode {
  constructor(value) {
    this.value = value;
    this.tag = createTag();
    this.collectionTag = null;
    this.children = {};
    this.tags = {};
  }

  proxy = new Proxy(this, objectProxyHandler);
  id = nextId++;
}

const objectProxyHandler = {
  get(node, key) {
    const calculateResult = () => {
      const { value } = node;
      const childValue = Reflect.get(value, key);

      if (typeof key === "symbol") return childValue;
      if (key in Object.prototype) return childValue;

      if (typeof childValue === "object" && childValue !== null) {
        let childNode = node.children[key];
        if (!childNode) {
          childNode = node.children[key] = createNode(childValue);
        }
        if (childNode.tag) getValue(childNode.tag);
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

  getOwnPropertyDescriptor(node, prop) {
    return Reflect.getOwnPropertyDescriptor(node.value, prop);
  },

  has(node, prop) {
    return Reflect.has(node.value, prop);
  }
};

class ArrayTreeNode extends ObjectTreeNode {
  constructor(value) {
    super(value);
    this.proxy = new Proxy([this], arrayProxyHandler);
  }
}

const arrayProxyHandler = {
  get([node], key) {
    if (key === "length") consumeCollection(node);
    return objectProxyHandler.get(node, key);
  },
  ownKeys([node]) {
    return objectProxyHandler.ownKeys(node);
  },
  getOwnPropertyDescriptor([node], prop) {
    return objectProxyHandler.getOwnPropertyDescriptor(node, prop);
  },
  has([node], prop) {
    return objectProxyHandler.has([node], prop);
  }
};

// LRU Memoization strategies
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
  return {
    get(key) {
      const index = entries.findIndex(entry => equals(key, entry.key));
      if (index > -1) {
        const entry = entries[index];
        if (index > 0) {
          entries.splice(index, 1);
          entries.unshift(entry);
        }
        return entry.value;
      }
      return NOT_FOUND;
    },
    put(key, value) {
      if (this.get(key) === NOT_FOUND) {
        entries.unshift({ key, value });
        if (entries.length > maxSize) entries.pop();
      }
    },
    getEntries() {
      return entries;
    },
    clear() {
      entries = [];
    }
  };
}

const referenceEqualityCheck = (a, b) => a === b;

function createCacheKeyComparator(equalityCheck) {
  return (prev, next) => {
    if (prev === null || next === null || prev.length !== next.length) return false;
    for (let i = 0; i < prev.length; i++) {
      if (!equalityCheck(prev[i], next[i])) return false;
    }
    return true;
  };
}

function lruMemoize(func, equalityCheckOrOptions) {
  const options = typeof equalityCheckOrOptions === "object" ? equalityCheckOrOptions : { equalityCheck: equalityCheckOrOptions };
  const { equalityCheck = referenceEqualityCheck, maxSize = 1, resultEqualityCheck } = options;
  const comparator = createCacheKeyComparator(equalityCheck);
  const cache = maxSize <= 1 ? createSingletonCache(comparator) : createLruCache(maxSize, comparator);

  let resultsCount = 0;

  const memoized = function() {
    let value = cache.get(arguments);
    if (value === NOT_FOUND) {
      value = func(...arguments);
      resultsCount++;
      if (resultEqualityCheck) {
        const entries = cache.getEntries();
        const matchingEntry = entries.find(entry => resultEqualityCheck(entry.value, value));
        if (matchingEntry) {
          value = matchingEntry.value;
          resultsCount--;
        }
      }
      cache.put(arguments, value);
    }
    return value;
  };

  memoized.clearCache = () => {
    cache.clear();
    memoized.resetResultsCount();
  };

  memoized.resultsCount = () => resultsCount;

  memoized.resetResultsCount = () => {
    resultsCount = 0;
  };

  return memoized;
}

// Autotrack Memoization Strategy
function autotrackMemoize(func) {
  const node = createNode([]);
  let lastArgs = null;
  const shallowEqual = createCacheKeyComparator(referenceEqualityCheck);
  
  const cache = createCache(() => func(...node.proxy));
  
  const memoized = function() {
    if (!shallowEqual(lastArgs, arguments)) {
      updateNode(node, arguments);
      lastArgs = arguments;
    }
    return cache.value;
  };
  
  memoized.clearCache = () => cache.clear();

  return memoized;
}

// WeakMap-based Memoization Strategy
function weakMapMemoize(func, options = {}) {
  let fnNode = createCacheNode();
  const { resultEqualityCheck } = options;
  let lastResult;
  let resultsCount = 0;

  const memoized = function() {
    let cacheNode = fnNode;
    const { length } = arguments;

    for (let i = 0; i < length; i++) {
      const arg = arguments[i];
      if (typeof arg === "function" || (typeof arg === "object" && arg !== null)) {
        const objectCache = cacheNode.o || (cacheNode.o = new WeakMap());
        let objectNode = objectCache.get(arg);
        if (!objectNode) {
          cacheNode = createCacheNode();
          objectCache.set(arg, cacheNode);
        } else {
          cacheNode = objectNode;
        }
      } else {
        const primitiveCache = cacheNode.p || (cacheNode.p = new Map());
        let primitiveNode = primitiveCache.get(arg);
        if (!primitiveNode) {
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
      result = func(...arguments);
      resultsCount++;

      if (resultEqualityCheck) {
        const lastResultValue = lastResult?.deref?.() || lastResult;
          if (lastResultValue != null && resultEqualityCheck(lastResultValue, result)) {
          result = lastResultValue;
          resultsCount--;
        }
        lastResult = (typeof result === "object" && result !== null) || typeof result === "function" ? new Ref(result) : result;
      }
    }
  
    terminatedNode.s = TERMINATED;
    terminatedNode.v = result;

    return result;
  };

  memoized.clearCache = () => {
    fnNode = createCacheNode();
    memoized.resetResultsCount();
  };

  memoized.resultsCount = () => resultsCount;

  memoized.resetResultsCount = () => {
    resultsCount = 0;
  };

  return memoized;
}

// Factory for creating selectors with custom memoization strategies
function createSelectorCreator(memoizeOrOptions, ...memoizeOptionsFromArgs) {
  const options = typeof memoizeOrOptions === "function" ? { memoize: memoizeOrOptions, memoizeOptions: memoizeOptionsFromArgs } : memoizeOrOptions;

  const createSelector = (...args) => {
    let recomputations = 0;
    let dependencyRecomputations = 0;
    let lastResult;
    let directlyPassedOptions = {};
    let resultFunc = args.pop();

    if (typeof resultFunc === "object") {
      directlyPassedOptions = resultFunc;
      resultFunc = args.pop();
    }

    assertIsFunction(resultFunc, `createSelector expects an output function after the inputs, but received: [${typeof resultFunc}]`);

    const combinedOptions = { ...options, ...directlyPassedOptions };
    const { memoize, memoizeOptions = [], argsMemoize = weakMapMemoize, argsMemoizeOptions = [], devModeChecks = {} } = combinedOptions;

    const finalMemoizeOptions = ensureIsArray(memoizeOptions);
    const finalArgsMemoizeOptions = ensureIsArray(argsMemoizeOptions);

    const dependencies = getDependencies(args);

    const memoizedResultFunc = memoize(function recomputationWrapper() {
      recomputations++;
      return resultFunc.apply(null, arguments);
    }, ...finalMemoizeOptions);

    let firstRun = true;
    
    const selector = argsMemoize(function dependenciesChecker() {
      dependencyRecomputations++;
      const inputSelectorResults = collectInputSelectorResults(dependencies, arguments);
      lastResult = memoizedResultFunc(...inputSelectorResults);
      
      if (process.env.NODE_ENV !== "production") {
        const { identityFunctionCheck, inputStabilityCheck } = getDevModeChecksExecutionInfo(firstRun, devModeChecks);
        
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
      resetDependencyRecomputations: () => dependencyRecomputations = 0,
      lastResult: () => lastResult,
      recomputations: () => recomputations,
      resetRecomputations: () => recomputations = 0,
      memoize,
      argsMemoize
    });
  };

  return Object.assign(createSelector, { withTypes: () => createSelector });
}

// Standard createSelector using weakMapMemoize
const createSelector = createSelectorCreator(weakMapMemoize);

// Building a structured selector that combines multiple selectors into an object
const createStructuredSelector = Object.assign((inputSelectorsObject, selectorCreator = createSelector) => {
  assertIsObject(inputSelectorsObject, `createStructuredSelector expects first argument to be an object where each property is a selector, received: ${typeof inputSelectorsObject}`);
  
  const keys = Object.keys(inputSelectorsObject);
  const dependencies = keys.map(key => inputSelectorsObject[key]);
  
  const structuredSelector = selectorCreator(dependencies, (...results) => 
    results.reduce((acc, res, idx) => {
      acc[keys[idx]] = res;
      return acc;
    }, {}));

  return structuredSelector;
}, { withTypes: () => createStructuredSelector });
