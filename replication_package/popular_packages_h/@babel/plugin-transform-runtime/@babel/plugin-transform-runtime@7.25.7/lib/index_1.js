"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var { declare } = require("@babel/helper-plugin-utils");
var { addDefault, isModule } = require("@babel/helper-module-imports");
var { types } = require("@babel/core");
var { hasMinVersion, resolveFSPath } = require("./helpers.js");
var getRuntimePath = require("./get-runtime-path/index.js");
var createPolyfillPlugins = require("./babel-7/index.cjs");

exports.default = declare((api, options, dirname) => {
  api.assertVersion(7);

  const {
    version: runtimeVersion = "7.0.0-beta.0",
    absoluteRuntime = false,
    moduleName = null
  } = options;

  if (typeof absoluteRuntime !== "boolean" && typeof absoluteRuntime !== "string") {
    throw new Error("The 'absoluteRuntime' option must be undefined, a boolean, or a string.");
  }

  if (typeof runtimeVersion !== "string") {
    throw new Error(`The 'version' option must be a version string.`);
  }

  if (moduleName !== null && typeof moduleName !== "string") {
    throw new Error("The 'moduleName' option must be null or a string.");
  }

  const DUAL_MODE_RUNTIME = "7.13.0";
  const supportsCJSDefault = hasMinVersion(DUAL_MODE_RUNTIME, runtimeVersion);

  if ("useBuiltIns" in options) {
    throw new Error("The 'useBuiltIns' option has been removed. Use the 'corejs' option to polyfill.");
  }

  if ("polyfill" in options) {
    throw new Error("The 'polyfill' option has been removed. Use the 'corejs' option to polyfill.");
  }

  const { useESModules = false } = options;
  if (typeof useESModules !== "boolean" && useESModules !== "auto") {
    throw new Error("The 'useESModules' option must be undefined, or a boolean, or 'auto'.");
  }

  const esModules = useESModules === "auto" ?
    api.caller(caller => !!(caller && caller.supportsStaticESM)) : useESModules;

  const { helpers: useRuntimeHelpers = true } = options;
  if (typeof useRuntimeHelpers !== "boolean") {
    throw new Error("The 'helpers' option must be undefined, or a boolean.");
  }

  const HEADER_HELPERS = new Set(["interopRequireWildcard", "interopRequireDefault"]);

  return {
    name: "transform-runtime",
    inherits: createPolyfillPlugins(options, runtimeVersion, absoluteRuntime),
    pre(file) {
      if (!useRuntimeHelpers) return;

      let modulePath;
      file.set("helperGenerator", name => {
        modulePath = modulePath || getRuntimePath(moduleName || file.get("runtimeHelpersModuleName") || "@babel/runtime", dirname, absoluteRuntime);

        if (!(file.availableHelper && file.availableHelper(name, runtimeVersion))) {
          if (name === "regeneratorRuntime") {
            return types.arrowFunctionExpression([], types.identifier("regeneratorRuntime"));
          }
          return;
        }

        const blockHoist = HEADER_HELPERS.has(name) && !isModule(file.path) ? 4 : undefined;
        let helperPath = `${modulePath}/helpers/${esModules && file.path.node.sourceType === "module" ? "esm/" + name : name}`;
        if (absoluteRuntime) helperPath = resolveFSPath(helperPath);
        
        return addDefaultImport(helperPath, name, blockHoist, true);
      });

      const cache = new Map();
      function addDefaultImport(source, nameHint, blockHoist, isHelper = false) {
        const cacheKey = isModule(file.path);
        const key = `${source}:${nameHint}:${cacheKey || ""}`;

        let cached = cache.get(key);
        if (cached) {
          cached = types.cloneNode(cached);
        } else {
          cached = addDefault(file.path, source, {
            importedInterop: isHelper && supportsCJSDefault ? "compiled" : "uncompiled",
            nameHint,
            blockHoist
          });
          cache.set(key, cached);
        }
        return cached;
      }
    }
  };
});
