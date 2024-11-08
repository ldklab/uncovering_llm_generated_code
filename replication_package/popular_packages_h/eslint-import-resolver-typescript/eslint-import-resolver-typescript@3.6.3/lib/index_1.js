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

const { globSync } = fg;
const IMPORTER_NAME = "eslint-import-resolver-typescript";
const log = debug(IMPORTER_NAME);
const DEFAULTS = {
  conditionNames: ["types", "import", "esm2020", "es2020", "es2015", "require", "node", "node-addons", "browser", "default"],
  extensions: [".ts", ".tsx", ".d.ts", ".js", ".jsx", ".json", ".node"],
  extensionAlias: {
    ".js": [".ts", ".tsx", ".d.ts", ".js"],
    ".jsx": [".tsx", ".d.ts", ".jsx"],
    ".cjs": [".cts", ".d.cts", ".cjs"],
    ".mjs": [".mts", ".d.mts", ".mjs"]
  },
  mainFields: ["types", "typings", "fesm2020", "fesm2015", "esm2020", "es2020", "module", "jsnext:main", "main"]
};
const interfaceVersion = 2;
const fileSystem = fs;
const JS_EXT_PATTERN = /\.(?:[cm]js|jsx?)$/;
const RELATIVE_PATH_PATTERN = /^\.{1,2}(?:\/.*)?$/;

let previousOptionsHash, optionsHash, cachedOptions, prevCwd, mappersCachedOptions, mappers, resolverCachedOptions, resolver;

const digestHashObject = value => hash_js.hashObject(value ?? {}).digest("hex");

function resolve(source, file, options) {
  if (!cachedOptions || previousOptionsHash !== (optionsHash = digestHashObject(options))) {
    previousOptionsHash = optionsHash;
    cachedOptions = {
      ...options,
      conditionNames: options?.conditionNames ?? DEFAULTS.conditionNames,
      extensions: options?.extensions ?? DEFAULTS.extensions,
      extensionAlias: options?.extensionAlias ?? DEFAULTS.extensionAlias,
      mainFields: options?.mainFields ?? DEFAULTS.mainFields,
      fileSystem: new enhancedResolve.CachedInputFileSystem(fileSystem, 5000),
      useSyncFileSystemCalls: true
    };
  }
  if (!resolver || resolverCachedOptions !== cachedOptions) {
    resolver = enhancedResolve.ResolverFactory.createResolver(cachedOptions);
    resolverCachedOptions = cachedOptions;
  }
  log("looking for:", source);
  source = removeQuerystring(source);
  const processBunVersion = process.versions.bun ?? "latest";
  if (isNodeCoreModule(source) || isBunModule.isBunModule(source, processBunVersion)) {
    log("matched core:", source);
    return { found: true, path: null };
  }
  initMappers(cachedOptions);
  const mappedPath = getMappedPath(source, file, cachedOptions.extensions, true);
  if (mappedPath) log("matched ts path:", mappedPath);

  let foundNodePath;
  try {
    foundNodePath = resolver.resolveSync({}, path.dirname(path.resolve(file)), mappedPath ?? source) || null;
  } catch {
    foundNodePath = null;
  }

  if ((JS_EXT_PATTERN.test(foundNodePath) || cachedOptions.alwaysTryTypes && !foundNodePath) &&
      !/^@types[/\\]/.test(source) && !path.isAbsolute(source) && !source.startsWith(".")) {
    const definitelyTyped = resolve("@types" + path.sep + mangleScopedPackage(source), file, options);
    if (definitelyTyped.found) return definitelyTyped;
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

const isFile = (path2) => {
  try {
    return fs.statSync(path2, { throwIfNoEntry: false })?.isFile() ?? false;
  } catch {
    return false;
  }
};

const isModule = (modulePath) => isFile(path.resolve(modulePath, "package.json"));

function getMappedPath(source, file, extensions = DEFAULTS.extensions, retry) {
  const originalExtensions = extensions;
  extensions = ["", ...extensions];
  let paths = [];

  if (RELATIVE_PATH_PATTERN.test(source)) {
    const resolved = path.resolve(path.dirname(file), source);
    if (isFile(resolved)) paths = [resolved];
  } else {
    paths = mappers.map(mapper => mapper?.(source).map(item => [
      ...extensions.map(ext => `${item}${ext}`),
      ...originalExtensions.map(ext => `${item}/index${ext}`)]))
    .flat(2)
    .filter(mappedPath => {
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
      const resolved = getMappedPath(basename + tsExt, file) || getMappedPath(basename + ".d" + (tsExt === ".tsx" ? ".ts" : tsExt), file);
      if (resolved) return resolved;
    }
    for (const ext of extensions) {
      const resolved = (isJs ? null : getMappedPath(source + ext, file)) || getMappedPath(source + `/index${ext}`, file);
      if (resolved) return resolved;
    }
  }

  if (paths.length > 1) log("found multiple matching ts paths:", paths);
  return paths[0];
}

function initMappers(options) {
  if (mappers && mappersCachedOptions === options && prevCwd === process.cwd()) return;

  prevCwd = process.cwd();
  const configPaths = typeof options.project === "string" ? [options.project] :
                      Array.isArray(options.project) ? options.project : [process.cwd()];
  const projectPaths = Array.from(new Set([
    ...configPaths.filter(path2 => !isGlob(path2)),
    ...globSync(configPaths.filter(path2 => isGlob(path2)).concat(["!**/node_modules/**"]))
  ]));

  mappers = projectPaths.map(projectPath => {
    const tsconfigResult = isFile(projectPath) ? 
      getTsconfig.getTsconfig(path.parse(projectPath).dir, path.parse(projectPath).base) : 
      getTsconfig.getTsconfig(projectPath);
    return tsconfigResult ? getTsconfig.createPathsMatcher(tsconfigResult) : undefined;
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

module.exports = {
  defaultConditionNames: DEFAULTS.conditionNames,
  defaultExtensionAlias: DEFAULTS.extensionAlias,
  defaultExtensions: DEFAULTS.extensions,
  defaultMainFields: DEFAULTS.mainFields,
  interfaceVersion: interfaceVersion,
  resolve: resolve
};
