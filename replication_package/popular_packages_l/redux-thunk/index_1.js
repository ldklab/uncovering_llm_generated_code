import { createStore, applyMiddleware } from 'redux';

// Create a custom thunk middleware that also takes an extra argument
const createThunkMiddleware = extraArgument => ({ dispatch, getState }) => next => action => {
  if (typeof action === 'function') {
    return action(dispatch, getState, extraArgument);
  }
  return next(action);
};

// Root reducer to manage state changes
const rootReducer = (state = { count: 0 }, action) => {
  switch (action.type) {
    case 'INCREMENT':
      return { count: state.count + 1 };
    default:
      return state;
  }
};

// Configure the store with the reducer and thunk middleware
const apiService = {}; // Placeholder for an external API service
const store = createStore(
  rootReducer,
  applyMiddleware(createThunkMiddleware({ apiService }))
);

// Synchronous action creator
const increment = () => ({ type: 'INCREMENT' });

// Asynchronous action creator
const incrementAsync = () => dispatch => {
  setTimeout(() => {
    dispatch(increment());
  }, 1000);
};

// Conditional action creator
const incrementIfOdd = () => (dispatch, getState) => {
  const { count } = getState();
  if (count % 2 !== 0) {
    dispatch(increment());
  }
};

// Dispatch actions to test their functionality
store.dispatch(incrementAsync());
store.dispatch(incrementIfOdd());
