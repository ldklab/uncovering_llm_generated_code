import { createStore, applyMiddleware } from 'redux';

// Middleware that allows dispatching functions
const thunkMiddleware = ({ dispatch, getState }) => next => action => {
  if (typeof action === 'function') {
    return action(dispatch, getState);
  }
  return next(action);
};

// Middleware that enhances thunk by handling an extra argument
const withExtraArgument = extraArg => ({ dispatch, getState }) => next => action => {
  if (typeof action === 'function') {
    return action(dispatch, getState, extraArg);
  }
  return next(action);
};

// Root reducer managing the state
const rootReducer = (state = { count: 0 }, action) => {
  switch(action.type) {
    case 'INCREMENT':
      return { count: state.count + 1 };
    default:
      return state;
  }
};

// Create store with middleware
const store = createStore(
  rootReducer,
  applyMiddleware(withExtraArgument({ apiService: {} }))
);

// Action creators
const increment = () => ({ type: 'INCREMENT' });

const incrementAsync = () => dispatch => {
  setTimeout(() => dispatch(increment()), 1000);
};

const incrementIfOdd = () => (dispatch, getState) => {
  const { count } = getState();
  if (count % 2 !== 0) {
    dispatch(increment());
  }
};

// Dispatch actions
store.dispatch(incrementAsync());
store.dispatch(incrementIfOdd());
