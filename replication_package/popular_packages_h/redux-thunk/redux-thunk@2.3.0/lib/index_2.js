'use strict';

exports.__esModule = true;

function createThunkMiddleware(extraArgument) {
  return function ({ dispatch, getState }) {
    return function (next) {
      return function (action) {
        if (typeof action === 'function') {
          return action(dispatch, getState, extraArgument);
        }
        return next(action);
      };
    };
  };
}

const thunk = createThunkMiddleware();  // Default thunk without extra argument
thunk.withExtraArgument = createThunkMiddleware;  // Allows creation of thunk with extra argument

exports['default'] = thunk;
