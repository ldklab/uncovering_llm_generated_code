// eslint-import-resolver-typescript-rewrite.js
const path = require('path');
const enhancedResolve = require('enhanced-resolve');

const DEFAULT_CONDITIONS = [
  "types", "import", "esm2020", "es2020", "es2015", "require", 
  "node", "node-addons", "browser", "default"
];

const DEFAULT_EXTENSIONS = [
  ".ts", ".tsx", ".d.ts", ".js", ".jsx", ".json", ".node"
];

const DEFAULT_EXTENSION_ALIASES = {
  ".js": [".ts", ".tsx", ".d.ts", ".js"],
  ".jsx": [".tsx", ".d.ts", ".jsx"],
  ".cjs": [".cts", ".d.cts", ".cjs"],
  ".mjs": [".mts", ".d.mts", ".mjs"]
};

const DEFAULT_MAIN_FIELDS = [
  "types", "typings", "fesm2020", "fesm2015", 
  "esm2020", "es2020", "module", "jsnext:main", "main"
];

async function resolveModuleSource(source, file, config = {}) {
  const resolver = enhancedResolve.create({
    extensions: config.extensions || DEFAULT_EXTENSIONS,
    conditionNames: config.conditionNames || DEFAULT_CONDITIONS,
    mainFields: config.mainFields || DEFAULT_MAIN_FIELDS,
    alias: config.extensionAlias || DEFAULT_EXTENSION_ALIASES,
    ...config
  });

  return new Promise((resolve, reject) => {
    resolver(path.dirname(file), source, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
}

function getInterfaceVersion() {
  return 2;
}

async function resolveDependency(source, file, config) {
  try {
    const resolvedPath = await resolveModuleSource(source, file, config);
    return { found: true, path: resolvedPath };
  } catch {
    return { found: false };
  }
}

module.exports = {
  interfaceVersion: getInterfaceVersion,
  resolve: resolveDependency,
  defaultConditionNames: DEFAULT_CONDITIONS,
  defaultExtensions: DEFAULT_EXTENSIONS,
  defaultExtensionAlias: DEFAULT_EXTENSION_ALIASES,
  defaultMainFields: DEFAULT_MAIN_FIELDS
};
