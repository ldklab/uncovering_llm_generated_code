"use strict";

exports.__esModule = true;
exports.default = void 0;

const coreJsCompatData = require("core-js-compat/data").default;
const shippedProposals = require("./shipped-proposals").default;
const getModulesListForTargetVersion = require("core-js-compat/get-modules-list-for-target-version").default;
const { BuiltIns, StaticProperties, InstanceProperties, CommonInstanceDependencies, PromiseDependencies, PromiseDependenciesWithIterators, CommonIterators } = require("./built-in-definitions");
const { types, helperDefinePolyfillProvider } = require("@babel/core");
const { coreJSModule, isCoreJSSource, callMethod } = require("./utils");

const babelPluginCoreJS3 = helperDefinePolyfillProvider((babelAPI, options) => {
  const { getUtils, method, shouldInjectPolyfill, createMetaResolver, debug, babel } = babelAPI;
  const { version = 3, proposals, shippedProposals: sp } = options;
  
  const isWebpack = babel.caller((caller) => caller?.name === "babel-loader");
  const resolve = createMetaResolver({
    global: BuiltIns,
    static: StaticProperties,
    instance: InstanceProperties,
  });

  const available = new Set(getModulesListForTargetVersion(version));
  const coreJSPureBase = proposals ? "core-js-pure/features" : "core-js-pure/stable";

  const maybeInjectGlobal = (names, utils) => {
    names.forEach((name) => {
      if (shouldInjectPolyfill(name)) {
        debug(name);
        utils.injectGlobalImport(coreJSModule(name));
      }
    });
  };

  const maybeInjectPure = (desc, hint, utils, object) => {
    if (desc.pure && (!object || !desc.exclude?.includes(object)) && shouldInjectPolyfill(desc.name)) {
      return utils.injectDefaultImport(`${coreJSPureBase}/${desc.pure}.js`, hint);
    }
  };

  return {
    name: "corejs3",
    polyfills: coreJsCompatData,

    filterPolyfills(name) {
      if (!available.has(name)) return false;
      return proposals || method === "entry-global" || 
             (sp && shippedProposals.has(name)) || 
             !name.startsWith("esnext.");
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

      let { global: deps } = resolved.desc;

      if (resolved.kind !== "global" && meta.object && meta.placement === "prototype") {
        const objName = meta.object.toLowerCase();
        deps = deps.filter((m) => m.includes(objName) || CommonInstanceDependencies.has(m));
      }

      maybeInjectGlobal(deps, utils);
    },

    usagePure(meta, utils, path) {
      if (meta.kind === "in") {
        if (meta.key === "Symbol.iterator") {
          path.replaceWith(types.callExpression(utils.injectDefaultImport(coreJSModule("is-iterable"), "isIterable"), [path.node.right]));
        }
        return;
      }

      let isCall;

      if (meta.kind === "property") {
        if (!path.isMemberExpression() || !path.isReferenced()) return;
        isCall = path.parentPath.isCallExpression({ callee: path.node });

        if (meta.key === "Symbol.iterator") {
          if (!shouldInjectPolyfill("es.symbol.iterator")) return;

          const id = isCall 
            ? utils.injectDefaultImport(coreJSModule("get-iterator-method"), "getIteratorMethod") 
            : utils.injectDefaultImport(coreJSModule("get-iterator"), "getIterator");
          
          path.replaceWith(types.callExpression(id, isCall ? [path.node.object] : [path.object]));
          return;
        }
      }

      const resolved = resolve(meta);
      if (!resolved) return;

      const { kind, desc } = resolved;
      const id = maybeInjectPure(desc, kind === "instance" ? `${resolved.name}InstanceProperty` : resolved.name, utils, meta.object);

      if (!id) return;

      if (kind === "global" || kind === "static") {
        path.replaceWith(id);
      } else if (kind === "instance") {
        isCall ? callMethod(path, id) : path.replaceWith(types.callExpression(id, [path.node.object]));
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

exports.default = babelPluginCoreJS3;
