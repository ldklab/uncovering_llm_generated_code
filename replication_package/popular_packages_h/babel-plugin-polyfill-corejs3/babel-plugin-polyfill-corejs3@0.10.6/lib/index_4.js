"use strict";

exports.__esModule = true;
exports.default = void 0;

var coreJsData = _interopRequireDefault(require("../core-js-compat/data.js"));
var shippedProposalsData = _interopRequireDefault(require("./shipped-proposals"));
var getModulesList = _interopRequireDefault(require("../core-js-compat/get-modules-list-for-target-version.js"));
var builtInDefs = require("./built-in-definitions");
var BabelRuntimePaths = _interopRequireWildcard(require("./babel-runtime-corejs3-paths"));
var usageFilters = _interopRequireDefault(require("./usage-filters"));
var babelCore = _interopRequireWildcard(require("@babel/core"));
var utils = require("./utils");
var definePolyfillProvider = _interopRequireDefault(require("@babel/helper-define-polyfill-provider"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj, nodeInterop) {
  if (!nodeInterop && obj && obj.__esModule) return obj;
  if (obj === null || typeof obj !== "object" && typeof obj !== "function") return { default: obj };
  
  var cache = _getRequireWildcardCache(nodeInterop);
  if (cache && cache.has(obj)) return cache.get(obj);
  
  var newObj = {};
  for (var key in obj) {
    if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
      newObj[key] = obj[key];
    }
  }
  newObj.default = obj;
  if (cache) cache.set(obj, newObj);
  return newObj;
}

function _getRequireWildcardCache(nodeInterop) {
  if (typeof WeakMap !== "function") return null;
  var cacheBabelInterop = new WeakMap();
  var cacheNodeInterop = new WeakMap();
  return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop);
}

function _extends() {
  _extends = Object.assign ? Object.assign.bind() : function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends.apply(this, arguments);
}

const { types: t } = babelCore.default || babelCore;

const presetEnvCompatKey = "#__secret_key__@babel/preset-env__compatibility";
const runtimeCompatKey = "#__secret_key__@babel/runtime__compatibility";

const uniqueObjectRegex = ["array", "string", "iterator", "async-iterator", "dom-collections"]
  .map(v => new RegExp(`[a-z]*\\.${v}\\..*`));

const esnextFallbackCheck = (name, cb) => {
  if (cb(name)) return true;
  if (!name.startsWith("es.")) return false;
  
  const fallbackName = `esnext.${name.slice(3)}`;
  if (!coreJsData.default[fallbackName]) return false;
  return cb(fallbackName);
};

var _default = definePolyfillProvider.default(function ({
  getUtils, method, shouldInjectPolyfill, createMetaResolver, debug, babel
}, {
  version = 3,
  proposals,
  shippedProposals,
  [presetEnvCompatKey]: { noRuntimeName = false } = {},
  [runtimeCompatKey]: { useBabelRuntime = false, ext = ".js" } = {}
}) {
  const isWebpack = babel.caller(caller => (caller == null ? void 0 : caller.name) === "babel-loader");

  const resolve = createMetaResolver({
    global: builtInDefs.BuiltIns,
    static: builtInDefs.StaticProperties,
    instance: builtInDefs.InstanceProperties
  });

  const availableModules = new Set(getModulesList.default(version));

  function getCoreJsPureBase(useProposalBase) {
    return useBabelRuntime
      ? useProposalBase ? `${utils.BABEL_RUNTIME}/core-js` : `${utils.BABEL_RUNTIME}/core-js-stable`
      : useProposalBase ? "core-js-pure/features" : "core-js-pure/stable";
  }

  function maybeInjectGlobalImpl(name, utils) {
    if (shouldInjectPolyfill(name)) {
      debug(name);
      utils.injectGlobalImport(utils.coreJSModule(name), name);
      return true;
    }
    return false;
  }

  function maybeInjectGlobal(names, utils, allowFallback = true) {
    for (const name of names) {
      if (allowFallback) {
        esnextFallbackCheck(name, name => maybeInjectGlobalImpl(name, utils));
      } else {
        maybeInjectGlobalImpl(name, utils);
      }
    }
  }

  function maybeInjectPure(desc, hint, utils, object) {
    if (desc.pure && !(object && desc.exclude && desc.exclude.includes(object)) && esnextFallbackCheck(desc.name, shouldInjectPolyfill)) {
      const { name } = desc;
      const proposalBase = proposals || (shippedProposals && name.startsWith("esnext."));
      const stableBase = name.startsWith("es.") && !availableModules.has(name);
      
      if (useBabelRuntime && !(proposalBase || stableBase)) return;
      
      const coreJsPureBase = getCoreJsPureBase(proposalBase || stableBase);
      return utils.injectDefaultImport(`${coreJsPureBase}/${desc.pure}${ext}`, hint);
    }
  }

  function isFeatureStable(name) {
    if (name.startsWith("esnext.")) {
      const esName = `es.${name.slice(7)}`;
      return esName in coreJsData.default;
    }
    return true;
  }

  return {
    name: "corejs3",
    runtimeName: noRuntimeName ? null : utils.BABEL_RUNTIME,
    polyfills: coreJsData.default,
    filterPolyfills(name) {
      if (!availableModules.has(name)) return false;
      if (proposals || method === "entry-global") return true;
      if (shippedProposals && shippedProposalsData.default.has(name)) return true;
      return isFeatureStable(name);
    },
    entryGlobal(meta, utils, path) {
      if (meta.kind !== "import") return;
      
      const modules = utils.isCoreJSSource(meta.source);
      if (!modules) return;
      
      if (modules.length === 1 && meta.source === utils.coreJSModule(modules[0]) && shouldInjectPolyfill(modules[0])) {
        debug(null);
        return;
      }
      
      const modulesSet = new Set(modules);
      const filteredModules = modules.filter(module => {
        if (!module.startsWith("esnext.")) return true;
        
        const stableModule = module.replace("esnext.", "es.");
        if (modulesSet.has(stableModule) && shouldInjectPolyfill(stableModule)) {
          return false;
        }
        return true;
      });
      
      maybeInjectGlobal(filteredModules, utils, false);
      path.remove();
    },
    usageGlobal(meta, utils, path) {
      const resolved = resolve(meta);
      if (!resolved) return;
      
      if (usageFilters.default(resolved.desc, path)) return;
      
      const deps = resolved.desc.global;
      if (resolved.kind !== "global" && "object" in meta && meta.object && meta.placement === "prototype") {
        const lowercaseObj = meta.object.toLowerCase();
        deps = deps.filter(module => uniqueObjectRegex.some(regex => regex.test(module)) ? module.includes(lowercaseObj) : true);
      }
      
      maybeInjectGlobal(deps, utils);
      return true;
    },
    usagePure(meta, utils, path) {
      if (meta.kind === "in") {
        if (meta.key === "Symbol.iterator") {
          path.replaceWith(t.callExpression(
            utils.injectDefaultImport(utils.coreJSPureHelper("is-iterable", useBabelRuntime, ext), "isIterable"),
            [path.node.right]
          ));
        }
        return;
      }
      
      if (path.parentPath.isUnaryExpression({ operator: "delete" })) return;
      
      if (meta.kind === "property") {
        if (!path.isMemberExpression() || !path.isReferenced() || path.parentPath.isUpdateExpression() || t.isSuper(path.node.object)) return;
        
        if (meta.key === "Symbol.iterator" && shouldInjectPolyfill("es.symbol.iterator")) {
          const { parent, node } = path;
          
          if (t.isCallExpression(parent, { callee: node })) {
            if (parent.arguments.length === 0) {
              path.parentPath.replaceWith(t.callExpression(
                utils.injectDefaultImport(utils.coreJSPureHelper("get-iterator", useBabelRuntime, ext), "getIterator"),
                [node.object]
              ));
              path.skip();
            } else {
              utils.callMethod(path, utils.injectDefaultImport(utils.coreJSPureHelper("get-iterator-method", useBabelRuntime, ext), "getIteratorMethod"));
            }
          } else {
            path.replaceWith(t.callExpression(
              utils.injectDefaultImport(utils.coreJSPureHelper("get-iterator-method", useBabelRuntime, ext), "getIteratorMethod"),
              [path.node.object]
            ));
          }
          return;
        }
      }
      
      let resolved = resolve(meta);
      if (!resolved) return;
      
      if (usageFilters.default(resolved.desc, path)) return;
      
      if (useBabelRuntime && resolved.desc.pure && resolved.desc.pure.endsWith("/index")) {
        resolved = _extends({}, resolved, {
          desc: _extends({}, resolved.desc, {
            pure: resolved.desc.pure.slice(0, -6)
          })
        });
      }
      
      if (resolved.kind === "global") {
        const injectedId = maybeInjectPure(resolved.desc, resolved.name, utils);
        if (injectedId) path.replaceWith(injectedId);
      } else if (resolved.kind === "static") {
        const injectedId = maybeInjectPure(resolved.desc, resolved.name, utils, meta.object);
        if (injectedId) path.replaceWith(injectedId);
      } else if (resolved.kind === "instance") {
        const injectedId = maybeInjectPure(resolved.desc, `${resolved.name}InstanceProperty`, utils, meta.object);
        if (!injectedId) return;
        
        const { node } = path;
        if (t.isCallExpression(path.parent, { callee: node })) {
          utils.callMethod(path, injectedId);
        } else {
          path.replaceWith(t.callExpression(injectedId, [node.object]));
        }
      }
    },
    visitor: method === "usage-global" && {
      CallExpression(path) {
        if (path.get("callee").isImport()) {
          const utils = getUtils(path);
          if (isWebpack) {
            maybeInjectGlobal(builtInDefs.PromiseDependenciesWithIterators, utils);
          } else {
            maybeInjectGlobal(builtInDefs.PromiseDependencies, utils);
          }
        }
      },
      Function(path) {
        if (path.node.async) {
          maybeInjectGlobal(builtInDefs.PromiseDependencies, getUtils(path));
        }
      },
      "ForOfStatement|ArrayPattern"(path) {
        maybeInjectGlobal(builtInDefs.CommonIterators, getUtils(path));
      },
      SpreadElement(path) {
        if (!path.parentPath.isObjectExpression()) {
          maybeInjectGlobal(builtInDefs.CommonIterators, getUtils(path));
        }
      },
      YieldExpression(path) {
        if (path.node.delegate) {
          maybeInjectGlobal(builtInDefs.CommonIterators, getUtils(path));
        }
      },
      Class(path) {
        const hasDecorators = path.node.decorators?.length || path.node.body.body.some(el => el.decorators?.length);
        if (hasDecorators) {
          maybeInjectGlobal(builtInDefs.DecoratorMetadataDependencies, getUtils(path));
        }
      }
    }
  };
});

exports.default = _default;
