'use strict';

const XMLValidator = require('./validator');
const XMLParser = require('./xmlparser/XMLParser');
const JSONToXMLBuilder = require('./xmlbuilder/json2xml');

module.exports = {
  XMLParser,
  XMLValidator,
  XMLBuilder: JSONToXMLBuilder
};
