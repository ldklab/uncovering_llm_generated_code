"use strict";

exports.__esModule = true;
exports.default = void 0;

const coreJsData = require("core-js-compat/data").default;
const shippedProposals = require("./shipped-proposals").default;
const getModulesListForVersion = require("core-js-compat/get-modules-list-for-target-version").default;
const builtInDefinitions = require("./built-in-definitions");
const { caller, types } = require("@babel/core");
const utils = require("./utils");
const definePolyfillProvider = require("@babel/helper-define-polyfill-provider").default;

function _interopRequireDefault(obj) { 
    return obj && obj.__esModule ? obj : { default: obj }; 
}

const polyfillProvider = definePolyfillProvider((context, options) => {
    const { 
        getUtils, 
        method, 
        shouldInjectPolyfill, 
        createMetaResolver, 
        debug, 
        babel 
    } = context;
    const { 
        version = 3, 
        proposals, 
        shippedProposals 
    } = options;
    
    const isWebpack = babel.caller(caller => caller && caller.name === "babel-loader");
    const resolve = createMetaResolver({
        global: builtInDefinitions.BuiltIns,
        static: builtInDefinitions.StaticProperties,
        instance: builtInDefinitions.InstanceProperties
    });
    const available = new Set(getModulesListForVersion(version));
    const coreJSPureBase = proposals ? "core-js-pure/features" : "core-js-pure/stable";

    function maybeInjectGlobal(names, utils) {
        names.forEach(name => {
            if (shouldInjectPolyfill(name)) {
                debug(name);
                utils.injectGlobalImport(utils.coreJSModule(name));
            }
        });
    }

    function maybeInjectPure(desc, hint, utils, object) {
        if (desc.pure && !(object && desc.exclude && desc.exclude.includes(object)) && shouldInjectPolyfill(desc.name)) {
            return utils.injectDefaultImport(`${coreJSPureBase}/${desc.pure}.js`, hint);
        }
    }

    return {
        name: "corejs3",
        polyfills: coreJsData,

        filterPolyfills(name) {
            if (!available.has(name)) return false;
            if (proposals || method === "entry-global") return true;
            if (shippedProposals && shippedProposals.has(name)) {
                return true;
            }
            return !name.startsWith("esnext.");
        },

        entryGlobal(meta, utils, path) {
            if (meta.kind !== "import") return;
            const modules = utils.isCoreJSSource(meta.source);
            if (!modules) return;

            if (modules.length === 1 && meta.source === utils.coreJSModule(modules[0]) && shouldInjectPolyfill(modules[0])) {
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
                deps = deps.filter(m => m.includes(low) || builtInDefinitions.CommonInstanceDependencies.has(m));
            }

            maybeInjectGlobal(deps, utils);
        },

        usagePure(meta, utils, path) {
            if (meta.kind === "in") {
                if (meta.key === "Symbol.iterator") {
                    path.replaceWith(types.callExpression(utils.injectDefaultImport(utils.coreJSPureHelper("is-iterable"), "isIterable"), [path.node.right]));
                }
                return;
            }

            let isCall;

            if (meta.kind === "property") {
                if (!path.isMemberExpression()) return;
                if (!path.isReferenced()) return;
                isCall = path.parentPath.isCallExpression({ callee: path.node });

                if (meta.key === "Symbol.iterator") {
                    if (!shouldInjectPolyfill("es.symbol.iterator")) return;

                    if (isCall) {
                        if (path.parent.arguments.length === 0) {
                            path.parentPath.replaceWith(types.callExpression(utils.injectDefaultImport(utils.coreJSPureHelper("get-iterator"), "getIterator"), [path.node.object]));
                            path.skip();
                        } else {
                            utils.callMethod(path, utils.injectDefaultImport(utils.coreJSPureHelper("get-iterator-method"), "getIteratorMethod"));
                        }
                    } else {
                        path.replaceWith(types.callExpression(utils.injectDefaultImport(utils.coreJSPureHelper("get-iterator-method"), "getIteratorMethod"), [path.node.object]));
                    }

                    return;
                }
            }

            const resolved = resolve(meta);
            if (!resolved) return;

            if (resolved.kind === "global") {
                const id = maybeInjectPure(resolved.desc, resolved.name, utils);
                if (id) path.replaceWith(id);
            } else if (resolved.kind === "static") {
                const id = maybeInjectPure(resolved.desc, resolved.name, utils, meta.object);
                if (id) path.replaceWith(id);
            } else if (resolved.kind === "instance") {
                const id = maybeInjectPure(resolved.desc, `${resolved.name}InstanceProperty`, utils, meta.object);
                if (!id) return;

                if (isCall) {
                    utils.callMethod(path, id);
                } else {
                    path.replaceWith(types.callExpression(id, [path.node.object]));
                }
            }
        },

        visitor: method === "usage-global" && {
            CallExpression(path) {
                if (path.get("callee").isImport()) {
                    const utils = getUtils(path);

                    if (isWebpack) {
                        maybeInjectGlobal(builtInDefinitions.PromiseDependenciesWithIterators, utils);
                    } else {
                        maybeInjectGlobal(builtInDefinitions.PromiseDependencies, utils);
                    }
                }
            },

            Function(path) {
                if (path.node.async) {
                    maybeInjectGlobal(builtInDefinitions.PromiseDependencies, getUtils(path));
                }
            },

            "ForOfStatement|ArrayPattern"(path) {
                maybeInjectGlobal(builtInDefinitions.CommonIterators, getUtils(path));
            },

            SpreadElement(path) {
                if (!path.parentPath.isObjectExpression()) {
                    maybeInjectGlobal(builtInDefinitions.CommonIterators, getUtils(path));
                }
            },

            YieldExpression(path) {
                if (path.node.delegate) {
                    maybeInjectGlobal(builtInDefinitions.CommonIterators, getUtils(path));
                }
            }
        }
    };
});

exports.default = polyfillProvider;
