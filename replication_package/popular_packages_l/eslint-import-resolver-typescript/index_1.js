const path = require('path');
const enhancedResolve = require('enhanced-resolve');

const resolveDefaults = {
  conditionNames: [
    "types", "import", "esm2020", "es2020", 
    "es2015", "require", "node", "node-addons", 
    "browser", "default"
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

function createResolver(config = {}) {
  return enhancedResolve.create({
    ...resolveDefaults,
    ...config
  });
}

async function resolve(source, file, config) {
  const resolver = createResolver(config);
  try {
    return await new Promise((resolve, reject) => {
      resolver(path.dirname(file), source, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  } catch (error) {
    throw error;
  }
}

function interfaceVersion() {
  return 2;
}

async function resolveModuleDependency(source, file, config) {
  try {
    const resolvedPath = await resolve(source, file, config);
    return { found: true, path: resolvedPath };
  } catch {
    return { found: false };
  }
}

module.exports = {
  interfaceVersion,
  resolve: resolveModuleDependency,
  ...resolveDefaults
};
