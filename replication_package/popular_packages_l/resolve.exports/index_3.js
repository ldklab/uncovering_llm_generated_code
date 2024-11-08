// resolve-exports.js

// Helper function to check and return satisfied conditions from given path conditions
function conditionsSatisfied(condArr, pathConditions) {
  for (let condition of condArr) {
    if (pathConditions[condition]) return pathConditions[condition];
  }
  return undefined;
}

// Resolves export conditions for a package entry
function resolveConditions(pkg, entry, options) {
  const pathConditions = pkg.exports[entry];
  if (!pathConditions) {
    throw new Error(`Missing "${entry}" specifier in "${pkg.name}" package`);
  }

  // Prioritize conditions: default, custom, require/import, browser/node
  const conditions = [
    'default',
    ...(options.conditions || []),
    options.require ? 'require' : 'import',
    options.browser ? 'browser' : 'node'
  ];

  const result = conditionsSatisfied(conditions, pathConditions);

  if (result) {
    return Array.isArray(result) ? result : [result]; // Ensure result is an array
  }

  throw new Error(`No known conditions for "${entry}" specifier in "${pkg.name}" package`);
}

// Resolves import specifiers from a package's imports map
function resolveImports(pkg, target, options) {
  const importsMap = pkg.imports || {};
  const pathConditions = importsMap[target];
  
  if (!pathConditions) {
    throw new Error(`Missing "${target}" specifier in "${pkg.name}" package`);
  }

  // Check conditions for imports: default, import, browser/node
  const conditions = [
    'default',
    'import',
    ...(options.browser ? ['browser'] : ['node'])
  ];

  const result = conditionsSatisfied(conditions, pathConditions);

  if (result) {
    return Array.isArray(result) ? result : [result];
  }

  throw new Error(`No known conditions for "${target}" specifier in "${pkg.name}" package`);
}

// API function for resolving exports based on entry and options
export function exports(pkg, entry = '.', options = {}) {
  if (!pkg.exports) return undefined;
  return resolveConditions(pkg, entry.startsWith('./') ? entry : `./${entry}`, options);
}

// API function for resolving imports based on entry and options
export function imports(pkg, target, options = {}) {
  if (!pkg.imports) return undefined;
  return resolveImports(pkg, target, options);
}

// Determine whether to resolve as import or export based on entry format
export function resolve(pkg, entry = '.', options = {}) {
  if (entry.startsWith('#')) {
    return imports(pkg, entry, options);
  }
  return exports(pkg, entry, options);
}

// Legacy resolution strategy for module resolution based on fields and browser overrides
export function legacy(pkg, options = {}) {
  const fields = options.fields || ['module', 'main'];
  const isBrowser = options.browser;

  if (isBrowser && pkg.browser && typeof pkg.browser === 'string') {
    return pkg.browser;
  } else {
    for (let field of fields) {
      if (pkg[field]) return pkg[field];
    }
  }

  return undefined;
}
