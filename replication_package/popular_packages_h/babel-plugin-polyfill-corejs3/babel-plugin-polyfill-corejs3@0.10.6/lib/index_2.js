"use strict";

exports.__esModule = true;
exports.default = void 0;

const data = require("../core-js-compat/data.js").default;
const shippedProposals = require("./shipped-proposals").default;
const getModulesListForTargetVersion = require("../core-js-compat/get-modules-list-for-target-version.js").default;
const builtInDefs = require("./built-in-definitions");
const BabelRuntimePaths = require("./babel-runtime-corejs3-paths");
const usageFilters = require("./usage-filters").default;
const babel = require("@babel/core");
const utils = require("./utils");
const definePolyfillProvider = require("@babel/helper-define-polyfill-provider").default;

const { types: t } = babel || babel;

const presetEnvCompat = "#__secret_key__@babel/preset-env__compatibility";
const runtimeCompat = "#__secret_key__@babel/runtime__compatibility";

const uniqueObjects = ["array", "string", "iterator", "async-iterator", "dom-collections"]
  .map(v => new RegExp(`[a-z]*\\.${v}\\..*`));

const esnextFallback = (name, cb) => {
  if (cb(name)) return true;
  if (!name.startsWith("es.")) return false;
  const fallback = `esnext.${name.slice(3)}`;
  if (!data[fallback]) return false;
  return cb(fallback);
};

const plugin = definePolyfillProvider(({
  getUtils,
  method,
  shouldInjectPolyfill,
  createMetaResolver,
  debug,
  babel
}, {
  version = 3,
  proposals,
  shippedProposals,
  [presetEnvCompat]: { noRuntimeName = false } = {},
  [runtimeCompat]: { useBabelRuntime = false, ext = ".js" } = {}
}) => {
  const isWebpack = babel.caller(caller => caller?.name === "babel-loader");
  const resolve = createMetaResolver({
    global: builtInDefs.BuiltIns,
    static: builtInDefs.StaticProperties,
    instance: builtInDefs.InstanceProperties
  });

  const available = new Set(getModulesListForTargetVersion(version));

  function getCoreJSPureBase(useProposalBase) {
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

  function maybeInjectGlobal(names, utils, fallback = true) {
    for (const name of names) {
      if (fallback) {
        esnextFallback(name, name => maybeInjectGlobalImpl(name, utils));
      } else {
        maybeInjectGlobalImpl(name, utils);
      }
    }
  }

  function maybeInjectPure(desc, hint, utils, object) {
    if (desc.pure && !(object && desc.exclude && desc.exclude.includes(object)) && 
        esnextFallback(desc.name, shouldInjectPolyfill)) {
      const { name } = desc;
      let useProposalBase = false;
      
      useProposalBase = (proposals || shippedProposals && name.startsWith("esnext.")) 
        || (name.startsWith("es.") && !available.has(name));
      
      if (useBabelRuntime && !(useProposalBase ? BabelRuntimePaths.proposals : BabelRuntimePaths.stable).has(desc.pure)) {
        return;
      }
      
      const coreJSPureBase = getCoreJSPureBase(useProposalBase);
      return utils.injectDefaultImport(`${coreJSPureBase}/${desc.pure}${ext}`, hint);
    }
  }

  function isFeatureStable(name) {
    if (name.startsWith("esnext.")) {
      const esName = `es.${name.slice(7)}`;
      return esName in data;
    }
    return true;
  }

  return {
    name: "corejs3",
    runtimeName: noRuntimeName ? null : utils.BABEL_RUNTIME,
    polyfills: data,
    filterPolyfills(name) {
      if (!available.has(name)) return false;
      if (proposals || method === "entry-global") return true;
      if (shippedProposals && shippedProposals.has(name)) {
        return true;
      }
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
        const stable = module.replace("esnext.", "es.");
        if (modulesSet.has(stable) && shouldInjectPolyfill(stable)) {
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
      if (usageFilters(resolved.desc, path)) return;
      let deps = resolved.desc.global;
      
      if (resolved.kind !== "global" && meta.object && meta.placement === "prototype") {
        const low = meta.object.toLowerCase();
        deps = deps.filter(m => uniqueObjects.some(v => v.test(m)) ? m.includes(low) : true);
      }
      maybeInjectGlobal(deps, utils);
      return true;
    },
    usagePure(meta, utils, path) {
      if (meta.kind === "in" && meta.key === "Symbol.iterator") {
        path.replaceWith(t.callExpression(utils.injectDefaultImport(utils.coreJSPureHelper("is-iterable", useBabelRuntime, ext), "isIterable"), [path.node.right]));
        return;
      }
      if (path.parentPath.isUnaryExpression({ operator: "delete" })) return;
      
      if (meta.kind === "property" && path.isMemberExpression() && path.isReferenced() && !path.isSuper &&
          !path.parentPath.isUpdateExpression()) {
        if (meta.key === "Symbol.iterator" && shouldInjectPolyfill("es.symbol.iterator")) {
          const { node, parent } = path;
          if (t.isCallExpression(parent, { callee: node }) && parent.arguments.length === 0) {
            path.parentPath.replaceWith(t.callExpression(utils.injectDefaultImport(utils.coreJSPureHelper("get-iterator", useBabelRuntime, ext), "getIterator"), [node.object]));
            path.skip();
          } else {
            utils.callMethod(path, utils.injectDefaultImport(utils.coreJSPureHelper("get-iterator-method", useBabelRuntime, ext), "getIteratorMethod"));
          }
        } else {
          path.replaceWith(t.callExpression(utils.injectDefaultImport(utils.coreJSPureHelper("get-iterator-method", useBabelRuntime, ext), "getIteratorMethod"), [path.node.object]));
        }
        return;
      }
      
      let resolved = resolve(meta);
      if (!resolved) return;
      if (usageFilters(resolved.desc, path)) return;

      if (useBabelRuntime && resolved.desc.pure && resolved.desc.pure.endsWith("/index")) {
        resolved = { ...resolved, desc: { ...resolved.desc, pure: resolved.desc.pure.slice(0, -6) } };
      }

      if (resolved.kind === "global") {
        const id = maybeInjectPure(resolved.desc, resolved.name, utils);
        if (id) path.replaceWith(id);
      } else if (resolved.kind === "static") {
        const id = maybeInjectPure(resolved.desc, resolved.name, utils, meta.object);
        if (id) path.replaceWith(id);
      } else if (resolved.kind === "instance") {
        const id = maybeInjectPure(resolved.desc, `${resolved.name}InstanceProperty`, utils, meta.object);
        if (!id) return;
        const { node } = path;
        if (t.isCallExpression(path.parent, { callee: node })) {
          utils.callMethod(path, id);
        } else {
          path.replaceWith(t.callExpression(id, [node.object]));
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
        if (path.node.decorators?.length || path.node.body.body.some(el => el.decorators?.length)) {
          maybeInjectGlobal(builtInDefs.DecoratorMetadataDependencies, getUtils(path));
        }
      }
    }
  };
});

exports.default = plugin;
