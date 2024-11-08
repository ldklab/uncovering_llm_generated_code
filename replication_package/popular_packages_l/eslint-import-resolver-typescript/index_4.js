// eslint-import-resolver-typescript.js
const path = require('path');
const enhancedResolve = require('enhanced-resolve');

// Define default configurations for resolution
const configSettings = {
  conditionNames: [
    "types", "import", "esm2020", "es2020", "es2015", "require", 
    "node", "node-addons", "browser", "default"
  ],
  extensions: [
    ".ts", ".tsx", ".d.ts", ".js", ".jsx", ".json", ".node"
  ],
  extensionAlias: {
    ".js": [".ts", ".tsx", ".d.ts", ".js"],
    ".jsx": [".tsx", ".d.ts", ".jsx"],
    ".cjs": [".cts", ".d.cts", ".cjs"],
    ".mjs": [".mts", ".d.mts", ".mjs"]
  },
  mainFields: [
    "types", "typings", "fesm2020", "fesm2015", 
    "esm2020", "es2020", "module", "jsnext:main", "main"
  ]
};

// Function to resolve a module source based on a file and optional config
function resolveModuleSource(source, file, customConfig = {}) {
  const resolver = enhancedResolve.create({
    ...configSettings,
    ...customConfig
  });

  return new Promise((resolve, reject) => {
    resolver(path.dirname(file), source, (err, resolvedPath) => {
      if (err) reject(err);
      else resolve(resolvedPath);
    });
  });
}

// Return the ESLint interface version supported
function getInterfaceVersion() {
  return 2;
}

// High-level resolver function handling ESLint's dependency resolution requirements
function handleModuleResolution(source, file, customConfig) {
  return resolveModuleSource(source, file, customConfig)
    .then(path => ({ found: true, path }))
    .catch(() => ({ found: false }));
}

// Module exports
module.exports = {
  interfaceVersion: getInterfaceVersion,
  resolve: handleModuleResolution,
  ...configSettings
};
