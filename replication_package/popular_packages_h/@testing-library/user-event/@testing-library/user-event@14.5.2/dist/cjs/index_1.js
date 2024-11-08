'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const setupIndex = require('./setup/index.js');
const options = require('./options.js');

exports.default = setupIndex.userEvent;
exports.userEvent = setupIndex.userEvent;
Object.defineProperty(exports, "PointerEventsCheckLevel", {
  enumerable: true,
  get: function () { return options.PointerEventsCheckLevel; }
});
