'use strict';

const nodeToJson = require('./node2json');
const xmlToNodeobj = require('./xmlstr2xmlnode');
const { buildOptions } = require('./util');
const validator = require('./validator');
const { convertToJsonString } = require('./node2json_str');
const { convert2nimn } = require('../src/nimndata');
const j2xParser = require('./json2xml');

function print(xmlNode, indentation = '') {
  if (!xmlNode) return;
  
  console.log(`${indentation}{`);
  console.log(`${indentation}  "tagName": "${xmlNode.tagname}",`);
  if (xmlNode.parent) {
    console.log(`${indentation}  "parent": "${xmlNode.parent.tagname}",`);
  }
  console.log(`${indentation}  "val": "${xmlNode.val}",`);
  console.log(`${indentation}  "attrs": ${JSON.stringify(xmlNode.attrsMap, null, 4)},`);
  
  if (xmlNode.child) {
    console.log(`${indentation}"child": {`);
    const newIndentation = indentation + indentation;
    
    Object.entries(xmlNode.child).forEach(([key, node]) => {
      if (Array.isArray(node)) {
        console.log(`${indentation} "${key}" : [`);
        node.forEach(item => print(item, newIndentation));
        console.log(`${indentation}],`);
      } else {
        console.log(`${indentation} "${key}" : {`);
        print(node, newIndentation);
        console.log(`${indentation}},`);
      }
    });
    
    console.log(`${indentation}},`);
  }
  console.log(`${indentation}},`);
}

exports.parse = function(xmlData, options, validationOption = false) {
  if (validationOption) {
    validationOption = validationOption === true ? {} : validationOption;
    const validationResult = validator.validate(xmlData, validationOption);
    if (validationResult !== true) {
      throw new Error(validationResult.err.msg);
    }
  }
  
  options = buildOptions(options, xmlToNodeobj.defaultOptions, xmlToNodeobj.props);
  const nodeObject = xmlToNodeobj.getTraversalObj(xmlData, options);
  return nodeToJson.convertToJson(nodeObject, options);
};

exports.convertTonimn = convert2nimn;
exports.getTraversalObj = xmlToNodeobj.getTraversalObj;
exports.convertToJson = nodeToJson.convertToJson;
exports.convertToJsonString = convertToJsonString;
exports.validate = validator.validate;
exports.j2xParser = j2xParser;

exports.parseToNimn = function(xmlData, schema, options) {
  const nodeObject = exports.getTraversalObj(xmlData, options);
  return exports.convertTonimn(nodeObject, schema, options);
};
