'use strict';

// Importing required modules
const hasProp = require('./hasProp');
const elementType = require('./elementType');
const eventHandlers = require('./eventHandlers');
const getProp = require('./getProp');
const getPropValue = require('./getPropValue');
const propName = require('./propName');

// Exporting functions from these modules in a structured way
module.exports = {
  hasProp: hasProp.default,
  hasAnyProp: hasProp.hasAnyProp,
  hasEveryProp: hasProp.hasEveryProp,
  elementType: elementType.default,
  eventHandlers: eventHandlers.default,
  eventHandlersByType: eventHandlers.eventHandlersByType,
  getProp: getProp.default,
  getPropValue: getPropValue.default,
  getLiteralPropValue: getPropValue.getLiteralPropValue,
  propName: propName.default
};
