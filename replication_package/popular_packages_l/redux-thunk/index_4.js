// Import necessary functions from Redux
import { createStore, applyMiddleware } from 'redux';

// Define the thunk middleware with an extra argument
const withExtraArgument = extraArgument => ({ dispatch, getState }) => next => action => {
  if (typeof action === 'function') {
    return action(dispatch, getState, extraArgument);
  }
  return next(action);
};

// Example root reducer handling a simple counter
const rootReducer = (state = {}, action) => {
  switch(action.type) {
    case 'INCREMENT': 
      return { count: (state.count || 0) + 1 };
    default: 
      return state;
  }
};

// Create a Redux store with thunk middleware including an extra argument
const store = createStore(
  rootReducer,
  applyMiddleware(withExtraArgument({ apiService: /* your service layer */ }))
);

// Action creators for different scenarios
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

// Dispatch actions to modify state
store.dispatch(incrementAsync());
store.dispatch(incrementIfOdd());
