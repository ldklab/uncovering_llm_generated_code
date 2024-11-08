"use strict";

function createThunkMiddleware(extraArgument) {
  return function ({ dispatch, getState }) {
    return function (next) {
      return function (action) {
        if (typeof action === "function") {
          return action(dispatch, getState, extraArgument);
        }
        return next(action);
      };
    };
  };
}

const thunk = createThunkMiddleware();
const withExtraArgument = createThunkMiddleware;

module.exports = {
  thunk,
  withExtraArgument
};
