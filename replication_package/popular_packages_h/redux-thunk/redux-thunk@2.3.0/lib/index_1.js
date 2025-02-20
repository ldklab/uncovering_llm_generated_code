'use strict';

exports.__esModule = true;

function createThunkMiddleware(extraArgument) {
  return function (store) {
    const dispatch = store.dispatch;
    const getState = store.getState;

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

const thunk = createThunkMiddleware();
thunk.withExtraArgument = createThunkMiddleware;

exports['default'] = thunk;
