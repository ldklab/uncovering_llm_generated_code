'use strict';

const validator = require('./validator');
const XMLParser = require('./xmlparser/XMLParser');
const XMLBuilder = require('./xmlbuilder/json2xml');

module.exports = {
  XMLParser,
  XMLValidator: validator,
  XMLBuilder
};
