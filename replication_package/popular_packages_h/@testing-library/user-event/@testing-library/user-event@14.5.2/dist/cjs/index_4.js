'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const { userEvent } = require('./setup/index.js');
const { PointerEventsCheckLevel } = require('./options.js');

exports.default = userEvent;
exports.userEvent = userEvent;
Object.defineProperty(exports, "PointerEventsCheckLevel", {
	enumerable: true,
	get: () => PointerEventsCheckLevel,
});
