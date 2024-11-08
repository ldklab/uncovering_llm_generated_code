'use strict';

exports.__esModule = true;

function createThunkMiddleware(extraArgument) {
  // This function returns a middleware function for Redux
  return function (store) {
    var dispatch = store.dispatch,
        getState = store.getState;
    return function (next) {
      // Returns a function that takes an action
      return function (action) {
        // If the action is a function (a thunk), call it with dispatch, getState, and optionally, extraArgument
        if (typeof action === 'function') {
          return action(dispatch, getState, extraArgument);
        }

        // Otherwise, pass the action to the next middleware or reducer
        return next(action);
      };
    };
  };
}

// Create a default thunk middleware without an extra argument
var thunk = createThunkMiddleware();

// Allow creating a thunk middleware with an extra argument
thunk.withExtraArgument = createThunkMiddleware;

// Export the default thunk middleware
exports['default'] = thunk;
