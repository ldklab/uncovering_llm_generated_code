"use strict";

exports.__esModule = true;
exports.default = void 0;

const corejs2BuiltIns = require("@babel/compat-data/corejs2-built-ins").default;
const { BuiltIns, StaticProperties, InstanceProperties, CommonIterators } = require("./built-in-definitions");
const addPlatformSpecificPolyfills = require("./add-platform-specific-polyfills").default;
const { hasMinVersion } = require("./helpers");
const definePolyfillProvider = require("@babel/helper-define-polyfill-provider").default;
const { types } = require("@babel/core");

const presetEnvCompat = "#__secret_key__@babel/preset-env__compatibility";

const hasOwn = Object.prototype.hasOwnProperty;

function createPolyfillProvider() {
  return definePolyfillProvider((api, options) => {
    const { version: runtimeVersion = "7.0.0-beta.0", [presetEnvCompat]: entryOptions = {} } = options;
    const { entryInjectRegenerator } = entryOptions;

    const resolveMeta = api.createMetaResolver({
      global: BuiltIns,
      static: StaticProperties,
      instance: InstanceProperties,
    });

    const polyfills = addPlatformSpecificPolyfills(api.targets, api.method, corejs2BuiltIns);
    const coreJSBase = api.method === "usage-pure" ? "core-js/library/fn" : "core-js/modules";

    const injectPolyfill = (name, utils) => {
      if (typeof name === "string") {
        if (api.shouldInjectPolyfill(name)) {
          api.debug(name);
          utils.injectGlobalImport(`${coreJSBase}/${name}.js`);
        }
      } else {
        name.forEach(subName => injectPolyfill(subName, utils));
      }
    };

    const maybeInjectPure = (desc, hint, utils) => {
      const { pure, meta, name } = desc;
      if (pure && hasMinVersion(meta?.minRuntimeVersion, runtimeVersion) && api.shouldInjectPolyfill(name)) {
        return utils.injectDefaultImport(`${coreJSBase}/${pure}.js`, hint);
      }
    };

    return {
      name: "corejs2",
      polyfills,

      entryGlobal(meta, utils, path) {
        if (meta.kind === "import" && meta.source === "core-js") {
          api.debug(null);
          injectPolyfill(Object.keys(polyfills), utils);

          if (entryInjectRegenerator) {
            utils.injectGlobalImport("regenerator-runtime/runtime.js");
          }

          path.remove();
        }
      },

      usageGlobal(meta, utils) {
        const resolved = resolveMeta(meta);
        if (!resolved) return;

        let dependencies = resolved.desc.global;
        if (resolved.kind !== "global" && meta.object && meta.placement === "prototype") {
          const lowercasedObject = meta.object.toLowerCase();
          dependencies = dependencies.filter(dep => dep.includes(lowercasedObject));
        }

        injectPolyfill(dependencies, utils);
      },

      usagePure(meta, utils, path) {
        if (meta.kind === "in") {
          if (meta.key === "Symbol.iterator") {
            path.replaceWith(types.callExpression(utils.injectDefaultImport(`${coreJSBase}/is-iterable.js`, "isIterable"), [path.node.right]));
          }
          return;
        }

        if (meta.kind === "property" && path.isMemberExpression() && path.isReferenced()) {
          if (meta.key === "Symbol.iterator" && api.shouldInjectPolyfill("es6.symbol") && path.parentPath.isCallExpression({ callee: path.node }) && path.parent.arguments.length === 0) {
            path.parentPath.replaceWith(types.callExpression(utils.injectDefaultImport(`${coreJSBase}/get-iterator.js`, "getIterator"), [path.node.object]));
            path.skip();
            return;
          }
        }

        const resolved = resolveMeta(meta);
        if (!resolved) return;
        const id = maybeInjectPure(resolved.desc, resolved.name, utils);
        if (id) path.replaceWith(id);
      },

      visitor: api.method === "usage-global" && {
        YieldExpression(path) {
          if (path.node.delegate) {
            injectPolyfillIfAvailable("web.dom.iterable", api.getUtils(path));
          }
        },
        "ForOfStatement|ArrayPattern"(path) {
          CommonIterators.forEach(name => injectPolyfillIfAvailable(name, api.getUtils(path)));
        }
      }
    };
  });
}

exports.default = createPolyfillProvider;
