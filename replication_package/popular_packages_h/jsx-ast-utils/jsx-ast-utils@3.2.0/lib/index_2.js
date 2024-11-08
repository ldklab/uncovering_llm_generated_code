'use strict';

const hasProp = require('./hasProp');
const elementType = require('./elementType');
const eventHandlers = require('./eventHandlers');
const getProp = require('./getProp');
const getPropValue = require('./getPropValue');
const propName = require('./propName');

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
