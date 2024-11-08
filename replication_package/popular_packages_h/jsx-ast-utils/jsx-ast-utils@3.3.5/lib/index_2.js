'use strict';

const hasProp = require('./hasProp');
const elementType = require('./elementType');
const eventHandlers = require('./eventHandlers');
const getProp = require('./getProp');
const getPropValue = require('./getPropValue');
const propName = require('./propName');

module.exports = {
  // Exporting utilities for property handling
  hasProp: hasProp.default,
  hasAnyProp: hasProp.hasAnyProp,
  hasEveryProp: hasProp.hasEveryProp,

  // Exporting utilities for element type determination
  elementType: elementType.default,

  // Exporting utilities for event handling
  eventHandlers: eventHandlers.default,
  eventHandlersByType: eventHandlers.eventHandlersByType,

  // Exporting utilities for property retrieval
  getProp: getProp.default,
  getPropValue: getPropValue.default,
  getLiteralPropValue: getPropValue.getLiteralPropValue,

  // Exporting utility for obtaining property names
  propName: propName.default
};
