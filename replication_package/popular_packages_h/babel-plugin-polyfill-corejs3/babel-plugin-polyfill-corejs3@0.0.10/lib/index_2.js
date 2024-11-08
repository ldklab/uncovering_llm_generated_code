"use strict";

exports.__esModule = true;
exports.default = void 0;

const coreJsCompatData = require("core-js-compat/data").default;
const shippedProposals = require("./shipped-proposals").default;
const getModulesListForVersion = require("core-js-compat/get-modules-list-for-target-version").default;
const { BuiltIns, StaticProperties, InstanceProperties, CommonInstanceDependencies, PromiseDependencies, PromiseDependenciesWithIterators, CommonIterators } = require("./built-in-definitions");
const { coreJSModule, isCoreJSSource, callMethod, coreJSPureHelper } = require("./utils");
const { types: t } = require("@babel/core");
const definePolyfillProvider = require("@babel/helper-define-polyfill-provider").default;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = definePolyfillProvider(function ({
  getUtils,
  method,
  shouldInjectPolyfill,
  createMetaResolver,
  debug,
  babel
}, {
  version = 3,
  proposals,
  shippedProposals: useShippedProposals
}) {
  const isWebpack = babel.caller(caller => (caller == null ? void 0 : caller.name) === "babel-loader");
  const resolve = createMetaResolver({
    global: BuiltIns,
    static: StaticProperties,
    instance: InstanceProperties
  });
  const available = new Set(getModulesListForVersion(version));
  const coreJSPureBase = proposals ? "core-js-pure/features" : "core-js-pure/stable";
  
  const maybeInjectGlobal = (names, utils) => {
    names.forEach(name => {
      if (shouldInjectPolyfill(name)) {
        debug(name);
        utils.injectGlobalImport(coreJSModule(name));
      }
    });
  };

  const maybeInjectPure = (desc, hint, utils, object) => {
    if (desc.pure && !(object && desc.exclude && desc.exclude.includes(object)) && shouldInjectPolyfill(desc.name)) {
      return utils.injectDefaultImport(`${coreJSPureBase}/${desc.pure}.js`, hint);
    }
  };

  return {
    name: "corejs3",
    polyfills: coreJsCompatData,
    
    filterPolyfills(name) {
      if (!available.has(name)) return false;
      if (proposals || method === "entry-global") return true;
      return useShippedProposals && shippedProposals.has(name) || !name.startsWith("esnext.");
    },
    
    entryGlobal(meta, utils, path) {
      if (meta.kind === "import") {
        const modules = isCoreJSSource(meta.source);
        if (modules && !(modules.length === 1 && meta.source === coreJSModule(modules[0]) && shouldInjectPolyfill(modules[0]))) {
          maybeInjectGlobal(modules, utils);
          path.remove();
        }
      }
    },
    
    usageGlobal(meta, utils) {
      const resolved = resolve(meta);
      if (!resolved) return;
      let deps = resolved.desc.global;

      if (resolved.kind !== "global" && meta.object && meta.placement === "prototype") {
        const low = meta.object.toLowerCase();
        deps = deps.filter(m => m.includes(low) || CommonInstanceDependencies.has(m));
      }

      maybeInjectGlobal(deps, utils);
    },
    
    usagePure(meta, utils, path) {
      if (meta.kind === "in" && meta.key === "Symbol.iterator") {
        path.replaceWith(t.callExpression(utils.injectDefaultImport(coreJSPureHelper("is-iterable"), "isIterable"), [path.node.right]));
        return;
      }
      
      if (meta.kind === "property") {
        if (!path.isMemberExpression() || !path.isReferenced()) return;
        
        const isCall = path.parentPath.isCallExpression({ callee: path.node });
        
        if (meta.key === "Symbol.iterator" && shouldInjectPolyfill("es.symbol.iterator")) {
          if (isCall) {
            if (path.parent.arguments.length === 0) {
              path.parentPath.replaceWith(t.callExpression(utils.injectDefaultImport(coreJSPureHelper("get-iterator"), "getIterator"), [path.node.object]));
              path.skip();
            } else {
              callMethod(path, utils.injectDefaultImport(coreJSPureHelper("get-iterator-method"), "getIteratorMethod"));
            }
          } else {
            path.replaceWith(t.callExpression(utils.injectDefaultImport(coreJSPureHelper("get-iterator-method"), "getIteratorMethod"), [path.node.object]));
          }
          return;
        }
      }

      const resolved = resolve(meta);
      if (!resolved) return;
      
      const processInjection = (id) => {
        if (isCall) callMethod(path, id);
        else path.replaceWith(t.callExpression(id, [path.node.object]));
      };
      
      if (resolved.kind === "global") {
        const id = maybeInjectPure(resolved.desc, resolved.name, utils);
        if (id) path.replaceWith(id);
      } else if (resolved.kind === "static") {
        const id = maybeInjectPure(resolved.desc, resolved.name, utils, meta.object);
        if (id) path.replaceWith(id);
      } else if (resolved.kind === "instance") {
        const id = maybeInjectPure(resolved.desc, `${resolved.name}InstanceProperty`, utils, meta.object);
        if (id) processInjection(id);
      }
    },
    
    visitor: method === "usage-global" && {
      CallExpression(path) {
        if (path.get("callee").isImport()) {
          const utils = getUtils(path);
          const deps = isWebpack ? PromiseDependenciesWithIterators : PromiseDependencies;
          maybeInjectGlobal(deps, utils);
        }
      },
      
      Function(path) {
        if (path.node.async) maybeInjectGlobal(PromiseDependencies, getUtils(path));
      },
      
      "ForOfStatement|ArrayPattern"(path) {
        maybeInjectGlobal(CommonIterators, getUtils(path));
      },
      
      SpreadElement(path) {
        if (!path.parentPath.isObjectExpression()) maybeInjectGlobal(CommonIterators, getUtils(path));
      },
      
      YieldExpression(path) {
        if (path.node.delegate) maybeInjectGlobal(CommonIterators, getUtils(path));
      }
    }
  };
});
