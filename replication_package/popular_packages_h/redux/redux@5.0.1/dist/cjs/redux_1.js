"use strict";

// Utility functions to streamline exports and property definitions
const defineProperty = Object.defineProperty;
const getPropertyDescriptor = Object.getOwnPropertyDescriptor;
const getPropertyNames = Object.getOwnPropertyNames;
const hasProperty = Object.prototype.hasOwnProperty;

// Helper function to export all properties
const exportAll = (target, source) => {
  for (const key in source) {
    defineProperty(target, key, { get: source[key], enumerable: true });
  }
};

// Helper to copy properties from one object to another
const copyProps = (target, source, except, descriptor) => {
  if (source && (typeof source === "object" || typeof source === "function")) {
    for (const key of getPropertyNames(source)) {
      if (!hasProperty.call(target, key) && key !== except) {
        defineProperty(target, key, {
          get: () => source[key],
          enumerable: !descriptor || getPropertyDescriptor(source, key).enumerable
        });
      }
    }
  }
  return target;
};

// Converts module exports to CommonJS format
const toCommonJS = (module) => {
  return copyProps(defineProperty({}, "__esModule", { value: true }), module);
};

// Main exports object
let exports = {};
exportAll(exports, {
  __DO_NOT_USE__ActionTypes: () => ActionTypes,
  applyMiddleware,
  bindActionCreators,
  combineReducers,
  compose,
  createStore,
  isAction,
  isPlainObject,
  legacy_createStore
});
module.exports = toCommonJS(exports);

// Utility to format error messages for production
function formatProdErrorMessage(code) {
  return `Minified Redux error #${code}; visit https://redux.js.org/Errors?code=${code} for the full message or use the non-minified dev environment for full errors.`;
}

// Observable symbol handling
const observableSymbol = typeof Symbol === "function" ? Symbol.observable : "@@observable";

// Random string generator for action types
const randomString = () => Math.random().toString(36).substring(7).split("").join(".");

// Action types used by the library
const ActionTypes = {
  INIT: `@@redux/INIT${randomString()}`,
  REPLACE: `@@redux/REPLACE${randomString()}`,
  PROBE_UNKNOWN_ACTION: () => `@@redux/PROBE_UNKNOWN_ACTION${randomString()}`
};

// Utility to check if an object is a plain object
function isPlainObject(obj) {
  if (typeof obj !== "object" || obj === null) return false;
  let proto = obj;
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }
  return Object.getPrototypeOf(obj) === proto || Object.getPrototypeOf(obj) === null;
}

// Type check utilities for expanded type handling
function miniKindOf(value) {
  if (value === void 0) return "undefined";
  if (value === null) return "null";
  const typeOfValue = typeof value;
  switch (typeOfValue) {
    case "boolean":
    case "string":
    case "number":
    case "symbol":
    case "function":
      return typeOfValue;
  }
  if (Array.isArray(value)) return "array";
  if (isDate(value)) return "date";
  if (isError(value)) return "error";
  return { Symbol, Promise, WeakMap, WeakSet, Map, Set }[ctorName(value)] || Object.prototype.toString.call(value).slice(8, -1).toLowerCase().replace(/\s/g, "");
}

function ctorName(value) {
  return typeof value.constructor === "function" ? value.constructor.name : null;
}

function isError(value) {
  return value instanceof Error || (typeof value.message === "string" && value.constructor && typeof value.constructor.stackTraceLimit === "number");
}

function isDate(value) {
  return value instanceof Date || (typeof value.toDateString === "function" && typeof value.getDate === "function" && typeof value.setDate === "function");
}

function kindOf(value) {
  let typeOfValue = typeof value;
  if (process.env.NODE_ENV !== "production") {
    typeOfValue = miniKindOf(value);
  }
  return typeOfValue;
}

// Core function to create a Redux-like store
function createStore(reducer, preloadedState, enhancer) {
  if (typeof reducer !== "function") {
    throw new Error(process.env.NODE_ENV === "production" ? formatProdErrorMessage(2) : `Expected the root reducer to be a function. Instead, received: '${kindOf(reducer)}'`);
  }

  // Validations and setup for store enhancers
  if (typeof preloadedState === "function" && typeof enhancer === "function" || typeof enhancer === "function" && typeof arguments[3] === "function") {
    throw new Error(process.env.NODE_ENV === "production" ? formatProdErrorMessage(0) : "It looks like you are passing several store enhancers to createStore(). This is not supported. Instead, compose them together to a single function. See https://redux.js.org/tutorials/fundamentals/part-4-store#creating-a-store-with-enhancers for an example.");
  }

  if (typeof preloadedState === "function" && typeof enhancer === "undefined") {
    enhancer = preloadedState;
    preloadedState = undefined;
  }

  if (typeof enhancer !== "undefined") {
    if (typeof enhancer !== "function") {
      throw new Error(process.env.NODE_ENV === "production" ? formatProdErrorMessage(1) : `Expected the enhancer to be a function. Instead, received: '${kindOf(enhancer)}'`);
    }
    return enhancer(createStore)(reducer, preloadedState);
  }

  // Core store state and listener setup
  let currentReducer = reducer;
  let currentState = preloadedState;
  let currentListeners = new Map();
  let nextListeners = currentListeners;
  let listenerIdCounter = 0;
  let isDispatching = false;

  function ensureCanMutateNextListeners() {
    if (nextListeners === currentListeners) {
      nextListeners = new Map();
      currentListeners.forEach((listener, key) => {
        nextListeners.set(key, listener);
      });
    }
  }

  // Store methods
  function getState() {
    if (isDispatching) {
      throw new Error(process.env.NODE_ENV === "production" ? formatProdErrorMessage(3) : "You may not call store.getState() while the reducer is executing. The reducer has already received the state as an argument. Pass it down from the top reducer instead of reading it from the store.");
    }
    return currentState;
  }

  function subscribe(listener) {
    if (typeof listener !== "function") {
      throw new Error(process.env.NODE_ENV === "production" ? formatProdErrorMessage(4) : `Expected the listener to be a function. Instead, received: '${kindOf(listener)}'`);
    }
    if (isDispatching) {
      throw new Error(process.env.NODE_ENV === "production" ? formatProdErrorMessage(5) : "You may not call store.subscribe() while the reducer is executing. If you would like to be notified after the store has been updated, subscribe from a component and invoke store.getState() in the callback to access the latest state. See https://redux.js.org/api/store#subscribelistener for more details.");
    }

    let isSubscribed = true;
    ensureCanMutateNextListeners();
    const listenerId = listenerIdCounter++;
    nextListeners.set(listenerId, listener);

    return function unsubscribe() {
      if (!isSubscribed) {
        return;
      }
      if (isDispatching) {
        throw new Error(process.env.NODE_ENV === "production" ? formatProdErrorMessage(6) : "You may not unsubscribe from a store listener while the reducer is executing. See https://redux.js.org/api/store#subscribelistener for more details.");
      }
      isSubscribed = false;
      ensureCanMutateNextListeners();
      nextListeners.delete(listenerId);
      currentListeners = null;
    };
  }

  function dispatch(action) {
    if (!isPlainObject(action)) {
      throw new Error(process.env.NODE_ENV === "production" ? formatProdErrorMessage(7) : `Actions must be plain objects. Instead, the actual type was: '${kindOf(action)}'. You may need to add middleware to your store setup to handle dispatching other values, such as 'redux-thunk' to handle dispatching functions. See https://redux.js.org/tutorials/fundamentals/part-4-store#middleware and https://redux.js.org/tutorials/fundamentals/part-6-async-logic#using-the-redux-thunk-middleware for examples.`);
    }
    if (typeof action.type === "undefined") {
      throw new Error(process.env.NODE_ENV === "production" ? formatProdErrorMessage(8) : 'Actions may not have an undefined "type" property. You may have misspelled an action type string constant.');
    }
    if (typeof action.type !== "string") {
      throw new Error(process.env.NODE_ENV === "production" ? formatProdErrorMessage(17) : `Action "type" property must be a string. Instead, the actual type was: '${kindOf(action.type)}'. Value was: '${action.type}' (stringified)`);
    }
    if (isDispatching) {
      throw new Error(process.env.NODE_ENV === "production" ? formatProdErrorMessage(9) : "Reducers may not dispatch actions.");
    }

    try {
      isDispatching = true;
      currentState = currentReducer(currentState, action);
    } finally {
      isDispatching = false;
    }

    currentListeners = nextListeners;
    currentListeners.forEach((listener) => listener());
    return action;
  }

  function replaceReducer(nextReducer) {
    if (typeof nextReducer !== "function") {
      throw new Error(process.env.NODE_ENV === "production" ? formatProdErrorMessage(10) : `Expected the nextReducer to be a function. Instead, received: '${kindOf(nextReducer)}'`);
    }
    currentReducer = nextReducer;
    dispatch({ type: ActionTypes.REPLACE });
  }

  function observable() {
    const outerSubscribe = subscribe;
    return {
      subscribe(observer) {
        if (typeof observer !== "object" || observer === null) {
          throw new Error(process.env.NODE_ENV === "production" ? formatProdErrorMessage(11) : `Expected the observer to be an object. Instead, received: '${kindOf(observer)}'`);
        }

        function observeState() {
          if (observer.next) {
            observer.next(getState());
          }
        }

        observeState();
        const unsubscribe = outerSubscribe(observeState);
        return { unsubscribe };
      },
      [observableSymbol]() {
        return this;
      }
    };
  }

  dispatch({ type: ActionTypes.INIT });

  return {
    dispatch,
    subscribe,
    getState,
    replaceReducer,
    [observableSymbol]: observable
  };
}

// Legacy store creation
function legacy_createStore(reducer, preloadedState, enhancer) {
  return createStore(reducer, preloadedState, enhancer);
}

// Warning utility
function warning(message) {
  if (typeof console !== "undefined" && typeof console.error === "function") {
    console.error(message);
  }
  try {
    throw new Error(message);
  } catch (e) {
    // no-op
  }
}

// Utility to generate warning messages for unexpected state shapes
function getUnexpectedStateShapeWarningMessage(inputState, reducers, action, unexpectedKeyCache) {
  const reducerKeys = Object.keys(reducers);
  const argumentName = action && action.type === ActionTypes.INIT ? "preloadedState argument passed to createStore" : "previous state received by the reducer";

  if (reducerKeys.length === 0) {
    return "Store does not have a valid reducer. Make sure the argument passed to combineReducers is an object whose values are reducers.";
  }

  if (!isPlainObject(inputState)) {
    return `The ${argumentName} has unexpected type of "${kindOf(inputState)}". Expected argument to be an object with the following keys: "${reducerKeys.join('", "')}"`;
  }

  const unexpectedKeys = Object.keys(inputState).filter(key => !reducers.hasOwnProperty(key) && !unexpectedKeyCache[key]);
  unexpectedKeys.forEach(key => { unexpectedKeyCache[key] = true; });

  if (action && action.type === ActionTypes.REPLACE) return;

  if (unexpectedKeys.length > 0) {
    return `Unexpected ${unexpectedKeys.length > 1 ? "keys" : "key"} "${unexpectedKeys.join('", "')}" found in ${argumentName}. Expected to find one of the known reducer keys instead: "${reducerKeys.join('", "')}". Unexpected keys will be ignored.`;
  }
}

function assertReducerShape(reducers) {
  Object.keys(reducers).forEach(key => {
    const reducer = reducers[key];
    const initialState = reducer(void 0, { type: ActionTypes.INIT });

    if (typeof initialState === "undefined") {
      throw new Error(process.env.NODE_ENV === "production" ? formatProdErrorMessage(12) : `The slice reducer for key "${key}" returned undefined during initialization. If the state passed to the reducer is undefined, you must explicitly return the initial state. The initial state may not be undefined. If you don't want to set a value for this reducer, you can use null instead of undefined.`);
    }

    if (typeof reducer(void 0, { type: ActionTypes.PROBE_UNKNOWN_ACTION() }) === "undefined") {
      throw new Error(process.env.NODE_ENV === "production" ? formatProdErrorMessage(13) : `The slice reducer for key "${key}" returned undefined when probed with a random type. Don't try to handle '${ActionTypes.INIT}' or other actions in the 'redux/*' namespace. They are considered private. Instead, you must return the current state for any unknown actions, unless it is undefined, in which case you must return the initial state, regardless of the action type. The initial state may not be undefined, but can be null.`);
    }
  });
}

// Combine reducers utility
function combineReducers(reducers) {
  const reducerKeys = Object.keys(reducers);
  const finalReducers = {};

  for (let i = 0; i < reducerKeys.length; i++) {
    const key = reducerKeys[i];

    if (process.env.NODE_ENV !== "production" && typeof reducers[key] === "undefined") {
      warning(`No reducer provided for key "${key}"`);
    }

    if (typeof reducers[key] === "function") {
      finalReducers[key] = reducers[key];
    }
  }

  const finalReducerKeys = Object.keys(finalReducers);
  let unexpectedKeyCache;

  if (process.env.NODE_ENV !== "production") {
    unexpectedKeyCache = {};
  }

  let shapeAssertionError;

  try {
    assertReducerShape(finalReducers);
  } catch (e) {
    shapeAssertionError = e;
  }

  return function combination(state = {}, action) {
    if (shapeAssertionError) {
      throw shapeAssertionError;
    }

    if (process.env.NODE_ENV !== "production") {
      const warningMessage = getUnexpectedStateShapeWarningMessage(state, finalReducers, action, unexpectedKeyCache);
      if (warningMessage) warning(warningMessage);
    }

    let hasChanged = false;
    const nextState = {};

    for (let i = 0; i < finalReducerKeys.length; i++) {
      const key = finalReducerKeys[i];
      const reducer = finalReducers[key];
      const previousStateForKey = state[key];
      const nextStateForKey = reducer(previousStateForKey, action);

      if (typeof nextStateForKey === "undefined") {
        const actionType = action && action.type;
        throw new Error(process.env.NODE_ENV === "production" ? formatProdErrorMessage(14) : `When called with an action of type ${actionType ? `"${String(actionType)}"` : "(unknown type)"}, the slice reducer for key "${key}" returned undefined. To ignore an action, you must explicitly return the previous state. If you want this reducer to hold no value, you can return null instead of undefined.`);
      }

      nextState[key] = nextStateForKey;
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
    }

    hasChanged = hasChanged || finalReducerKeys.length !== Object.keys(state).length;
    return hasChanged ? nextState : state;
  };
}

// Binding action creators to dispatch
function bindActionCreator(actionCreator, dispatch) {
  return function(...args) {
    return dispatch(actionCreator.apply(this, args));
  };
}

function bindActionCreators(actionCreators, dispatch) {
  if (typeof actionCreators === "function") {
    return bindActionCreator(actionCreators, dispatch);
  }

  if (typeof actionCreators !== "object" || actionCreators === null) {
    throw new Error(process.env.NODE_ENV === "production" ? formatProdErrorMessage(16) : `bindActionCreators expected an object or a function, but instead received: '${kindOf(actionCreators)}'. Did you write "import ActionCreators from" instead of "import * as ActionCreators from"?`);
  }

  const boundActionCreators = {};
  for (const key in actionCreators) {
    const actionCreator = actionCreators[key];
    if (typeof actionCreator === "function") {
      boundActionCreators[key] = bindActionCreator(actionCreator, dispatch);
    }
  }
  return boundActionCreators;
}

// Function composer
function compose(...funcs) {
  if (funcs.length === 0) {
    return (arg) => arg;
  }
  if (funcs.length === 1) {
    return funcs[0];
  }
  return funcs.reduce((a, b) => (...args) => a(b(...args)));
}

// Middleware application
function applyMiddleware(...middlewares) {
  return (createStoreAPI) => (reducer, preloadedState) => {
    const store = createStoreAPI(reducer, preloadedState);
    let dispatch = () => {
      throw new Error(process.env.NODE_ENV === "production" ? formatProdErrorMessage(15) : "Dispatching while constructing your middleware is not allowed. Other middleware would not be applied to this dispatch.");
    };
    const middlewareAPI = {
      getState: store.getState,
      dispatch: (action, ...args) => dispatch(action, ...args)
    };
    const chain = middlewares.map(middleware => middleware(middlewareAPI));
    dispatch = compose(...chain)(store.dispatch);
    return { ...store, dispatch };
  };
}

// Validates if a given object is a valid action
function isAction(action) {
  return isPlainObject(action) && "type" in action && typeof action.type === "string";
}
