'use strict';

// Importing default and named exports from various utility modules.
const hasProp = require('./hasProp').default;
const { hasAnyProp, hasEveryProp } = require('./hasProp');

const elementType = require('./elementType').default;

const eventHandlers = require('./eventHandlers').default;
const { eventHandlersByType } = require('./eventHandlers');

const getProp = require('./getProp').default;

const getPropValue = require('./getPropValue').default;
const { getLiteralPropValue } = require('./getPropValue');

const propName = require('./propName').default;

// Export all imported utilities as a single object with named properties.
module.exports = {
  hasProp,
  hasAnyProp,
  hasEveryProp,
  elementType,
  eventHandlers,
  eventHandlersByType,
  getProp,
  getPropValue,
  getLiteralPropValue,
  propName
};
