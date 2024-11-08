// Import necessary functions from Redux
import { createStore, applyMiddleware } from 'redux';

// Define the thunk middleware
const thunk = ({ dispatch, getState }) => next => action => {
  // If the action is a function, call it with dispatch and getState
  if (typeof action === 'function') {
    return action(dispatch, getState, extraArgument);
  }
  
  // Otherwise, just pass the action on to the next middleware
  return next(action);
};

// Create an enhancer to add additional functionality to the store
const withExtraArgument = extraArgument => ({ dispatch, getState }) => next => action => {
  if (typeof action === 'function') {
    return action(dispatch, getState, extraArgument);
  }
  return next(action);
};

// Root reducer placeholder for demonstration
const rootReducer = (state = {}, action) => {
  switch(action.type) {
    case 'INCREMENT': 
      return { count: (state.count || 0) + 1 };
    default: 
      return state;
  }
};

// Create a Redux store including the thunk middleware
const store = createStore(
  rootReducer,
  applyMiddleware(withExtraArgument({ apiService: /* your service layer */ }))
);

// Action creators
const increment = () => ({ type: 'INCREMENT' });

const incrementAsync = () => dispatch => {
  setTimeout(() => {
    dispatch(increment());
  }, 1000);
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
