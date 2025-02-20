'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const index = require('./setup/index.js');
const options = require('./options.js');

exports.default = index.userEvent;
exports.userEvent = index.userEvent;
Object.defineProperty(exports, "PointerEventsCheckLevel", {
  enumerable: true,
  get: function() { return options.PointerEventsCheckLevel; }
});
