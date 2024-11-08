'use strict';

// Import functions and default exports from different modules
const hasPropModule = require('./hasProp');
const elementTypeModule = require('./elementType');
const eventHandlersModule = require('./eventHandlers');
const getPropModule = require('./getProp');
const getPropValueModule = require('./getPropValue');
const propNameModule = require('./propName');

// Export an object that consolidates the functions and modules
module.exports = {
  // Functions dealing with element properties
  hasProp: hasPropModule.default,
  hasAnyProp: hasPropModule.hasAnyProp,
  hasEveryProp: hasPropModule.hasEveryProp,

  // Function for checking element type
  elementType: elementTypeModule.default,

  // Event handler utility functions
  eventHandlers: eventHandlersModule.default,
  eventHandlersByType: eventHandlersModule.eventHandlersByType,

  // Functions to get and operate on element properties
  getProp: getPropModule.default,
  getPropValue: getPropValueModule.default,
  getLiteralPropValue: getPropValueModule.getLiteralPropValue,

  // Function to get the property name
  propName: propNameModule.default
};
