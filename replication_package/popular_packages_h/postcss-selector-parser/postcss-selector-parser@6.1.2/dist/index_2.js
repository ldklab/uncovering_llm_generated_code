"use strict";

const Processor = require("./processor").default;
const selectors = require("./selectors");

function _getRequireWildcardCache(nodeInterop) {
  if (typeof WeakMap !== "function") return null; 
  const cacheBabelInterop = new WeakMap(); 
  const cacheNodeInterop = new WeakMap(); 
  return (nodeInterop ? cacheNodeInterop : cacheBabelInterop);
}

function _interopRequireWildcard(obj, nodeInterop) {
  if (!nodeInterop && obj && obj.__esModule) { 
    return obj; 
  } 
  if (obj === null || typeof obj !== "object" && typeof obj !== "function") { 
    return { "default": obj }; 
  } 
  const cache = _getRequireWildcardCache(nodeInterop); 
  if (cache && cache.has(obj)) { 
    return cache.get(obj); 
  } 
  const newObj = {}; 
  for (const key in obj) { 
    if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { 
        newObj[key] = obj[key]; 
    } 
  } 
  newObj["default"] = obj; 
  if (cache) { 
    cache.set(obj, newObj); 
  } 
  return newObj; 
}

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { "default": obj };
}

const parser = function(processor) {
  return new Processor(processor);
};

Object.assign(parser, selectors);
delete parser.__esModule;

module.exports = parser;
