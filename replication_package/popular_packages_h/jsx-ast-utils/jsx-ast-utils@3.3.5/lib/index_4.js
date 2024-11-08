'use strict';

const { default: hasProp, hasAnyProp, hasEveryProp } = require('./hasProp');
const elementType = require('./elementType').default;
const { default: eventHandlers, eventHandlersByType } = require('./eventHandlers');
const getProp = require('./getProp').default;
const { default: getPropValue, getLiteralPropValue } = require('./getPropValue');
const propName = require('./propName').default;

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
