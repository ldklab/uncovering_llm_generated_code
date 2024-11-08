"use strict";

// Utility functions for exporting module properties
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;

var __export = (target, all) => {
  for (var name in all) {
    __defProp(target, name, { get: all[name], enumerable: true });
  }
};

var __copyProps = (to, from, except, desc) => {
  if (from && (typeof from === "object" || typeof from === "function")) {
    for (let key of __getOwnPropNames(from)) {
      if (!__hasOwnProp.call(to, key) && key !== except) {
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
    }
  }
  return to;
};

var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// Exported functions defined in various source files
var src_exports = {};
__export(src_exports, {
  createSelector: () => createSelector,
  createSelectorCreator: () => createSelectorCreator,
  createStructuredSelector: () => createStructuredSelector,
  lruMemoize: () => lruMemoize,
  referenceEqualityCheck: () => referenceEqualityCheck,
  setGlobalDevModeChecks: () => setGlobalDevModeChecks,
  unstable_autotrackMemoize: () => autotrackMemoize,
  weakMapMemoize: () => weakMapMemoize
});
module.exports = __toCommonJS(src_exports);

// Dev mode check functions ensuring proper selector operation
var runIdentityFunctionCheck = (resultFunc, inputSelectorsResults, outputSelectorResult) => {
  if (inputSelectorsResults.length === 1 && inputSelectorsResults[0] === outputSelectorResult) {
    let isInputSameAsOutput = false;
    try {
      const emptyObject = {};
      if (resultFunc(emptyObject) === emptyObject) isInputSameAsOutput = true;
    } catch (e) {}

    if (isInputSameAsOutput) {
      let stack;
      try {
        throw new Error();
      } catch (e) {
        ({ stack } = e);
      }
      console.warn(
        "The result function returned its own inputs without modification...",
        { stack }
      );
    }
  }
};

var runInputStabilityCheck = (inputSelectorResultsObject, options, inputSelectorArgs) => {
  const { memoize, memoizeOptions } = options;
  const { inputSelectorResults, inputSelectorResultsCopy } = inputSelectorResultsObject;
  const createAnEmptyObject = memoize(() => ({}), ...memoizeOptions);
  const areInputSelectorResultsEqual = createAnEmptyObject.apply(null, inputSelectorResults) === createAnEmptyObject.apply(null, inputSelectorResultsCopy);

  if (!areInputSelectorResultsEqual) {
    let stack;
    try {
      throw new Error();
    } catch (e) {
      ({ stack } = e);
    }
    console.warn(
      "An input selector returned a different result when passed same arguments...",
      {
        arguments: inputSelectorArgs,
        firstInputs: inputSelectorResults,
        secondInputs: inputSelectorResultsCopy,
        stack
      }
    );
  }
};

// Global dev mode settings for debugging selectors
var globalDevModeChecks = {
  inputStabilityCheck: "once",
  identityFunctionCheck: "once"
};

var setGlobalDevModeChecks = (devModeChecks) => {
  Object.assign(globalDevModeChecks, devModeChecks);
};

// Utility functions for validating input types in selectors
var NOT_FOUND = Symbol("NOT_FOUND");

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
    const itemTypes = array.map(
      (item) => typeof item === "function" ? `function ${item.name || "unnamed"}()` : typeof item
    ).join(", ");
    throw new TypeError(`${errorMessage}[${itemTypes}]`);
  }
}

var ensureIsArray = (item) => Array.isArray(item) ? item : [item];

function getDependencies(createSelectorArgs) {
  const dependencies = Array.isArray(createSelectorArgs[0]) ? createSelectorArgs[0] : createSelectorArgs;
  assertIsArrayOfFunctions(
    dependencies,
    `createSelector expects all input-selectors to be functions, but received the following types: `
  );
  return dependencies;
}

function collectInputSelectorResults(dependencies, inputSelectorArgs) {
  return dependencies.map(dep => dep.apply(null, inputSelectorArgs));
}

var getDevModeChecksExecutionInfo = (firstRun, devModeChecks) => {
  const { identityFunctionCheck, inputStabilityCheck } = {
    ...globalDevModeChecks,
    ...devModeChecks
  };
  return {
    identityFunctionCheck: {
      shouldRun: identityFunctionCheck === "always" || identityFunctionCheck === "once" && firstRun,
      run: runIdentityFunctionCheck
    },
    inputStabilityCheck: {
      shouldRun: inputStabilityCheck === "always" || inputStabilityCheck === "once" && firstRun,
      run: runInputStabilityCheck
    }
  };
};

// Cell and Cache classes for autotrackMemoize implementation
var $REVISION = 0;
var CURRENT_TRACKER = null;

class Cell {
  constructor(initialValue, isEqual = tripleEq) {
    this.revision = $REVISION;
    this._value = this._lastValue = initialValue;
    this._isEqual = isEqual;
  }

  get value() {
    CURRENT_TRACKER?.add(this);
    return this._value;
  }

  set value(newValue) {
    if (this.value !== newValue) {
      this._value = newValue;
      this.revision = ++$REVISION;
    }
  }
}

function tripleEq(a, b) {
  return a === b;
}

class TrackingCache {
  constructor(fn) {
    this.fn = fn;
    this._cachedValue = undefined;
    this._cachedRevision = -1;
    this._deps = [];
    this.hits = 0;
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
    throw new TypeError(
      "setValue must be passed a tracked store created with `createStorage`."
    );
  }
  storage.value = storage._lastValue = value;
}

function createCell(initialValue, isEqual = tripleEq) {
  return new Cell(initialValue, isEqual);
}

function createCache(fn) {
  assertIsFunction(
    fn,
    "the first parameter to `createCache` must be a function"
  );
  return new TrackingCache(fn);
}

// Object and Array Proxy Nodes with autotracking for nested structures
var neverEq = (a, b) => false;

function createTag() {
  return createCell(null, neverEq);
}

function dirtyTag(tag, value) {
  setValue(tag, value);
}

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

var objectProxyHandler = {
  get(node, key) {
    function calculateResult() {
      const { value } = node;
      const childValue = Reflect.get(value, key);
      if (typeof key === "symbol") return childValue;
      if (key in proto) return childValue;
      if (typeof childValue === "object" && childValue !== null) {
        let childNode = node.children[key];
        if (childNode === undefined) {
          childNode = node.children[key] = createNode(childValue);
        }
        if (childNode.tag) {
          getValue(childNode.tag);
        }
        return childNode.proxy;
      } else {
        let tag = node.tags[key];
        if (tag === undefined) {
          tag = node.tags[key] = createTag();
          tag.value = childValue;
        }
        getValue(tag);
        return childValue;
      }
    }
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

var arrayProxyHandler = {
  get([node], key) {
    if (key === "length") {
      consumeCollection(node);
    }
    return objectProxyHandler.get(node, key);
  },
  ownKeys([node]) {
    return objectProxyHandler.ownKeys(node);
  },
  getOwnPropertyDescriptor([node], prop) {
    return objectProxyHandler.getOwnPropertyDescriptor(node, prop);
  },
  has([node], prop) {
    return objectProxyHandler.has(node, prop);
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
      if (anyKeysAdded || oldKeysSize !== newKeysSize) {
        dirtyCollection(node);
      }
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
    if (childValue !== newChildValue) {
      if (typeof newChildValue === "object" && newChildValue !== null) {
        updateNode(childNode, newChildValue);
      } else {
        deleteNode(childNode);
        delete children[key];
      }
    }
  }
}

function deleteNode(node) {
  if (node.tag) dirtyTag(node.tag, null);
  dirtyCollection(node);
  for (const key in node.tags) dirtyTag(node.tags[key], null);
  for (const key in node.children) deleteNode(node.children[key]);
}

// LRU cache creation functions for memoizing selector functions
function createSingletonCache(equals) {
  let entry;
  return {
    get(key) {
      if (entry && equals(entry.key, key)) {
        return entry.value;
      }
      return NOT_FOUND;
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
      const cacheIndex = entries.findIndex(entry => equals(key, entry.key));
      if (cacheIndex > -1) {
        const entry = entries[cacheIndex];
        if (cacheIndex > 0) {
          entries.splice(cacheIndex, 1);
          entries.unshift(entry);
        }
        return entry.value;
      }
      return NOT_FOUND;
    },
    put(key, value) {
      if (this.get(key) === NOT_FOUND) {
        entries.unshift({ key, value });
        if (entries.length > maxSize) {
          entries.pop();
        }
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

// Memoization strategy helpers
var referenceEqualityCheck = (a, b) => a === b;

function createCacheKeyComparator(equalityCheck) {
  return function areArgumentsShallowlyEqual(prev, next) {
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

function lruMemoize(func, equalityCheckOrOptions) {
  const providedOptions = typeof equalityCheckOrOptions === "object" ? equalityCheckOrOptions : { equalityCheck: equalityCheckOrOptions };
  const { equalityCheck = referenceEqualityCheck, maxSize = 1, resultEqualityCheck } = providedOptions;
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
        const matchingEntry = entries.find(entry => resultEqualityCheck(entry.value, value));
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
  memoized.resetResultsCount = () => {
    resultsCount = 0;
  };

  return memoized;
}

// Autotrack Memoization function for dynamic memoization
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

  memoized.clearCache = () => cache.clear();
  return memoized;
}

// Cache node and memoization wrapper leveraging WeakMap and StrongRef
class StrongRef {
  constructor(value) {
    this.value = value;
  }
  deref() {
    return this.value;
  }
}
var Ref = typeof WeakRef !== "undefined" ? WeakRef : StrongRef;

var UNTERMINATED = 0;
var TERMINATED = 1;

function createCacheNode() {
  return {
    s: UNTERMINATED,
    v: undefined,
    o: null,
    p: null
  };
}

function weakMapMemoize(func, options = {}) {
  let fnNode = createCacheNode();
  const { resultEqualityCheck } = options;
  let lastResult;
  let resultsCount = 0;

  function memoized() {
    let cacheNode = fnNode;
    const { length } = arguments;
    for (let i = 0; i < length; i++) {
      const arg = arguments[i];
      if (typeof arg === "function" || typeof arg === "object" && arg !== null) {
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
  memoized.resetResultsCount = () => {
    resultsCount = 0;
  };

  return memoized;
}

// Selector creation functions leveraging memoization
function createSelectorCreator(memoizeOrOptions, ...memoizeOptionsFromArgs) {
  const options = typeof memoizeOrOptions === "function" ? {
    memoize: memoizeOrOptions,
    memoizeOptions: memoizeOptionsFromArgs
  } : memoizeOrOptions;

  return function createSelector(...args) {
    let recomputations = 0;
    let dependencyRecomputations = 0;
    let lastResult;

    let resultFunc = args.pop();
    if (typeof resultFunc === "object" && resultFunc !== null) {
      const directlyPassedOptions = resultFunc;
      resultFunc = args.pop();
      Object.assign(options, directlyPassedOptions);
    }

    assertIsFunction(
      resultFunc,
      `createSelector expects an output function after the inputs, but received: [${typeof resultFunc}]`
    );

    const {
      memoize,
      memoizeOptions = [],
      argsMemoize = weakMapMemoize,
      argsMemoizeOptions = [],
      devModeChecks = {}
    } = options;

    const dependencies = getDependencies(args);
    const memoizedResultFunc = memoize(function recomputationWrapper() {
      recomputations++;
      return resultFunc.apply(null, arguments);
    }, ...memoizeOptions);

    let firstRun = true;

    const selector = argsMemoize(function dependenciesChecker() {
      dependencyRecomputations++;
      const inputSelectorResults = collectInputSelectorResults(
        dependencies,
        arguments
      );
      lastResult = memoizedResultFunc.apply(null, inputSelectorResults);

      if (process.env.NODE_ENV !== "production") {
        const { identityFunctionCheck, inputStabilityCheck } = getDevModeChecksExecutionInfo(firstRun, devModeChecks);
        if (identityFunctionCheck.shouldRun) {
          identityFunctionCheck.run(resultFunc, inputSelectorResults, lastResult);
        }
        if (inputStabilityCheck.shouldRun) {
          const inputSelectorResultsCopy = collectInputSelectorResults(dependencies, arguments);
          inputStabilityCheck.run(
            { inputSelectorResults, inputSelectorResultsCopy },
            { memoize, memoizeOptions },
            arguments
          );
        }
        if (firstRun) firstRun = false;
      }
      return lastResult;
    }, ...argsMemoizeOptions);

    return Object.assign(selector, {
      resultFunc,
      memoizedResultFunc,
      dependencies,
      dependencyRecomputations: () => dependencyRecomputations,
      resetDependencyRecomputations: () => {
        dependencyRecomputations = 0;
      },
      lastResult: () => lastResult,
      recomputations: () => recomputations,
      resetRecomputations: () => {
        recomputations = 0;
      },
      memoize,
      argsMemoize
    });
  };
}

var createSelector = createSelectorCreator(weakMapMemoize);

// Structured selector creation with pre-configured selector options
var createStructuredSelector = Object.assign(
  (selectors, selectorCreator = createSelector) => {
    assertIsObject(
      selectors,
      `createStructuredSelector expects first argument to be an object where each property is a selector, instead received a ${typeof selectors}`
    );

    const inputSelectorKeys = Object.keys(selectors);
    const dependencies = inputSelectorKeys.map(key => selectors[key]);

    return selectorCreator(
      dependencies,
      (...results) => results.reduce((acc, value, index) => ({ ...acc, [inputSelectorKeys[index]]: value }), {})
    );
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
