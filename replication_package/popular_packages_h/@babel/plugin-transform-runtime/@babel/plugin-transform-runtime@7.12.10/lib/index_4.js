"use strict";

const { declare } = require("@babel/helper-plugin-utils");
const { addDefault, isModule } = require("@babel/helper-module-imports");
const { types } = require("@babel/core");
const getRuntimePath = require("./get-runtime-path");
const runtimeCorejs2Definitions = require("./runtime-corejs2-definitions").default;
const runtimeCorejs3Definitions = require("./runtime-corejs3-definitions").default;
const { typeAnnotationToString } = require("./helpers");

function supportsStaticESM(caller) {
  return !!(caller?.supportsStaticESM);
}

module.exports = declare((api, options, dirname) => {
  api.assertVersion(7);

  const {
    corejs,
    helpers: useRuntimeHelpers = true,
    regenerator: useRuntimeRegenerator = true,
    useESModules = false,
    version: runtimeVersion = "7.0.0-beta.0",
    absoluteRuntime = false,
  } = options;

  let proposals = false, rawVersion;

  if (typeof corejs === "object" && corejs !== null) {
    rawVersion = corejs.version;
    proposals = Boolean(corejs.proposals);
  } else {
    rawVersion = corejs;
  }

  const corejsVersion = rawVersion ? Number(rawVersion) : false;
  validateOptions(corejsVersion, proposals, useRuntimeRegenerator, useRuntimeHelpers, useESModules, absoluteRuntime, runtimeVersion);

  const esModules = useESModules === "auto" ? api.caller(supportsStaticESM) : useESModules;
  const injectCoreJS2 = corejsVersion === 2;
  const injectCoreJS3 = corejsVersion === 3;
  const injectCoreJS = corejsVersion !== false;
  const moduleName = injectCoreJS3 ? "@babel/runtime-corejs3" : injectCoreJS2 ? "@babel/runtime-corejs2" : "@babel/runtime";
  const corejsRoot = injectCoreJS3 && !proposals ? "core-js-stable" : "core-js";

  const { BuiltIns, StaticProperties, InstanceProperties } = (injectCoreJS2 ? runtimeCorejs2Definitions : runtimeCorejs3Definitions)(runtimeVersion);
  const HEADER_HELPERS = ["interopRequireWildcard", "interopRequireDefault"];
  const modulePath = getRuntimePath(moduleName, dirname, absoluteRuntime);

  return {
    name: "transform-runtime",

    pre(file) {
      if (useRuntimeHelpers) {
        file.set("helperGenerator", (name) => {
          if (file.availableHelper && !file.availableHelper(name, runtimeVersion)) return;

          const isInteropHelper = HEADER_HELPERS.includes(name);
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
          cached = types.cloneNode(cached);
        } else {
          cached = addDefault(file.path, source, { importedInterop: "uncompiled", nameHint, blockHoist });
          cache.set(key, cached);
        }

        return cached;
      };
    },

    visitor: {
      ReferencedIdentifier(path) {
        handleReferencedIdentifier(path, injectCoreJS, useRuntimeRegenerator, BuiltIns, modulePath, corejsRoot);
      },
      CallExpression(path) {
        handleCallExpression(path, injectCoreJS, injectCoreJS3, InstanceProperties, StaticProperties, modulePath, corejsRoot);
      },
      BinaryExpression(path) {
        handleBinaryExpression(path, injectCoreJS, modulePath);
      },
      MemberExpression: {
        enter(path) {
          handleMemberExpressionEnter(path, injectCoreJS, injectCoreJS2, injectCoreJS3, StaticProperties, InstanceProperties, modulePath, corejsRoot);
        },
        exit(path) {
          handleMemberExpressionExit(path, injectCoreJS, BuiltIns, modulePath, corejsRoot);
        },
      },
    },
  };
});

function validateOptions(corejsVersion, proposals, useRuntimeRegenerator, useRuntimeHelpers, useESModules, absoluteRuntime, runtimeVersion) {
  if (![false, 2, 3].includes(corejsVersion)) {
    throw new Error(`The \`core-js\` version must be false, 2 or 3, but got ${JSON.stringify(corejsVersion)}.`);
  }

  if (proposals && (!corejsVersion || corejsVersion < 3)) {
    throw new Error("The 'proposals' option is only supported when using 'corejs: 3'");
  }

  if (typeof useRuntimeRegenerator !== "boolean") {
    throw new Error("The 'regenerator' option must be undefined, or a boolean.");
  }

  if (typeof useRuntimeHelpers !== "boolean") {
    throw new Error("The 'helpers' option must be undefined, or a boolean.");
  }

  if (typeof useESModules !== "boolean" && useESModules !== "auto") {
    throw new Error("The 'useESModules' option must be undefined, or a boolean, or 'auto'.");
  }

  if (typeof absoluteRuntime !== "boolean" && typeof absoluteRuntime !== "string") {
    throw new Error("The 'absoluteRuntime' option must be undefined, a boolean, or a string.");
  }

  if (typeof runtimeVersion !== "string") {
    throw new Error(`The 'version' option must be a version string.`);
  }
}

function handleReferencedIdentifier(path, injectCoreJS, useRuntimeRegenerator, BuiltIns, modulePath, corejsRoot) {
  const { node, parent } = path;
  const { name } = node;

  if (name === "regeneratorRuntime" && useRuntimeRegenerator) {
    path.replaceWith(this.addDefaultImport(`${modulePath}/regenerator`, "regeneratorRuntime"));
    return;
  }

  if (!injectCoreJS) return;
  if (types.isMemberExpression(parent)) return;
  if (!hasMapping(BuiltIns, name)) return;
  if (path.scope.getBindingIdentifier(name)) return;

  path.replaceWith(this.addDefaultImport(`${modulePath}/${corejsRoot}/${BuiltIns[name].path}`, name));
}

function handleCallExpression(path, injectCoreJS, injectCoreJS3, InstanceProperties, StaticProperties, modulePath, corejsRoot) {
  if (!injectCoreJS) return;

  const { node } = path;
  const { callee } = node;
  if (!types.isMemberExpression(callee)) return;

  const { object } = callee;
  const propertyName = resolvePropertyName(path.get("callee.property"), callee.computed);

  if (injectCoreJS3 && !hasStaticMapping(object.name, propertyName)) {
    if (hasMapping(InstanceProperties, propertyName) && maybeNeedsPolyfill(path.get("callee"), InstanceProperties, propertyName)) {
      let context1, context2;

      if (types.isIdentifier(object)) {
        context1 = object;
        context2 = types.cloneNode(object);
      } else {
        context1 = path.scope.generateDeclaredUidIdentifier("context");
        context2 = types.assignmentExpression("=", types.cloneNode(context1), object);
      }

      node.callee = types.memberExpression(
        types.callExpression(
          this.addDefaultImport(
            `${modulePath}/${corejsRoot}/instance/${InstanceProperties[propertyName].path}`,
            `${propertyName}InstanceProperty`
          ),
          [context2]
        ),
        types.identifier("call")
      );
      node.arguments.unshift(context1);
      return;
    }
  }

  if (node.arguments.length) return;
  if (!callee.computed) return;

  if (!path.get("callee.property").matchesPattern("Symbol.iterator")) {
    return;
  }

  path.replaceWith(
    types.callExpression(
      this.addDefaultImport(`${modulePath}/core-js/get-iterator`, "getIterator"),
      [object]
    )
  );
}

function handleBinaryExpression(path, injectCoreJS, modulePath) {
  if (!injectCoreJS) return;
  if (path.node.operator !== "in") return;
  if (!path.get("left").matchesPattern("Symbol.iterator")) return;

  path.replaceWith(
    types.callExpression(
      this.addDefaultImport(`${modulePath}/core-js/is-iterable`, "isIterable"),
      [path.node.right]
    )
  );
}

function handleMemberExpressionEnter(path, injectCoreJS, injectCoreJS2, injectCoreJS3, StaticProperties, InstanceProperties, modulePath, corejsRoot) {
  if (!injectCoreJS) return;
  if (!path.isReferenced()) return;
  if (path.parentPath.isUnaryExpression({ operator: "delete" })) return;

  const { node } = path;
  if (!types.isReferenced(node.object, node)) return;

  if (!injectCoreJS2 && node.computed && path.get("property").matchesPattern("Symbol.iterator")) {
    path.replaceWith(
      types.callExpression(
        this.addDefaultImport(`${modulePath}/core-js/get-iterator-method`, "getIteratorMethod"),
        [node.object]
      )
    );
    return;
  }

  const objectName = node.object.name;
  const propertyName = resolvePropertyName(path.get("property"), node.computed);

  if (path.scope.getBindingIdentifier(objectName) || !hasStaticMapping(objectName, propertyName)) {
    if (injectCoreJS3 && hasMapping(InstanceProperties, propertyName) && maybeNeedsPolyfill(path, InstanceProperties, propertyName)) {
      path.replaceWith(
        types.callExpression(
          this.addDefaultImport(
            `${modulePath}/${corejsRoot}/instance/${InstanceProperties[propertyName].path}`,
            `${propertyName}InstanceProperty`
          ),
          [node.object]
        )
      );
    }
    return;
  }

  path.replaceWith(
    this.addDefaultImport(
      `${modulePath}/${corejsRoot}/${StaticProperties[objectName][propertyName].path}`,
      `${objectName}$${propertyName}`
    )
  );
}

function handleMemberExpressionExit(path, injectCoreJS, BuiltIns, modulePath, corejsRoot) {
  if (!injectCoreJS) return;
  if (!path.isReferenced()) return;
  if (path.node.computed) return;

  const { node } = path;
  const { object } = node;
  const { name } = object;

  if (!hasMapping(BuiltIns, name)) return;
  if (path.scope.getBindingIdentifier(name)) return;

  path.replaceWith(
    types.memberExpression(
      this.addDefaultImport(`${modulePath}/${corejsRoot}/${BuiltIns[name].path}`, name),
      node.property
    )
  );
}

function hasMapping(methods, name) {
  return Object.prototype.hasOwnProperty.call(methods, name) && (proposals || methods[name].stable);
}

function hasStaticMapping(object, method) {
  return Object.prototype.hasOwnProperty.call(StaticProperties, object) && hasMapping(StaticProperties[object], method);
}

function maybeNeedsPolyfill(path, methods, name) {
  if (isNamespaced(path.get("object"))) return false;
  if (!methods[name].types) return true;

  const typeAnnotation = path.get("object").getTypeAnnotation();
  const type = typeAnnotationToString(typeAnnotation);

  if (!type) return true;
  return methods[name].types.some(typeName => typeName === type);
}

function resolvePropertyName(path, computed) {
  const { node } = path;

  if (!computed) return node.name;
  if (path.isStringLiteral()) return node.value;

  const result = path.evaluate();
  return result.value;
}

function isNamespaced(path) {
  const binding = path.scope.getBinding(path.node.name);
  return binding ? binding.path.isImportNamespaceSpecifier() : false;
}
