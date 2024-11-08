'use strict';

exports.__esModule = true;
exports.defaultMemoize = defaultMemoize;
exports.createSelectorCreator = createSelectorCreator;
exports.createStructuredSelector = createStructuredSelector;

function defaultEqualityCheck(a, b) {
  return a === b;
}

function areArgumentsShallowlyEqual(equalityCheck, prev, next) {
  if (prev === null || next === null || prev.length !== next.length) {
    return false;
  }

  for (let i = 0; i < prev.length; i++) {
    if (!equalityCheck(prev[i], next[i])) {
      return false;
    }
  }

  return true;
}

function defaultMemoize(func, equalityCheck = defaultEqualityCheck) {
  let lastArgs = null;
  let lastResult = null;

  return function (...args) {
    if (!areArgumentsShallowlyEqual(equalityCheck, lastArgs, args)) {
      lastResult = func(...args);
    }

    lastArgs = args;
    return lastResult;
  };
}

function getDependencies(funcs) {
  const dependencies = Array.isArray(funcs[0]) ? funcs[0] : funcs;

  if (!dependencies.every(dep => typeof dep === 'function')) {
    const dependencyTypes = dependencies.map(dep => typeof dep).join(', ');
    throw new Error(`Selector creators expect all input-selectors to be functions, instead received: [${dependencyTypes}]`);
  }

  return dependencies;
}

function createSelectorCreator(memoize, ...memoizeOptions) {
  return function (...funcs) {
    let recomputations = 0;
    const resultFunc = funcs.pop();
    const dependencies = getDependencies(funcs);
    const memoizedResultFunc = memoize((...args) => {
      recomputations++;
      return resultFunc(...args);
    }, ...memoizeOptions);

    const selector = memoize(function (...args) {
      const params = dependencies.map(dep => dep(...args));
      return memoizedResultFunc(...params);
    });

    selector.resultFunc = resultFunc;
    selector.dependencies = dependencies;
    selector.recomputations = () => recomputations;
    selector.resetRecomputations = () => recomputations = 0;
    return selector;
  };
}

const createSelector = exports.createSelector = createSelectorCreator(defaultMemoize);

function createStructuredSelector(selectors, selectorCreator = createSelector) {
  if (typeof selectors !== 'object') {
    throw new Error(`createStructuredSelector expects first argument to be an object where each property is a selector, received: ${typeof selectors}`);
  }
  const objectKeys = Object.keys(selectors);
  
  return selectorCreator(
    objectKeys.map(key => selectors[key]),
    (...values) => values.reduce((composition, value, index) => {
      composition[objectKeys[index]] = value;
      return composition;
    }, {})
  );
}
