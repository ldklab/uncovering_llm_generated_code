'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const _interopDefault = (ex) => (ex && typeof ex === 'object' && 'default' in ex) ? ex['default'] : ex;
const $$observable = _interopDefault(require('symbol-observable'));

const randomString = () => Math.random().toString(36).substring(7).split('').join('.');

const ActionTypes = {
  INIT: `@@redux/INIT${randomString()}`,
  REPLACE: `@@redux/REPLACE${randomString()}`,
  PROBE_UNKNOWN_ACTION: () => `@@redux/PROBE_UNKNOWN_ACTION${randomString()}`
};

function isPlainObject(obj) {
  if (typeof obj !== 'object' || obj === null) return false;
  let proto = obj;
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }
  return Object.getPrototypeOf(obj) === proto;
}

function createStore(reducer, preloadedState, enhancer) {
  if ((typeof preloadedState === 'function' && typeof enhancer === 'function') ||
      (typeof enhancer === 'function' && typeof arguments[3] === 'function')) {
    throw new Error('Multiple store enhancers specified. Use compose() to combine them.');
  }

  if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
    enhancer = preloadedState;
    preloadedState = undefined;
  }

  if (typeof enhancer !== 'undefined' && typeof enhancer !== 'function') {
    throw new Error('Enhancer should be a function.');
  }

  if (enhancer) {
    return enhancer(createStore)(reducer, preloadedState);
  }

  if (typeof reducer !== 'function') {
    throw new Error('The reducer should be a function.');
  }

  let currentReducer = reducer;
  let currentState = preloadedState;
  let currentListeners = [];
  let nextListeners = currentListeners;
  let isDispatching = false;

  function ensureCanMutateNextListeners() {
    if (nextListeners === currentListeners) {
      nextListeners = currentListeners.slice();
    }
  }

  function getState() {
    if (isDispatching) {
      throw new Error('Cannot call store.getState() during reducer execution.');
    }
    return currentState;
  }

  function subscribe(listener) {
    if (typeof listener !== 'function') {
      throw new Error('Listener should be a function.');
    }
    if (isDispatching) {
      throw new Error('Cannot subscribe while reducer is executing.');
    }

    let isSubscribed = true;
    ensureCanMutateNextListeners();
    nextListeners.push(listener);

    return function unsubscribe() {
      if (!isSubscribed) return;
      if (isDispatching) {
        throw new Error('Cannot unsubscribe while reducer is executing.');
      }
      isSubscribed = false;
      ensureCanMutateNextListeners();
      const index = nextListeners.indexOf(listener);
      nextListeners.splice(index, 1);
    };
  }

  function dispatch(action) {
    if (!isPlainObject(action)) {
      throw new Error('Actions must be plain objects.');
    }
    if (typeof action.type === 'undefined') {
      throw new Error('Actions must have a defined "type" property.');
    }
    if (isDispatching) {
      throw new Error('Reducers may not dispatch actions.');
    }

    try {
      isDispatching = true;
      currentState = currentReducer(currentState, action);
    } finally {
      isDispatching = false;
    }

    const listeners = currentListeners = nextListeners;
    for (let listener of listeners) {
      listener();
    }
    return action;
  }

  function replaceReducer(nextReducer) {
    if (typeof nextReducer !== 'function') {
      throw new Error('The nextReducer should be a function.');
    }
    currentReducer = nextReducer;
    dispatch({ type: ActionTypes.REPLACE });
  }

  function observable() {
    const outerSubscribe = subscribe;
    return {
      subscribe: (observer) => {
        if (typeof observer !== 'object' || observer === null) {
          throw new TypeError('Observer should be an object.');
        }
        const observeState = () => observer.next && observer.next(getState());
        observeState();
        const unsubscribe = outerSubscribe(observeState);
        return { unsubscribe };
      },
      [$$observable]: function () { return this; }
    };
  }

  dispatch({ type: ActionTypes.INIT });

  return {
    dispatch,
    subscribe,
    getState,
    replaceReducer,
    [$$observable]: observable
  };
}

function warning(message) {
  if (typeof console !== 'undefined' && typeof console.error === 'function') {
    console.error(message);
  }
  try {
    throw new Error(message);
  } catch (e) {}
}

function getUndefinedStateErrorMessage(key, action) {
  const actionType = action && action.type;
  const actionDescription = actionType ? `action "${actionType}"` : 'an action';
  return `Given ${actionDescription}, reducer "${key}" returned undefined. Return previous state if action should be ignored. Use null instead of undefined for no value.`;
}

function getUnexpectedStateShapeWarningMessage(inputState, reducers, action, unexpectedKeyCache) {
  const reducerKeys = Object.keys(reducers);
  const argumentName = action && action.type === ActionTypes.INIT ? 'preloadedState argument' : 'previous state';

  if (reducerKeys.length === 0) {
    return 'Store has no valid reducer. Pass an object of reducers to combineReducers.';
  }

  if (!isPlainObject(inputState)) {
    return `The ${argumentName} has unexpected type. Expected an object with following keys: "${reducerKeys.join('", "')}".`;
  }

  const unexpectedKeys = Object.keys(inputState).filter(key => !reducers.hasOwnProperty(key) && !unexpectedKeyCache[key]);
  unexpectedKeys.forEach(key => unexpectedKeyCache[key] = true);

  if (action && action.type === ActionTypes.REPLACE) return;

  if (unexpectedKeys.length > 0) {
    return `Unexpected ${unexpectedKeys.length > 1 ? 'keys' : 'key'} "${unexpectedKeys.join('", "')}" found in ${argumentName}. Expected one of known reducer keys: "${reducerKeys.join('", "')}".`;
  }
}

function assertReducerShape(reducers) {
  Object.keys(reducers).forEach((key) => {
    const reducer = reducers[key];
    const initialState = reducer(undefined, { type: ActionTypes.INIT });

    if (typeof initialState === 'undefined') {
      throw new Error(`Reducer "${key}" returned undefined during initialization. Explicitly return the initial state.`);
    }

    if (typeof reducer(undefined, { type: ActionTypes.PROBE_UNKNOWN_ACTION() }) === 'undefined') {
      throw new Error(`Reducer "${key}" returned undefined with random type. Return current state for unknown actions.`);
    }
  });
}

function combineReducers(reducers) {
  const reducerKeys = Object.keys(reducers);
  const finalReducers = {};

  for (let key of reducerKeys) {
    if (process.env.NODE_ENV !== 'production' && typeof reducers[key] === 'undefined') {
      warning(`No reducer provided for key "${key}"`);
    }
    if (typeof reducers[key] === 'function') {
      finalReducers[key] = reducers[key];
    }
  }

  const finalReducerKeys = Object.keys(finalReducers);
  let unexpectedKeyCache;
  if (process.env.NODE_ENV !== 'production') {
    unexpectedKeyCache = {};
  }
  let shapeAssertionError;
  try {
    assertReducerShape(finalReducers);
  } catch (e) {
    shapeAssertionError = e;
  }

  return function combination(state = {}, action) {
    if (shapeAssertionError) throw shapeAssertionError;

    if (process.env.NODE_ENV !== 'production') {
      const warningMessage = getUnexpectedStateShapeWarningMessage(state, finalReducers, action, unexpectedKeyCache);
      if (warningMessage) warning(warningMessage);
    }

    let hasChanged = false;
    const nextState = {};

    for (let key of finalReducerKeys) {
      const reducer = finalReducers[key];
      const previousStateForKey = state[key];
      const nextStateForKey = reducer(previousStateForKey, action);

      if (typeof nextStateForKey === 'undefined') {
        throw new Error(getUndefinedStateErrorMessage(key, action));
      }

      nextState[key] = nextStateForKey;
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
    }

    hasChanged = hasChanged || finalReducerKeys.length !== Object.keys(state).length;
    return hasChanged ? nextState : state;
  };
}

function bindActionCreator(actionCreator, dispatch) {
  return function() {
    return dispatch(actionCreator.apply(this, arguments));
  };
}

function bindActionCreators(actionCreators, dispatch) {
  if (typeof actionCreators === 'function') {
    return bindActionCreator(actionCreators, dispatch);
  }

  if (typeof actionCreators !== 'object' || actionCreators === null) {
    throw new Error(`Expected an object or a function, got ${actionCreators === null ? 'null' : typeof actionCreators}.`);
  }

  const boundActionCreators = {};
  for (let key in actionCreators) {
    const actionCreator = actionCreators[key];
    if (typeof actionCreator === 'function') {
      boundActionCreators[key] = bindActionCreator(actionCreator, dispatch);
    }
  }

  return boundActionCreators;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}

function ownKeys(object, enumerableOnly) {
  const keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    keys.push(...Object.getOwnPropertySymbols(object));
  }
  if (enumerableOnly) keys.filter(sym => Object.getOwnPropertyDescriptor(object, sym).enumerable);
  return keys;
}

function _objectSpread2(target, ...sources) {
  sources.forEach(source => {
    if (source != null) {
      ownKeys(source, true).forEach(key => {
        _defineProperty(target, key, source[key]);
      });
    }
  });
  return target;
}

function compose(...funcs) {
  if (funcs.length === 0) {
    return arg => arg;
  }
  if (funcs.length === 1) {
    return funcs[0];
  }
  return funcs.reduce((a, b) => (...args) => a(b(...args)));
}

function applyMiddleware(...middlewares) {
  return createStore => (...args) => {
    const store = createStore(...args);
    let _dispatch = () => {
      throw new Error('Dispatching while constructing middleware is not allowed.');
    };

    const middlewareAPI = {
      getState: store.getState,
      dispatch: (...args) => _dispatch(...args)
    };
    const chain = middlewares.map(middleware => middleware(middlewareAPI));
    _dispatch = compose(...chain)(store.dispatch);

    return _objectSpread2({}, store, { dispatch: _dispatch });
  };
}

function isCrushed() {}

if (process.env.NODE_ENV !== 'production' &&
    typeof isCrushed.name === 'string' &&
    isCrushed.name !== 'isCrushed') {
  warning('Using minified code in development mode.');
}

exports.__DO_NOT_USE__ActionTypes = ActionTypes;
exports.applyMiddleware = applyMiddleware;
exports.bindActionCreators = bindActionCreators;
exports.combineReducers = combineReducers;
exports.compose = compose;
exports.createStore = createStore;
