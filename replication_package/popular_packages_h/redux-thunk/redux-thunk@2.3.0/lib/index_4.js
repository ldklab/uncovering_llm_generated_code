'use strict';

// Define a module that exports a function for creating Redux middleware
exports.__esModule = true;

// Function to create a thunk middleware with an optional extra argument
function createThunkMiddleware(extraArgument) {
  return function ({ dispatch, getState }) { // Middleware API arguments
    return function (next) { // The next middleware or reducer in the chain
      return function (action) { // The action passed to the middleware
        // If the action is a function, invoke it with dispatch, getState, and the optional extra argument
        if (typeof action === 'function') {
          return action(dispatch, getState, extraArgument);
        }
        // Otherwise, pass the action to the next middleware/reducer
        return next(action);
      };
    };
  };
}

// Create a default thunk middleware without any extra arguments
var thunk = createThunkMiddleware();

// Attach the factory function to allow creating new middleware with an extra argument
thunk.withExtraArgument = createThunkMiddleware;

// Export the default thunk middleware
exports['default'] = thunk;
