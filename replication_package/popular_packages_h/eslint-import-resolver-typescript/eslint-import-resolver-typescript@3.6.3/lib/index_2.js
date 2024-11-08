'use strict';

const fs = require('node:fs');
const path = require('node:path');
const isNodeCoreModule = require('@nolyfill/is-core-module');
const debug = require('debug')('eslint-import-resolver-typescript');
const enhancedResolve = require('enhanced-resolve');
const hash_js = require('eslint-module-utils/hash.js');
const fg = require('fast-glob');
const getTsconfig = require('get-tsconfig');
const isBunModule = require('is-bun-module');
const isGlob = require('is-glob');

const defNormalProp = (obj, key, value) => key in obj ? Object.defineProperty(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
const spreadValues = (a, b) => {
  for (const prop in b) {
    if (Object.prototype.hasOwnProperty.call(b, prop)) {
      defNormalProp(a, prop, b[prop]);
    }
  }
  if (Object.getOwnPropertySymbols) {
    for (const prop of Object.getOwnPropertySymbols(b)) {
      if (Object.prototype.propertyIsEnumerable.call(b, prop)) {
        defNormalProp(a, prop, b[prop]);
      }
    }
  }
  return a;
};
const spreadProps = (a, b) => Object.defineProperties(a, Object.getOwnPropertyDescriptors(b));

const defaultConditionNames = [
  "types", "import", "esm2020", "es2020", "es2015", "require", "node", 
  "node-addons", "browser", "default"
];
const defaultExtensions = [".ts", ".tsx", ".d.ts", ".js", ".jsx", ".json", ".node"];
const defaultExtensionAlias = {
  ".js": [".ts", ".tsx", ".d.ts", ".js"],
  ".jsx": [".tsx", ".d.ts", ".jsx"],
  ".cjs": [".cts", ".d.cts", ".cjs"],
  ".mjs": [".mts", ".d.mts", ".mjs"]
};
const defaultMainFields = [
  "types", "typings", "fesm2020", "fesm2015", "esm2020", "es2020", 
  "module", "jsnext:main", "main"
];

const interfaceVersion = 2;
const JS_EXT_PATTERN = /\.(?:[cm]js|jsx?)$/;
const RELATIVE_PATH_PATTERN = /^\.{1,2}(?:\/.*)?$/;

let previousOptionsHash, optionsHash, cachedOptions, prevCwd, mappersCachedOptions, mappers, resolverCachedOptions, resolver;

function digestHashObject(value) {
  return hash_js.hashObject(value || {}).digest("hex");
}

function resolve(source, file, options) {
  if (!cachedOptions || previousOptionsHash !== (optionsHash = digestHashObject(options))) {
    previousOptionsHash = optionsHash;
    cachedOptions = spreadProps(spreadValues({}, options), {
      conditionNames: options?.conditionNames || defaultConditionNames,
      extensions: options?.extensions || defaultExtensions,
      extensionAlias: options?.extensionAlias || defaultExtensionAlias,
      mainFields: options?.mainFields || defaultMainFields,
      fileSystem: new enhancedResolve.CachedInputFileSystem(fs, 5000),
      useSyncFileSystemCalls: true
    });
  }
  if (!resolver || resolverCachedOptions !== cachedOptions) {
    resolver = enhancedResolve.ResolverFactory.createResolver(cachedOptions);
    resolverCachedOptions = cachedOptions;
  }
  debug("looking for:", source);

  source = removeQuerystring(source);
  if (
    isNodeCoreModule(source) || isBunModule.isBunModule(source, process.versions.bun || "latest")
  ) {
    debug("matched core:", source);
    return { found: true, path: null };
  }
  
  initMappers(cachedOptions);
  const mappedPath = getMappedPath(source, file, cachedOptions.extensions, true);
  if (mappedPath) debug("matched ts path:", mappedPath);

  let foundNodePath;
  try {
    foundNodePath = resolver.resolveSync(
      {},
      path.dirname(path.resolve(file)),
      mappedPath || source
    ) || null;
  } catch {
    foundNodePath = null;
  }
  
  if (
    (JS_EXT_PATTERN.test(foundNodePath) || cachedOptions.alwaysTryTypes && !foundNodePath) &&
    !/^@types[/\\]/.test(source) &&
    !path.isAbsolute(source) &&
    !source.startsWith(".")
  ) {
    const definitelyTyped = resolve("@types" + path.sep + mangleScopedPackage(source), file, options);
    if (definitelyTyped.found) return definitelyTyped;
  }
  
  if (foundNodePath) {
    debug("matched node path:", foundNodePath);
    return { found: true, path: foundNodePath };
  }
  
  debug("didn't find ", source);
  return { found: false };
}

function removeQuerystring(id) {
  const querystringIndex = id.lastIndexOf("?");
  return querystringIndex >= 0 ? id.slice(0, querystringIndex) : id;
}

function isFile(path2) {
  try {
    return fs.existsSync(path2) && fs.statSync(path2).isFile();
  } catch {
    return false;
  }
}

function isModule(modulePath) {
  return modulePath && isFile(path.resolve(modulePath, "package.json"));
}

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
    paths = mappers.map(mapper => mapper && mapper(source).map(item =>
      [
        ...extensions.map(ext => `${item}${ext}`),
        ...originalExtensions.map(ext => `${item}/index${ext}`)
      ]
    )).flat(2).filter(mappedPath => {
      if (!mappedPath) return false;
      try {
        const stat = fs.statSync(mappedPath, { throwIfNoEntry: false });
        return stat?.isFile() || (stat?.isDirectory() && isModule(mappedPath));
      } catch {
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
      const resolved = (!isJs ? getMappedPath(source + ext, file) : null) || 
        getMappedPath(source + `/index${ext}`, file);
      if (resolved) return resolved;
    }
  }

  if (paths.length > 1) debug("found multiple matching ts paths:", paths);
  return paths[0];
}

function initMappers(options) {
  if (mappers && mappersCachedOptions === options && prevCwd === process.cwd()) return;

  prevCwd = process.cwd();
  const configPaths = Array.isArray(options?.project) ? options.project : [options?.project || process.cwd()];
  const ignore = ["!**/node_modules/**"];

  const projectPaths = [...new Set([
    ...configPaths.filter(path2 => !isGlob(path2)),
    ...fg.sync([...configPaths.filter(path2 => isGlob(path2)), ...ignore])
  ])];

  mappers = projectPaths.map(projectPath => {
    const tsconfigResult = isFile(projectPath) 
      ? getTsconfig.getTsconfig(path.dirname(projectPath), path.basename(projectPath)) 
      : getTsconfig.getTsconfig(projectPath);
    return tsconfigResult && getTsconfig.createPathsMatcher(tsconfigResult);
  });

  mappersCachedOptions = options;
}

function mangleScopedPackage(moduleName) {
  if (moduleName.startsWith("@")) {
    const replaceSlash = moduleName.replace(path.sep, "__");
    if (replaceSlash !== moduleName) return replaceSlash.slice(1);
  }
  return moduleName;
}

module.exports = {
  defaultConditionNames,
  defaultExtensionAlias,
  defaultExtensions,
  defaultMainFields,
  interfaceVersion,
  resolve
};
