'use strict';

const hasProp = require('./hasProp').default;
const hasAnyProp = require('./hasProp').hasAnyProp;
const hasEveryProp = require('./hasProp').hasEveryProp;

const elementType = require('./elementType').default;

const eventHandlers = require('./eventHandlers').default;
const eventHandlersByType = require('./eventHandlers').eventHandlersByType;

const getProp = require('./getProp').default;

const getPropValue = require('./getPropValue').default;
const getLiteralPropValue = require('./getPropValue').getLiteralPropValue;

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
