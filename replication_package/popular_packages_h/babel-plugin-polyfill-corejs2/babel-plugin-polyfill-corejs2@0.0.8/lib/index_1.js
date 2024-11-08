"use strict";

exports.__esModule = true;
exports.default = void 0;

const corejsCompat = require("@babel/compat-data/corejs2-built-ins").default;
const { BuiltIns, StaticProperties, InstanceProperties, CommonIterators } = require("./built-in-definitions");
const getPlatformSpecificPolyfills = require("./add-platform-specific-polyfills").default;
const { hasMinVersion } = require("./helpers");
const definePolyfillProvider = require("@babel/helper-define-polyfill-provider").default;
const { types: babelTypes } = require("@babel/core");

const presetEnvCompat = "#__secret_key__@babel/preset-env__compatibility";
const objectHas = Function.call.bind(Object.hasOwnProperty);

const injectPolyfillProvider = definePolyfillProvider((api, { version: runtimeVersion = "7.0.0-beta.0", [presetEnvCompat]: { entryInjectRegenerator } = {} }) => {
  const resolver = api.createMetaResolver({
    global: BuiltIns,
    static: StaticProperties,
    instance: InstanceProperties
  });

  const { debug, shouldInjectPolyfill, method } = api;
  const polyfills = getPlatformSpecificPolyfills(api.targets, method, corejsCompat);
  const coreJSBase = method === "usage-pure" ? "core-js/library/fn" : "core-js/modules";

  function inject(name, utils) {
    if (typeof name === "string") {
      if (shouldInjectPolyfill(name)) {
        debug(name);
        utils.injectGlobalImport(`${coreJSBase}/${name}.js`);
      }
      return;
    }
    name.forEach(n => inject(n, utils));
  }

  function injectIfAvailable(name, utils) {
    if (objectHas(polyfills, name)) inject(name, utils);
  }

  function maybeInjectPure(desc, hint, utils) {
    const { pure, meta, name } = desc;
    if (!pure || !hasMinVersion(meta && meta.minRuntimeVersion, runtimeVersion) || !shouldInjectPolyfill(name)) return;
    return utils.injectDefaultImport(`${coreJSBase}/${pure}.js`, hint);
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
      const resolved = resolver(meta);
      if (!resolved) return;
      let deps = resolved.desc.global;

      if (resolved.kind !== "global" && meta.object && meta.placement === "prototype") {
        const lowerCaseObject = meta.object.toLowerCase();
        deps = deps.filter(dep => dep.includes(lowerCaseObject));
      }

      inject(deps, utils);
    },

    usagePure(meta, utils, path) {
      if (meta.kind === "in") {
        if (meta.key === "Symbol.iterator") {
          path.replaceWith(babelTypes.callExpression(
            utils.injectDefaultImport(`${coreJSBase}/is-iterable.js`, "isIterable"),
            [path.node.right]
          ));
        }
        return;
      }

      if (meta.kind === "property") {
        if (!path.isMemberExpression() || !path.isReferenced()) return;

        if (meta.key === "Symbol.iterator" && shouldInjectPolyfill("es6.symbol") && path.parentPath.isCallExpression({ callee: path.node }) && path.parent.arguments.length === 0) {
          path.parentPath.replaceWith(
            babelTypes.callExpression(
              utils.injectDefaultImport(`${coreJSBase}/get-iterator.js`, "getIterator"),
              [path.node.object]
            )
          );
          path.skip();
          return;
        }
      }

      const resolved = resolver(meta);
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
        CommonIterators.forEach(name => injectIfAvailable(name, api.getUtils(path)));
      }
    }
  };
});

exports.default = injectPolyfillProvider;
