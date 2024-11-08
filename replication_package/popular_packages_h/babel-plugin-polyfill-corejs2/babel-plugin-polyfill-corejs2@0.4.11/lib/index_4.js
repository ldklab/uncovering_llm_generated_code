"use strict";

exports.__esModule = true;
exports.default = void 0;

const corejs2BuiltIns = require("@babel/compat-data/corejs2-built-ins").default;
const { BuiltIns, StaticProperties, InstanceProperties, CommonIterators } = require("./built-in-definitions");
const addPlatformSpecificPolyfills = require("./add-platform-specific-polyfills").default;
const { hasMinVersion } = require("./helpers");
const { default: definePolyfillProvider } = require("@babel/helper-define-polyfill-provider");
const babel = require("@babel/core");
const { types: t } = babel.default || babel;

const BABEL_RUNTIME = "@babel/runtime-corejs2";
const presetEnvCompat = "#__secret_key__@babel/preset-env__compatibility";
const runtimeCompat = "#__secret_key__@babel/runtime__compatibility";

function hasOwn(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

const corejs2Provider = definePolyfillProvider((api, options) => {
  const { 
    [presetEnvCompat]: { entryInjectRegenerator = false, noRuntimeName = false } = {},
    [runtimeCompat]: { useBabelRuntime = false, runtimeVersion = "", ext = ".js" } = {}
  } = options;

  const resolve = api.createMetaResolver({
    global: BuiltIns,
    static: StaticProperties,
    instance: InstanceProperties
  });

  const { debug, shouldInjectPolyfill, method } = api;
  const polyfills = addPlatformSpecificPolyfills(api.targets, method, corejs2BuiltIns);
  const coreJSBase = useBabelRuntime ? `${BABEL_RUNTIME}/core-js` : method === "usage-pure" ? "core-js/library/fn" : "core-js/modules";

  function inject(name, utils) {
    if (Array.isArray(name)) {
      name.forEach(n => inject(n, utils));
      return;
    }
    
    if (typeof name === "string" && hasOwn(polyfills, name) && shouldInjectPolyfill(name)) {
      debug(name);
      utils.injectGlobalImport(`${coreJSBase}/${name}.js`);
    }
  }

  function maybeInjectPure(desc, hint, utils) {
    const { pure, meta, name } = desc;
    if (!pure || !shouldInjectPolyfill(name)) return;

    if (runtimeVersion && meta && meta.minRuntimeVersion && !hasMinVersion(meta.minRuntimeVersion, runtimeVersion)) {
      return;
    }

    if (useBabelRuntime && pure === "symbol/index") pure = "symbol";

    return utils.injectDefaultImport(`${coreJSBase}/${pure}${ext}`, hint);
  }

  return {
    name: "corejs2",
    runtimeName: noRuntimeName ? null : BABEL_RUNTIME,
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
      if (resolved.kind !== "global" && "object" in meta && meta.object && meta.placement === "prototype") {
        const low = meta.object.toLowerCase();
        deps = deps.filter(m => m.includes(low));
      }
      inject(deps, utils);
    },
    usagePure(meta, utils, path) {
      if (meta.kind === "in") {
        if (meta.key === "Symbol.iterator") {
          path.replaceWith(t.callExpression(
            utils.injectDefaultImport(`${coreJSBase}/is-iterable${ext}`, "isIterable"), 
            [path.node.right]
          ));
        }
        return;
      }

      if (path.parentPath.isUnaryExpression({ operator: "delete" })) return;

      if (meta.kind === "property") {
        if (!path.isMemberExpression() || !path.isReferenced()) return;

        if (meta.key === "Symbol.iterator" && shouldInjectPolyfill("es6.symbol") && 
            path.parentPath.isCallExpression({ callee: path.node }) && path.parentPath.node.arguments.length === 0) {
          path.parentPath.replaceWith(t.callExpression(
            utils.injectDefaultImport(`${coreJSBase}/get-iterator${ext}`, "getIterator"), 
            [path.node.object]
          ));
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
          inject("web.dom.iterable", api.getUtils(path));
        }
      },
      "ForOfStatement|ArrayPattern"(path) {
        CommonIterators.forEach(name => inject(name, api.getUtils(path)));
      }
    }
  };
});

exports.default = corejs2Provider;
