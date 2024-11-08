"use strict";

exports.__esModule = true;
exports.default = void 0;

const coreJsData = require("core-js-compat/data");
const shippedProposals = require("./shipped-proposals").default;
const getModulesListForTargetVersion = require("core-js-compat/get-modules-list-for-target-version").default;
const { BuiltIns, StaticProperties, InstanceProperties, PromiseDependencies, PromiseDependenciesWithIterators, CommonIterators, CommonInstanceDependencies } = require("./built-in-definitions");
const { types } = require("@babel/core");
const { coreJSModule, isCoreJSSource, coreJSPureHelper, callMethod } = require("./utils");
const definePolyfillProvider = require("@babel/helper-define-polyfill-provider").default;

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
  shippedProposals
}) {
  const isWebpack = babel.caller(c => c?.name === "babel-loader");
  const resolve = createMetaResolver({ global: BuiltIns, static: StaticProperties, instance: InstanceProperties });
  const available = new Set(getModulesListForTargetVersion(version));
  const coreJSPureBase = proposals ? "core-js-pure/features" : "core-js-pure/stable";

  function maybeInjectGlobal(names, utils) {
    names.forEach(name => {
      if (shouldInjectPolyfill(name)) {
        debug(name);
        utils.injectGlobalImport(coreJSModule(name));
      }
    });
  }

  function maybeInjectPure(desc, hint, utils, object) {
    if (desc.pure && (!object || !(desc.exclude || []).includes(object)) && shouldInjectPolyfill(desc.name)) {
      return utils.injectDefaultImport(`${coreJSPureBase}/${desc.pure}.js`, hint);
    }
  }

  return {
    name: "corejs3",
    polyfills: coreJsData.default,

    filterPolyfills(name) {
      if (!available.has(name)) return false;
      if (proposals || method === "entry-global") return true;
      return shippedProposals && shippedProposals.has(name) || !name.startsWith("esnext.");
    },

    entryGlobal(meta, utils, path) {
      if (meta.kind !== "import") return;
      const modules = isCoreJSSource(meta.source);
      if (!modules) return;
      if (modules.length === 1 && meta.source === coreJSModule(modules[0]) && shouldInjectPolyfill(modules[0])) {
        debug(null);
        return;
      }
      maybeInjectGlobal(modules, utils);
      path.remove();
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
        path.replaceWith(types.callExpression(utils.injectDefaultImport(coreJSPureHelper("is-iterable"), "isIterable"), [path.node.right]));
        return;
      }

      let isCall;
      if (meta.kind === "property") {
        if (!path.isMemberExpression() || !path.isReferenced()) return;
        isCall = path.parentPath.isCallExpression({ callee: path.node });

        if (meta.key === "Symbol.iterator") {
          if (!shouldInjectPolyfill("es.symbol.iterator")) return;

          if (isCall) {
            path.parent.arguments.length === 0 
              ? path.parentPath.replaceWith(types.callExpression(utils.injectDefaultImport(coreJSPureHelper("get-iterator"), "getIterator"), [path.node.object]))
              : callMethod(path, utils.injectDefaultImport(coreJSPureHelper("get-iterator-method"), "getIteratorMethod"));
          } else {
            path.replaceWith(types.callExpression(utils.injectDefaultImport(coreJSPureHelper("get-iterator-method"), "getIteratorMethod"), [path.node.object]));
          }
          return;
        }
      }

      const resolved = resolve(meta);
      if (!resolved) return;

      const { kind, desc, name } = resolved;
      const object = meta.object;
      const imported = kind === "global" 
        ? maybeInjectPure(desc, name, utils)
        : kind === "static"
          ? maybeInjectPure(desc, name, utils, object)
          : maybeInjectPure(desc, `${name}InstanceProperty`, utils, object);

      if (!imported) return;

      if (isCall) {
        callMethod(path, imported);
      } else {
        path.replaceWith(types.callExpression(imported, [path.node.object]));
      }
    },

    visitor: method === "usage-global" && {
      CallExpression(path) {
        if (path.get("callee").isImport()) {
          const utils = getUtils(path);
          maybeInjectGlobal(isWebpack ? PromiseDependenciesWithIterators : PromiseDependencies, utils);
        }
      },

      Function(path) {
        if (path.node.async) {
          maybeInjectGlobal(PromiseDependencies, getUtils(path));
        }
      },

      "ForOfStatement|ArrayPattern"(path) {
        maybeInjectGlobal(CommonIterators, getUtils(path));
      },

      SpreadElement(path) {
        if (!path.parentPath.isObjectExpression()) {
          maybeInjectGlobal(CommonIterators, getUtils(path));
        }
      },

      YieldExpression(path) {
        if (path.node.delegate) {
          maybeInjectGlobal(CommonIterators, getUtils(path));
        }
      }
    }
  };
});
