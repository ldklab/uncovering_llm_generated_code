"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.program = exports.expression = exports.statements = exports.statement = exports.smart = void 0;

var formatters = _loadModule(require("./formatters"));
var _builder = _loadDefault(require("./builder"));

function _loadDefault(module) {
  return module && module.__esModule ? module : { default: module };
}

function _loadModule(module) {
  if (module && module.__esModule) { 
    return module; 
  }
  let cache = _getModuleCache();
  if (cache.has(module)) {
    return cache.get(module);
  }

  let newObj = {};
  const hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
  for (let key in module) {
    if (Object.prototype.hasOwnProperty.call(module, key)) {
      let desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(module, key) : null;
      if (desc && (desc.get || desc.set)) {
        Object.defineProperty(newObj, key, desc);
      } else {
        newObj[key] = module[key];
      }
    }
  }
  newObj.default = module;
  if (cache) {
    cache.set(module, newObj);
  }
  return newObj;
}

function _getModuleCache() {
  if (typeof WeakMap !== "function") return null;
  let cache = new WeakMap();
  _getModuleCache = function () { return cache; };
  return cache;
}

const smart = (0, _builder.default)(formatters.smart);
exports.smart = smart;
const statement = (0, _builder.default)(formatters.statement);
exports.statement = statement;
const statements = (0, _builder.default)(formatters.statements);
exports.statements = statements;
const expression = (0, _builder.default)(formatters.expression);
exports.expression = expression;
const program = (0, _builder.default)(formatters.program);
exports.program = program;

var _default = Object.assign(smart.bind(undefined), {
  smart,
  statement,
  statements,
  expression,
  program,
  ast: smart.ast
});

exports.default = _default;
