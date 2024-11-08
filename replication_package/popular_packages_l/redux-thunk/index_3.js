const { createStore, applyMiddleware } = require('redux');

// Custom thunk middleware allowing an extra argument
const thunkWithExtraArgument = extraArgument => ({ dispatch, getState }) => next => action => {
  if (typeof action === 'function') {
    return action(dispatch, getState, extraArgument);
  }
  return next(action);
};

// Basic root reducer with an 'INCREMENT' case
const rootReducer = (state = { count: 0 }, action) => {
  switch(action.type) {
    case 'INCREMENT':
      return { count: state.count + 1 };
    default:
      return state;
  }
};

// Creation of Redux store with thunk middleware attached
const store = createStore(
  rootReducer,
  applyMiddleware(thunkWithExtraArgument({ apiService: /* your service layer */ }))
);

// Synchronous action creator
const increment = () => ({ type: 'INCREMENT' });

// Asynchronous action creator using thunk
const incrementAsync = () => dispatch => {
  setTimeout(() => {
    dispatch(increment());
  }, 1000);
};

// Conditional action creator based on current state
const incrementIfOdd = () => (dispatch, getState) => {
  const { count } = getState();
  if (count % 2 !== 0) {
    dispatch(increment());
  }
};

// Dispatching actions to demonstrate functionality
store.dispatch(incrementAsync());
store.dispatch(incrementIfOdd());
