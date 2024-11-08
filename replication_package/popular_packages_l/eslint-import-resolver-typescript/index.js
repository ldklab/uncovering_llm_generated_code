// eslint-import-resolver-typescript.js
const path = require('path');
const fs = require('fs');
const enhancedResolve = require('enhanced-resolve');

const defaultConditionNames = [
  "types", "import", "esm2020", "es2020", "es2015", "require", 
  "node", "node-addons", "browser", "default"
];

const defaultExtensions = [
  ".ts", ".tsx", ".d.ts", ".js", ".jsx", ".json", ".node"
];

const defaultExtensionAlias = {
  ".js": [".ts", ".tsx", ".d.ts", ".js"],
  ".jsx": [".tsx", ".d.ts", ".jsx"],
  ".cjs": [".cts", ".d.cts", ".cjs"],
  ".mjs": [".mts", ".d.mts", ".mjs"]
};

const defaultMainFields = [
  "types", "typings", "fesm2020", "fesm2015", 
  "esm2020", "es2020", "module", "jsnext:main", "main"
];

function resolve(source, file, config = {}) {
  const resolver = enhancedResolve.create({
    extensions: config.extensions || defaultExtensions,
    conditionNames: config.conditionNames || defaultConditionNames,
    mainFields: config.mainFields || defaultMainFields,
    alias: config.extensionAlias || defaultExtensionAlias,
    ...config
  });

  return new Promise((resolve, reject) => {
    resolver(path.dirname(file), source, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
}

function interfaceVersion() {
  return 2;
}

function resolveModuleDependency(source, file, config) {
  return resolve(source, file, config)
    .then(res => ({
      found: true,
      path: res
    }))
    .catch(() => ({
      found: false
    }));
}

module.exports = {
  interfaceVersion,
  resolve: resolveModuleDependency,
  defaultConditionNames,
  defaultExtensions,
  defaultExtensionAlias,
  defaultMainFields
};
