'use strict';

const fs = require('node:fs');
const path = require('node:path');
const isNodeCoreModule = require('@nolyfill/is-core-module');
const debug = require('debug');
const enhancedResolve = require('enhanced-resolve');
const hash_js = require('eslint-module-utils/hash.js');
const fg = require('fast-glob');
const getTsconfig = require('get-tsconfig');
const isBunModule = require('is-bun-module');
const isGlob = require('is-glob');

const __defProp = Object.defineProperty;
const __defProps = Object.defineProperties;
const __getOwnPropDescs = Object.getOwnPropertyDescriptors;
const __getOwnPropSymbols = Object.getOwnPropertySymbols;
const __hasOwnProp = Object.prototype.hasOwnProperty;
const __propIsEnum = Object.prototype.propertyIsEnumerable;
const __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
const __spreadValues = (a, b) => {
  for (const prop in b || (b = {})) if (__hasOwnProp.call(b, prop)) __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols) for (const prop of __getOwnPropSymbols(b)) {
    if (__propIsEnum.call(b, prop)) __defNormalProp(a, prop, b[prop]);
  }
  return a;
};
const __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));

const { globSync } = fg;
const IMPORTER_NAME = "eslint-import-resolver-typescript";
const log = debug(IMPORTER_NAME);
const defaultConditionNames = ["types", "import", "esm2020", "es2020", "es2015", "require", "node", "node-addons", "browser", "default"];
const defaultExtensions = [".ts", ".tsx", ".d.ts", ".js", ".jsx", ".json", ".node"];
const defaultExtensionAlias = {
  ".js": [".ts", ".tsx", ".d.ts", ".js"],
  ".jsx": [".tsx", ".d.ts", ".jsx"],
  ".cjs": [".cts", ".d.cts", ".cjs"],
  ".mjs": [".mts", ".d.mts", ".mjs"]
};
const defaultMainFields = ["types", "typings", "fesm2020", "fesm2015", "esm2020", "es2020", "module", "jsnext:main", "main"];
const interfaceVersion = 2;
const JS_EXT_PATTERN = /\.(?:[cm]js|jsx?)$/;
const RELATIVE_PATH_PATTERN = /^\.{1,2}(?:\/.*)?$/;

let previousOptionsHash;
let optionsHash;
let cachedOptions;
let prevCwd;
let mappersCachedOptions;
let mappers;
let resolverCachedOptions;
let resolver;

const digestHashObject = value => hash_js.hashObject(value != null ? value : {}).digest("hex");

function resolve(source, file, options) {
  let _a, _b, _c, _d, _e;
  if (!cachedOptions || previousOptionsHash !== (optionsHash = digestHashObject(options))) {
    previousOptionsHash = optionsHash;
    cachedOptions = __spreadProps(__spreadValues({}, options), {
      conditionNames: (_a = options == null ? void 0 : options.conditionNames) != null ? _a : defaultConditionNames,
      extensions: (_b = options == null ? void 0 : options.extensions) != null ? _b : defaultExtensions,
      extensionAlias: (_c = options == null ? void 0 : options.extensionAlias) != null ? _c : defaultExtensionAlias,
      mainFields: (_d = options == null ? void 0 : options.mainFields) != null ? _d : defaultMainFields,
      fileSystem: new enhancedResolve.CachedInputFileSystem(fs, 5000),
      useSyncFileSystemCalls: true
    });
  }
  if (!resolver || resolverCachedOptions !== cachedOptions) {
    resolver = enhancedResolve.ResolverFactory.createResolver(cachedOptions);
    resolverCachedOptions = cachedOptions;
  }
  log("looking for:", source);
  source = removeQuerystring(source);
  if (isNodeCoreModule(source) || isBunModule.isBunModule(source, (_e = process.versions.bun) != null ? _e : "latest")) {
    log("matched core:", source);
    return { found: true, path: null };
  }
  initMappers(cachedOptions);
  const mappedPath = getMappedPath(source, file, cachedOptions.extensions, true);
  if (mappedPath) {
    log("matched ts path:", mappedPath);
  }
  let foundNodePath;
  try {
    foundNodePath = resolver.resolveSync({}, path.dirname(path.resolve(file)), mappedPath != null ? mappedPath : source) || null;
  } catch (e) {
    foundNodePath = null;
  }
  if ((JS_EXT_PATTERN.test(foundNodePath) || (cachedOptions.alwaysTryTypes && !foundNodePath)) && !/^@types[/\\]/.test(source) && !path.isAbsolute(source) && !source.startsWith(".")) {
    const definitelyTyped = resolve("@types" + path.sep + mangleScopedPackage(source), file, options);
    if (definitelyTyped.found) {
      return definitelyTyped;
    }
  }
  if (foundNodePath) {
    log("matched node path:", foundNodePath);
    return { found: true, path: foundNodePath };
  }
  log("didn't find ", source);
  return { found: false };
}

function removeQuerystring(id) {
  const querystringIndex = id.lastIndexOf("?");
  return querystringIndex >= 0 ? id.slice(0, querystringIndex) : id;
}

const isFile = path => {
  try {
    return !!(path && fs.statSync(path, { throwIfNoEntry: false })?.isFile());
  } catch (e) {
    return false;
  }
};

const isModule = modulePath => {
  return !!modulePath && isFile(path.resolve(modulePath, "package.json"));
};

function getMappedPath(source, file, extensions = defaultExtensions, retry) {
  const originalExtensions = extensions;
  extensions = ["", ...extensions];
  let paths = [];
  if (RELATIVE_PATH_PATTERN.test(source)) {
    const resolved = path.resolve(path.dirname(file), source);
    if (isFile(resolved)) {
      paths = [resolved];
    }
  } else {
    paths = mappers.map(mapper => mapper?.(source).map(item => [
      ...extensions.map(ext => `${item}${ext}`),
      ...originalExtensions.map(ext => `${item}/index${ext}`)
    ])).flat(2).filter(mappedPath => {
      if (!mappedPath) return false;
      try {
        const stat = fs.statSync(mappedPath, { throwIfNoEntry: false });
        return stat?.isFile() || (stat?.isDirectory() && isModule(mappedPath));
      } catch (e) {
        return false;
      }
    });
  }
  if (retry && paths.length === 0) {
    const isJs = JS_EXT_PATTERN.test(source);
    if (isJs) {
      const jsExt = path.extname(source);
      const tsExt = jsExt.replace("js", "ts");
      const basename = source.replace(JS_EXT_PATTERN, "");
      const resolved = getMappedPath(basename + tsExt, file) || getMappedPath(
        basename + ".d" + (tsExt === ".tsx" ? ".ts" : tsExt),
        file
      );
      if (resolved) return resolved;
    }
    for (const ext of extensions) {
      const resolved = !isJs ? getMappedPath(source + ext, file) : null || getMappedPath(source + `/index${ext}`, file);
      if (resolved) return resolved;
    }
  }
  if (paths.length > 1) {
    log("found multiple matching ts paths:", paths);
  }
  return paths[0];
}

function initMappers(options) {
  if (mappers && mappersCachedOptions === options && prevCwd === process.cwd()) return;
  prevCwd = process.cwd();
  const configPaths = typeof options.project === "string" ? [options.project] : Array.isArray(options.project) ? options.project : [process.cwd()];
  const ignore = ["!**/node_modules/**"];
  const projectPaths = [...new Set([
    ...configPaths.filter(path => !isGlob(path)),
    ...globSync([...configPaths.filter(path => isGlob(path)), ...ignore])
  ])];
  mappers = projectPaths.map(projectPath => {
    let tsconfigResult;
    if (isFile(projectPath)) {
      const { dir, base } = path.parse(projectPath);
      tsconfigResult = getTsconfig.getTsconfig(dir, base);
    } else {
      tsconfigResult = getTsconfig.getTsconfig(projectPath);
    }
    return tsconfigResult && getTsconfig.createPathsMatcher(tsconfigResult);
  });
  mappersCachedOptions = options;
}

function mangleScopedPackage(moduleName) {
  if (moduleName.startsWith("@")) {
    const replaceSlash = moduleName.replace(path.sep, "__");
    return replaceSlash !== moduleName ? replaceSlash.slice(1) : moduleName;
  }
  return moduleName;
}

exports.defaultConditionNames = defaultConditionNames;
exports.defaultExtensionAlias = defaultExtensionAlias;
exports.defaultExtensions = defaultExtensions;
exports.defaultMainFields = defaultMainFields;
exports.interfaceVersion = interfaceVersion;
exports.resolve = resolve;
