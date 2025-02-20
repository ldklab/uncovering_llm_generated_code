"use strict";

// Utility Functions
const defineProperty = Object.defineProperty;
const getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
const getOwnPropertyNames = Object.getOwnPropertyNames;
const hasOwnProperty = Object.prototype.hasOwnProperty;

function exportProps(target, all) {
  for (const name in all) {
    defineProperty(target, name, { get: all[name], enumerable: true });
  }
}

function copyProperties(to, from, except, desc) {
  if (from && typeof from === "object" || typeof from === "function") {
    getOwnPropertyNames(from).forEach((key) => {
      if (!hasOwnProperty.call(to, key) && key !== except) {
        defineProperty(to, key, {
          get: () => from[key],
          enumerable: !(desc = getOwnPropertyDescriptor(from, key)) || desc.enumerable
        });
      }
    });
  }
  return to;
}

function toCommonJS(mod) {
  return copyProperties(defineProperty({}, "__esModule", { value: true }), mod);
}

// Export variables
module.exports = toCommonJS({
  __DO_NOT_USE__ActionTypes: () => actionTypes,
  applyMiddleware,
  bindActionCreators,
  combineReducers,
  compose,
  createStore,
  isAction,
  isPlainObject,
  legacy_createStore: () => createStore
});

// formatProdErrorMessage
function formatProdErrorMessage(code) {
  return `Minified Redux error #${code}; visit https://redux.js.org/Errors?code=${code} for more details. `;
}

// Symbol.observable implementation
const observableSymbol = (() => typeof Symbol === "function" && Symbol.observable || "@@observable")();

// Action Types with Random Generator
const randomString = () => Math.random().toString(36).substring(7).split("").join(".");
const actionTypes = {
  INIT: `@@redux/INIT${randomString()}`,
  REPLACE: `@@redux/REPLACE${randomString()}`,
  PROBE_UNKNOWN_ACTION: () => `@@redux/PROBE_UNKNOWN_ACTION${randomString()}`
};

// isPlainObject: Checks if value is a plain object
function isPlainObject(obj) {
  if (typeof obj !== "object" || obj === null) return false;
  let proto = obj;
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }
  return Object.getPrototypeOf(obj) === proto || Object.getPrototypeOf(obj) === null;
}

// kindOf: Determine value type
function kindOf(val) {
  let typeOfVal = typeof val;
  if (process.env.NODE_ENV !== "production") {
    typeOfVal = miniKindOf(val);
  }
  return typeOfVal;
}

function miniKindOf(val) {
  if (val === undefined) return "undefined";
  if (val === null) return "null";
  const type = typeof val;
  switch (type) {
    case "boolean":
    case "string":
    case "number":
    case "symbol":
    case "function":
      return type;
  }
  if (Array.isArray(val)) return "array";
  if (isDate(val)) return "date";
  if (isError(val)) return "error";

  const constructorName = typeof val.constructor === "function" ? val.constructor.name : null;
  switch (constructorName) {
    case "Symbol":
    case "Promise":
    case "WeakMap":
    case "WeakSet":
    case "Map":
    case "Set":
      return constructorName;
  }
  return Object.prototype.toString.call(val).slice(8, -1).toLowerCase().replace(/\s/g, "");
}

function isError(val) {
  return val instanceof Error || typeof val.message === "string" && val.constructor && typeof val.constructor.stackTraceLimit === "number";
}

function isDate(val) {
  return val instanceof Date || (typeof val.toDateString === "function" && typeof val.getDate === "function" && typeof val.setDate === "function");
}

// createStore: Core function to create a Redux-like store
function createStore(reducer, preloadedState, enhancer) {
  if (typeof reducer !== "function") {
    throw new Error(`Expected the root reducer to be a function. Instead, received: '${kindOf(reducer)}'`);
  }
  if (typeof enhancer !== "undefined") {
    if (typeof enhancer !== "function") {
      throw new Error(`Expected the enhancer to be a function. Instead, received: '${kindOf(enhancer)}'`);
    }
    return enhancer(createStore)(reducer, preloadedState);
  }
  
  let currentReducer = reducer;
  let currentState = preloadedState;
  let listeners = new Map();
  let listenerIdCounter = 0;
  let isDispatching = false;

  function ensureMutableListeners() {
    if (listeners === currentListeners) {
      listeners = new Map(currentListeners);
    }
  }

  function getState() {
    if (isDispatching) throw new Error("You may not call store.getState() while the reducer is executing.");
    return currentState;
  }

  function subscribe(listener) {
    if (typeof listener !== "function") {
      throw new Error(`Expected the listener to be a function. Instead, received: '${kindOf(listener)}'`);
    }
    if (isDispatching) {
      throw new Error("You may not call store.subscribe() while the reducer is executing.");
    }
    
    let isSubscribed = true;
    ensureMutableListeners();
    const listenerId = listenerIdCounter++;
    listeners.set(listenerId, listener);

    return function unsubscribe() {
      if (!isSubscribed) return;
      if (isDispatching) {
        throw new Error("You may not unsubscribe from a store listener while the reducer is executing.");
      }

      isSubscribed = false;
      ensureMutableListeners();
      listeners.delete(listenerId);
    };
  }

  function dispatch(action) {
    if (!isPlainObject(action)) {
      throw new Error(`Actions must be plain objects. Instead, the actual type was: '${kindOf(action)}'.`);
    }
    if (typeof action.type === "undefined") {
      throw new Error('Actions may not have an undefined "type" property.');
    }
    if (typeof action.type !== "string") {
      throw new Error(`Action "type" property must be a string. Instead, actual type was: '${kindOf(action.type)}'.`);
    }
    if (isDispatching) {
      throw new Error("Reducers may not dispatch actions.");
    }

    try {
      isDispatching = true;
      currentState = currentReducer(currentState, action);
    } finally {
      isDispatching = false;
    }

    const currentListeners = listeners;
    currentListeners.forEach((listener) => listener());
    return action;
  }

  function replaceReducer(nextReducer) {
    if (typeof nextReducer !== "function") {
      throw new Error(`Expected the nextReducer to be a function. Instead, received: '${kindOf(nextReducer)}`);
    }
    currentReducer = nextReducer;
    dispatch({ type: actionTypes.REPLACE });
  }

  function observable() {
    const { subscribe } = this;
    return {
      subscribe(observer) {
        if (typeof observer !== "object" || observer === null) {
          throw new Error(`Expected the observer to be an object. Instead, received: '${kindOf(observer)}'`);
        }
        function observeState() {
          if (observer.next) {
            observer.next(getState());
          }
        }
        observeState();
        const unsubscribe = subscribe(observeState);
        return { unsubscribe };
      },
      [observableSymbol]: function() { return this; }
    };
  }

  dispatch({ type: actionTypes.INIT });
 
  return {
    dispatch,
    subscribe,
    getState,
    replaceReducer,
    [observableSymbol]: observable
  };
}

// Utility function to combine reducers
function combineReducers(reducers) {
  const finalReducers = Object.keys(reducers).reduce((final, key) => {
    if (typeof reducers[key] === 'function') {
      final[key] = reducers[key];
    }
    return final;
  }, {});

  const finalReducerKeys = Object.keys(finalReducers);

  return function combinedReducer(state = {}, action) {
    let hasChanged = false;
    const nextState = {};

    finalReducerKeys.forEach(key => {
      const reducer = finalReducers[key];
      const previousStateForKey = state[key];
      const nextStateForKey = reducer(previousStateForKey, action);

      if (typeof nextStateForKey === "undefined") {
        const actionType = action && action.type;
        throw new Error(`Reducer under key "${key}" returned undefined.`);
      }

      nextState[key] = nextStateForKey;
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
    });

    return hasChanged ? nextState : state;
  };
}

// Bind action creators to dispatch
function bindActionCreators(actionCreators, dispatch) {
  if (typeof actionCreators === 'function') {
    return (...args) => dispatch(actionCreators.apply(this, args));
  }

  if (typeof actionCreators !== 'object' || actionCreators === null) {
    throw new Error(`bindActionCreators expected an object or a function, but instead received: '${kindOf(actionCreators)}'.`);
  }

  return Object.keys(actionCreators).reduce((boundActions, key) => {
    const actionCreator = actionCreators[key];
    if (typeof actionCreator === 'function') {
      boundActions[key] = (...args) => dispatch(actionCreator.apply(this, args));
    }
    return boundActions;
  }, {});
}

// Compose functions (middleware)
function compose(...funcs) {
  if (funcs.length === 0) {
    return arg => arg;
  }
  if (funcs.length === 1) {
    return funcs[0];
  }
  return funcs.reduce((a, b) => (...args) => a(b(...args)));
}

// Apply middleware to store
function applyMiddleware(...middlewares) {
  return createStore => (reducer, preloadedState) => {
    const store = createStore(reducer, preloadedState);
    let dispatch = () => {
      throw new Error("Dispatching while constructing your middleware is not allowed.");
    };

    const middlewareAPI = { getState: store.getState, dispatch: (action, ...args) => dispatch(action, ...args) };
    const chain = middlewares.map(middleware => middleware(middlewareAPI));
    dispatch = compose(...chain)(store.dispatch);

    return {
      ...store,
      dispatch
    };
  };
}

// Determine if an action object is valid
function isAction(action) {
  return isPlainObject(action) && "type" in action && typeof action.type === "string";
}
