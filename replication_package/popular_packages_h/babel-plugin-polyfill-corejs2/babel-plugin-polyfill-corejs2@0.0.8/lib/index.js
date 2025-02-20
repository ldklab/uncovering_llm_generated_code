"use strict";

exports.__esModule = true;
exports.default = void 0;

var _corejs2BuiltIns = _interopRequireDefault(require("@babel/compat-data/corejs2-built-ins"));

var _builtInDefinitions = require("./built-in-definitions");

var _addPlatformSpecificPolyfills = _interopRequireDefault(require("./add-platform-specific-polyfills"));

var _helpers = require("./helpers");

var _helperDefinePolyfillProvider = _interopRequireDefault(require("@babel/helper-define-polyfill-provider"));

var _core = require("@babel/core");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const presetEnvCompat = "#__secret_key__@babel/preset-env__compatibility"; // $FlowIgnore

const has = Function.call.bind(Object.hasOwnProperty);

var _default = (0, _helperDefinePolyfillProvider.default)(function (api, {
  version: runtimeVersion = "7.0.0-beta.0",
  [presetEnvCompat]: {
    entryInjectRegenerator
  } = {}
}) {
  const resolve = api.createMetaResolver({
    global: _builtInDefinitions.BuiltIns,
    static: _builtInDefinitions.StaticProperties,
    instance: _builtInDefinitions.InstanceProperties
  });
  const {
    debug,
    shouldInjectPolyfill,
    method
  } = api;
  const polyfills = (0, _addPlatformSpecificPolyfills.default)(api.targets, method, _corejs2BuiltIns.default);
  const coreJSBase = method === "usage-pure" ? "core-js/library/fn" : "core-js/modules";

  function inject(name, utils) {
    if (typeof name === "string") {
      if (shouldInjectPolyfill(name)) {
        debug(name);
        utils.injectGlobalImport(`${coreJSBase}/${name}.js`);
      }

      return;
    }

    name.forEach(name => inject(name, utils));
  }

  function injectIfAvailable(name, utils) {
    // Some polyfills aren't always available, for example
    // web.dom.iterable when targeting node
    if (has(polyfills, name)) inject(name, utils);
  }

  function maybeInjectPure(desc, hint, utils) {
    const {
      pure,
      meta,
      name
    } = desc;

    if (!pure || !(0, _helpers.hasMinVersion)(meta && meta.minRuntimeVersion, runtimeVersion) || !shouldInjectPolyfill(name)) {
      return;
    }

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
      if (meta.kind === "in") {
        if (meta.key === "Symbol.iterator") {
          path.replaceWith(_core.types.callExpression(utils.injectDefaultImport(`${coreJSBase}/is-iterable.js`, "isIterable"), [path.node.right]));
        }

        return;
      }

      if (meta.kind === "property") {
        // We can't compile destructuring.
        if (!path.isMemberExpression()) return;
        if (!path.isReferenced()) return;

        if (meta.key === "Symbol.iterator" && shouldInjectPolyfill("es6.symbol") && path.parentPath.isCallExpression({
          callee: path.node
        }) && path.parent.arguments.length === 0) {
          path.parentPath.replaceWith(_core.types.callExpression(utils.injectDefaultImport(`${coreJSBase}/get-iterator.js`, "getIterator"), [path.node.object]));
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
      // yield*
      YieldExpression(path) {
        if (path.node.delegate) {
          injectIfAvailable("web.dom.iterable", api.getUtils(path));
        }
      },

      // for-of, [a, b] = c
      "ForOfStatement|ArrayPattern"(path) {
        _builtInDefinitions.CommonIterators.forEach(name => injectIfAvailable(name, api.getUtils(path)));
      }

    }
  };
});

exports.default = _default;