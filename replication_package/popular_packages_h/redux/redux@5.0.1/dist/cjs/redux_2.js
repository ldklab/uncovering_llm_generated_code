"use strict";

const { defineProperty, getOwnPropertyDescriptor, getOwnPropertyNames, prototype } = Object;
const hasOwnProperty = prototype.hasOwnProperty;

const exportModule = (target, exports) => {
  for (const name in exports) {
    defineProperty(target, name, { get: exports[name], enumerable: true });
  }
};

const copyProperties = (to, from, except) => {
  if (from && (typeof from === "object" || typeof from === "function")) {
    const keys = getOwnPropertyNames(from);
    keys.forEach(key => {
      if (!hasOwnProperty.call(to, key) && key !== except) {
        defineProperty(to, key, {
          get: () => from[key],
          enumerable: true
        });
      }
    });
  }
  return to;
};

const toCommonJS = (module) => copyProperties(defineProperty({}, "__esModule", { value: true }), module);

const srcExports = {};
exportModule(srcExports, {
  __DO_NOT_USE__ActionTypes: () => actionTypes,
  applyMiddleware: () => applyMiddleware,
  bindActionCreators: () => bindActionCreators,
  combineReducers: () => combineReducers,
  compose: () => compose,
  createStore: () => createStore,
  isAction: () => isAction,
  isPlainObject: () => isPlainObject,
  legacy_createStore: () => legacy_createStore
});
module.exports = toCommonJS(srcExports);

function formatProdErrorMessage(code) {
  return `Minified Redux error #${code}; visit https://redux.js.org/Errors?code=${code} for more details.`;
}

const observableKey = typeof Symbol === "function" && Symbol.observable || "@@observable";

const actionTypes = {
  INIT: `@@redux/INIT${randomString()}`,
  REPLACE: `@@redux/REPLACE${randomString()}`,
  PROBE_UNKNOWN_ACTION: () => `@@redux/PROBE_UNKNOWN_ACTION${randomString()}`
};

function randomString() {
  return Math.random().toString(36).substring(7).split("").join(".");
}

function isPlainObject(obj) {
  if (typeof obj !== "object" || obj === null) return false;
  let proto = Object.getPrototypeOf(obj);
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }
  return Object.getPrototypeOf(obj) === proto;
}

function createStore(reducer, preloadedState, enhancer) {
  if (typeof reducer !== "function") {
    throw new Error(formatErrorMessage(2, `Expected the root reducer to be a function. Instead, received: '${kindOf(reducer)}'.`));
  }

  if (typeof preloadedState === "function" && typeof enhancer === "function" || typeof enhancer === "function") {
    throw new Error(formatErrorMessage(0, "Passing multiple store enhancers is not supported. Use 'compose' to combine them."));
  }

  if (typeof preloadedState === "function") {
    enhancer = preloadedState;
    preloadedState = undefined;
  }

  if (enhancer) {
    if (typeof enhancer !== "function") {
      throw new Error(formatErrorMessage(1, `Expected the enhancer to be a function. Instead, received: '${kindOf(enhancer)}'.`));
    }
    return enhancer(createStore)(reducer, preloadedState);
  }

  let currentReducer = reducer;
  let currentState = preloadedState;
  let currentListeners = new Map();
  let nextListeners = currentListeners;
  let isDispatching = false;
  let listenerIdCounter = 0;

  function ensureCanMutateListeners() {
    if (nextListeners === currentListeners) {
      nextListeners = new Map(currentListeners);
    }
  }

  function getState() {
    if (isDispatching) {
      throw new Error(formatErrorMessage(3, "Cannot call getState while the reducer is executing."));
    }
    return currentState;
  }

  function subscribe(listener) {
    if (typeof listener !== "function") {
      throw new Error(formatErrorMessage(4, `Expected the listener to be a function, received: '${kindOf(listener)}'.`));
    }

    if (isDispatching) {
      throw new Error(formatErrorMessage(5, "Cannot subscribe while the reducer is executing."));
    }

    let isSubscribed = true;
    ensureCanMutateListeners();
    const id = listenerIdCounter++;
    nextListeners.set(id, listener);

    return function unsubscribe() {
      if (!isSubscribed) return;

      if (isDispatching) {
        throw new Error(formatErrorMessage(6, "Cannot unsubscribe while the reducer is executing."));
      }

      isSubscribed = false;
      ensureCanMutateListeners();
      nextListeners.delete(id);
      currentListeners = undefined;
    };
  }

  function dispatch(action) {
    validateAction(action);

    if (isDispatching) {
      throw new Error(formatErrorMessage(9, "Reducers may not dispatch actions."));
    }

    try {
      isDispatching = true;
      currentState = currentReducer(currentState, action);
    } finally {
      isDispatching = false;
    }

    const listeners = (currentListeners = nextListeners);
    listeners.forEach(listener => listener());
    return action;
  }

  function replaceReducer(nextReducer) {
    if (typeof nextReducer !== "function") {
      throw new Error(formatErrorMessage(10, `Expected the nextReducer to be a function, received: '${kindOf(nextReducer)}'.`));
    }
    currentReducer = nextReducer;
    dispatch({ type: actionTypes.REPLACE });
  }

  function observable() {
    return {
      subscribe(observer) {
        if (typeof observer !== "object" || observer === null) {
          throw new Error(formatErrorMessage(11, `Expected the observer to be an object, received: '${kindOf(observer)}'.`));
        }

        function observerState() {
          if (observer.next) {
            observer.next(getState());
          }
        }

        observerState();
        const unsubscribe = subscribe(observerState);
        return { unsubscribe };
      },
      [observableKey]() {
        return this;
      }
    };
  }

  dispatch({ type: actionTypes.INIT });

  return { dispatch, subscribe, getState, replaceReducer, [observableKey]: observable };
}

function kindOf(val) {
  if (val === undefined) return "undefined";
  if (val === null) return "null";

  const type = typeof val;
  if (["boolean", "string", "number", "symbol", "function"].includes(type)) {
    return type;
  }

  if (Array.isArray(val)) return "array";
  if (isDate(val)) return "date";
  if (isError(val)) return "error";
  
  const constructorName = val?.constructor?.name;
  if (["Symbol", "Promise", "WeakMap", "WeakSet", "Map", "Set"].includes(constructorName)) {
    return constructorName;
  }

  return Object.prototype.toString.call(val).slice(8, -1).toLowerCase().replace(/\s/g, "");
}

function validateAction(action) {
  if (!isPlainObject(action)) {
    throw new Error(formatErrorMessage(7, `Actions must be plain objects. Instead, the actual type was: '${kindOf(action)}'`));
  }

  if (typeof action.type === "undefined") {
    throw new Error(formatErrorMessage(8, `Actions must have a defined "type" property.`));
  }

  if (typeof action.type !== "string") {
    throw new Error(formatErrorMessage(17, `Action "type" must be a string, received: '${kindOf(action.type)}'`));
  }
}

function isDate(val) {
  return val instanceof Date || ("function" === typeof val.toDateString && "function" === typeof val.getDate && "function" === typeof val.setDate);
}

function isError(val) {
  return val instanceof Error || ("string" === typeof val.message && val.constructor && "number" === typeof val.constructor.stackTraceLimit);
}

function legacy_createStore(reducer, preloadedState, enhancer) {
  return createStore(reducer, preloadedState, enhancer);
}

function compose(...funcs) {
  if (funcs.length === 0) return arg => arg;
  if (funcs.length === 1) return funcs[0];

  return funcs.reduce((a, b) => (...args) => a(b(...args)));
}

function applyMiddleware(...middlewares) {
  return createStore => (reducer, initialState) => {
    const store = createStore(reducer, initialState);
    let dispatch = () => {
      throw new Error(formatErrorMessage(15, "Dispatching during middleware construction is not allowed."));
    };

    const middlewareAPI = {
      getState: store.getState,
      dispatch: (...args) => dispatch(...args)
    };
    
    const chain = middlewares.map(middleware => middleware(middlewareAPI));
    dispatch = compose(...chain)(store.dispatch);

    return { ...store, dispatch };
  };
}

function bindActionCreators(actionCreators, dispatch) {
  if (typeof actionCreators === "function") {
    return bindActionCreator(actionCreators, dispatch);
  }

  if (!isPlainObject(actionCreators)) {
    throw new Error(formatErrorMessage(16, `Expected an object or function, received: '${kindOf(actionCreators)}'`));
  }

  const boundActionCreators = {};
  Object.keys(actionCreators).forEach(key => {
    const actionCreator = actionCreators[key];
    if (typeof actionCreator === "function") {
      boundActionCreators[key] = bindActionCreator(actionCreator, dispatch);
    }
  });

  return boundActionCreators;
}

function bindActionCreator(actionCreator, dispatch) {
  return function (...args) {
    return dispatch(actionCreator(...args));
  };
}

function combineReducers(reducers) {
  const reducerKeys = Object.keys(reducers);
  const finalReducers = reducerKeys.reduce((accum, key) => {
    if (typeof reducers[key] === "function") {
      accum[key] = reducers[key];
    }
    return accum;
  }, {});

  let unexpectedKeyCache;
  if (process.env.NODE_ENV !== "production") {
    unexpectedKeyCache = {};
  }

  return function combination(state = {}, action) {
    const finalReducerKeys = Object.keys(finalReducers);
    let hasChanged = false;
    const nextState = {};

    finalReducerKeys.forEach(key => {
      const reducer = finalReducers[key];
      const previousStateForKey = state[key];
      const nextStateForKey = reducer(previousStateForKey, action);

      if (nextStateForKey === undefined) {
        throw new Error(formatErrorMessage(14, `Reducer for key "${key}" returned undefined when handling action type: ${String(action?.type)}`));
      }

      nextState[key] = nextStateForKey;
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
    });

    hasChanged = hasChanged || finalReducerKeys.length !== Object.keys(state).length;
    return hasChanged ? nextState : state;
  };
}

function isAction(action) {
  return isPlainObject(action) && "type" in action && typeof action.type === "string";
}
