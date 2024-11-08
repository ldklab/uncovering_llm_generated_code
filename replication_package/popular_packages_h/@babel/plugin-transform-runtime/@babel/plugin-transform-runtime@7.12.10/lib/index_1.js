"use strict";

import { declare } from "@babel/helper-plugin-utils";
import { addDefault, isModule } from "@babel/helper-module-imports";
import * as core from "@babel/core";
import runtimeCorejs2Definitions from "./runtime-corejs2-definitions";
import runtimeCorejs3Definitions from "./runtime-corejs3-definitions";
import { typeAnnotationToString } from "./helpers";
import getRuntimePath from "./get-runtime-path";

function supportsStaticESM(caller) {
  return !!(caller?.supportsStaticESM);
}

export default declare((api, options, dirname) => {
  api.assertVersion(7);

  const {
    corejs,
    helpers: useRuntimeHelpers = true,
    regenerator: useRuntimeRegenerator = true,
    useESModules = false,
    version: runtimeVersion = "7.0.0-beta.0",
    absoluteRuntime = false
  } = options;

  const rawVersion = typeof corejs === "object" ? corejs.version : corejs;
  const proposals = typeof corejs === "object" && corejs.proposals;
  const corejsVersion = rawVersion ? Number(rawVersion) : false;

  if (![false, 2, 3].includes(corejsVersion)) {
    throw new Error(`Invalid core-js version: ${JSON.stringify(rawVersion)}.`);
  }

  if (proposals && (!corejsVersion || corejsVersion < 3)) {
    throw new Error("Proposals only supported with corejs: 3");
  }

  const esModules = useESModules === "auto" ? api.caller(supportsStaticESM) : useESModules;
  const injectCoreJS2 = corejsVersion === 2;
  const injectCoreJS3 = corejsVersion === 3;
  const injectCoreJS = corejsVersion !== false;
  const moduleName = injectCoreJS3 ? "@babel/runtime-corejs3" : injectCoreJS2 ? "@babel/runtime-corejs2" : "@babel/runtime";
  const corejsRoot = injectCoreJS3 && !proposals ? "core-js-stable" : "core-js";
  const modulePath = getRuntimePath(moduleName, dirname, absoluteRuntime);
  
  const { BuiltIns, StaticProperties, InstanceProperties } = 
    (injectCoreJS2 ? runtimeCorejs2Definitions : runtimeCorejs3Definitions)(runtimeVersion);

  const HEADER_HELPERS = ["interopRequireWildcard", "interopRequireDefault"];

  return {
    name: "transform-runtime",

    pre(file) {
      if (useRuntimeHelpers) {
        file.set("helperGenerator", name => {
          if (file.availableHelper && !file.availableHelper(name, runtimeVersion)) return;

          const isInteropHelper = HEADER_HELPERS.indexOf(name) !== -1;
          const blockHoist = isInteropHelper && !isModule(file.path) ? 4 : undefined;
          const helpersDir = esModules && file.path.node.sourceType === "module" ? "helpers/esm" : "helpers";
          return this.addDefaultImport(`${modulePath}/${helpersDir}/${name}`, name, blockHoist);
        });
      }

      const cache = new Map();

      this.addDefaultImport = (source, nameHint, blockHoist) => {
        const cacheKey = isModule(file.path);
        const key = `${source}:${nameHint}:${cacheKey || ""}`;
        let cached = cache.get(key);

        if (cached) {
          cached = core.types.cloneNode(cached);
        } else {
          cached = addDefault(file.path, source, {
            importedInterop: "uncompiled",
            nameHint,
            blockHoist
          });
          cache.set(key, cached);
        }

        return cached;
      };
    },

    visitor: {
      ReferencedIdentifier(path) {
        const { node, parent, scope } = path;
        const { name } = node;

        if (name === "regeneratorRuntime" && useRuntimeRegenerator) {
          path.replaceWith(this.addDefaultImport(`${modulePath}/regenerator`, "regeneratorRuntime"));
          return;
        }

        if (!injectCoreJS) return;
        if (core.types.isMemberExpression(parent)) return;
        if (!has(BuiltIns, name)) return;
        if (scope.getBindingIdentifier(name)) return;
        path.replaceWith(this.addDefaultImport(`${modulePath}/${corejsRoot}/${BuiltIns[name].path}`, name));
      },

      CallExpression(path) {
        if (!injectCoreJS) return;
        const { node } = path;
        const { callee } = node;
        if (!core.types.isMemberExpression(callee)) return;
        const { object } = callee;
        const propertyName = resolvePropertyName(path.get("callee.property"), callee.computed);

        if (injectCoreJS3 && !hasStaticMapping(object.name, propertyName)) {
          if (hasMapping(InstanceProperties, propertyName) && maybeNeedsPolyfill(path.get("callee"), InstanceProperties, propertyName)) {
            let context1, context2;

            if (core.types.isIdentifier(object)) {
              context1 = object;
              context2 = core.types.cloneNode(object);
            } else {
              context1 = path.scope.generateDeclaredUidIdentifier("context");
              context2 = core.types.assignmentExpression("=", core.types.cloneNode(context1), object);
            }

            node.callee = core.types.memberExpression(core.types.callExpression(this.addDefaultImport(`${modulePath}/${corejsRoot}/instance/${InstanceProperties[propertyName].path}`, `${propertyName}InstanceProperty`), [context2]), core.types.identifier("call"));
            node.arguments.unshift(context1);
            return;
          }
        }

        if (node.arguments.length) return;
        if (!callee.computed) return;

        if (!path.get("callee.property").matchesPattern("Symbol.iterator")) {
          return;
        }

        path.replaceWith(core.types.callExpression(this.addDefaultImport(`${modulePath}/core-js/get-iterator`, "getIterator"), [object]));
      },

      BinaryExpression(path) {
        if (!injectCoreJS) return;
        if (path.node.operator !== "in") return;
        if (!path.get("left").matchesPattern("Symbol.iterator")) return;
        path.replaceWith(core.types.callExpression(this.addDefaultImport(`${modulePath}/core-js/is-iterable`, "isIterable"), [path.node.right]));
      },

      MemberExpression: {
        enter(path) {
          if (!injectCoreJS) return;
          if (!path.isReferenced()) return;
          if (path.parentPath.isUnaryExpression({ operator: "delete" })) return;
          const { node } = path;
          const { object } = node;
          if (!core.types.isReferenced(object, node)) return;

          if (!injectCoreJS2 && node.computed && path.get("property").matchesPattern("Symbol.iterator")) {
            path.replaceWith(core.types.callExpression(this.addDefaultImport(`${modulePath}/core-js/get-iterator-method`, "getIteratorMethod"), [object]));
            return;
          }

          const objectName = object.name;
          const propertyName = resolvePropertyName(path.get("property"), node.computed);

          if (path.scope.getBindingIdentifier(objectName) || !hasStaticMapping(objectName, propertyName)) {
            if (injectCoreJS3 && hasMapping(InstanceProperties, propertyName) && maybeNeedsPolyfill(path, InstanceProperties, propertyName)) {
              path.replaceWith(core.types.callExpression(this.addDefaultImport(`${modulePath}/${corejsRoot}/instance/${InstanceProperties[propertyName].path}`, `${propertyName}InstanceProperty`), [object]));
            }

            return;
          }

          path.replaceWith(this.addDefaultImport(`${modulePath}/${corejsRoot}/${StaticProperties[objectName][propertyName].path}`, `${objectName}$${propertyName}`));
        },

        exit(path) {
          if (!injectCoreJS) return;
          if (!path.isReferenced()) return;
          if (path.node.computed) return;
          const { node } = path;
          const { object } = node;
          const { name } = object;
          if (!has(BuiltIns, name)) return;
          if (path.scope.getBindingIdentifier(name)) return;
          path.replaceWith(core.types.memberExpression(this.addDefaultImport(`${modulePath}/${corejsRoot}/${BuiltIns[name].path}`, name), node.property));
        }
      }
    }
  };
});

function has(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

function hasMapping(methods, name) {
  return has(methods, name) && (proposals || methods[name].stable);
}

function hasStaticMapping(object, method) {
  return has(StaticProperties, object) && hasMapping(StaticProperties[object], method);
}

function isNamespaced(path) {
  const binding = path.scope.getBinding(path.node.name);
  return binding ? binding.path.isImportNamespaceSpecifier() : false;
}

function maybeNeedsPolyfill(path, methods, name) {
  if (isNamespaced(path.get("object"))) return false;
  if (!methods[name].types) return true;
  const typeAnnotation = path.get("object").getTypeAnnotation();
  const type = typeAnnotationToString(typeAnnotation);
  return !type || methods[name].types.includes(type);
}

function resolvePropertyName(path, computed) {
  const { node } = path;
  if (!computed) return node.name;
  if (path.isStringLiteral()) return node.value;
  const result = path.evaluate();
  return result.value;
}

