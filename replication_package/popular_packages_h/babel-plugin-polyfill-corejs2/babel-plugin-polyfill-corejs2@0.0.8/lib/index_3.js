"use strict";

exports.__esModule = true;
exports.default = void 0;

var corejs2BuiltIns = require("@babel/compat-data/corejs2-built-ins").default;
var { BuiltIns, StaticProperties, InstanceProperties, CommonIterators } = require("./built-in-definitions");
var addPlatformSpecificPolyfills = require("./add-platform-specific-polyfills").default;
var { hasMinVersion } = require("./helpers");
var definePolyfillProvider = require("@babel/helper-define-polyfill-provider").default;
var { types } = require("@babel/core");

const presetEnvCompat = "#__secret_key__@babel/preset-env__compatibility";
const has = Function.call.bind(Object.hasOwnProperty);

var _default = definePolyfillProvider(function (api, options) {
  const {
    version: runtimeVersion = "7.0.0-beta.0",
    [presetEnvCompat]: { entryInjectRegenerator } = {}
  } = options;
  
  const resolve = api.createMetaResolver({
    global: BuiltIns,
    static: StaticProperties,
    instance: InstanceProperties
  });
  
  const { debug, shouldInjectPolyfill, method } = api;
  const polyfills = addPlatformSpecificPolyfills(api.targets, method, corejs2BuiltIns);
  const coreJSBase = method === "usage-pure" ? "core-js/library/fn" : "core-js/modules";

  function inject(name, utils) {
    if (typeof name === "string" && shouldInjectPolyfill(name)) {
      debug(name);
      utils.injectGlobalImport(`${coreJSBase}/${name}.js`);
    } else if (Array.isArray(name)) {
      name.forEach(n => inject(n, utils));
    }
  }

  function injectIfAvailable(name, utils) {
    if (has(polyfills, name)) inject(name, utils);
  }

  function maybeInjectPure(desc, hint, utils) {
    const { pure, meta, name } = desc;
    if (pure && hasMinVersion(meta && meta.minRuntimeVersion, runtimeVersion) && shouldInjectPolyfill(name)) {
      return utils.injectDefaultImport(`${coreJSBase}/${pure}.js`, hint);
    }
  }

  return {
    name: "corejs2",
    polyfills,

    entryGlobal(meta, utils, path) {
      if (meta.kind === "import" && meta.source === "core-js") {
        debug(null);
        inject(Object.keys(polyfills), utils);
        if (entryInjectRegenerator) {
          utils.injectGlobalImport("regenerator-runtime/runtime.js");
        }
        path.remove();
      }
    },

    usageGlobal(meta, utils) {
      const resolved = resolve(meta);
      if (!resolved) return;
      let deps = resolved.desc.global;

      if (resolved.kind !== "global" && meta.object && meta.placement === "prototype") {
        const low = meta.object.toLowerCase();
        deps = deps.filter(m => m.includes(low));
      }

      inject(deps, utils);
    },

    usagePure(meta, utils, path) {
      if (meta.kind === "in" && meta.key === "Symbol.iterator") {
        const iterExpr = types.callExpression(utils.injectDefaultImport(`${coreJSBase}/is-iterable.js`, "isIterable"), [path.node.right]);
        path.replaceWith(iterExpr);
        return;
      }

      if (meta.kind === "property" && path.isMemberExpression() && path.isReferenced()) {
        if (meta.key === "Symbol.iterator" && shouldInjectPolyfill("es6.symbol") && path.parentPath.isCallExpression({ callee: path.node }) && path.parent.arguments.length === 0) {
          const iteratorExpr = types.callExpression(utils.injectDefaultImport(`${coreJSBase}/get-iterator.js`, "getIterator"), [path.node.object]);
          path.parentPath.replaceWith(iteratorExpr);
          path.skip();
          return;
        }
      }

      const resolved = resolve(meta);
      if (!resolved) return;
      const id = maybeInjectPure(resolved.desc, resolved.name, utils);
      if (id) path.replaceWith(id);
    },

    visitor: method === "usage-global" && {
      YieldExpression(path) {
        if (path.node.delegate) {
          injectIfAvailable("web.dom.iterable", api.getUtils(path));
        }
      },

      "ForOfStatement|ArrayPattern"(path) {
        CommonIterators.forEach(name => injectIfAvailable(name, api.getUtils(path));
      }
    }
  };
});

exports.default = _default;
