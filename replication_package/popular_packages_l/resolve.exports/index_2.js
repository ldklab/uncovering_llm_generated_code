// resolve-exports.js

// Function to check if any conditions are satisfied based on given condition names and path conditions
function conditionsSatisfied(condArr, pathConditions) {
  for (let condition of condArr) {
    if (pathConditions[condition]) return pathConditions[condition];
  }
  return undefined;
}

// Function to resolve export conditions for a package entry
function resolveConditions(pkg, entry, options) {
  const pathConditions = pkg.exports[entry];
  if (!pathConditions) throw new Error(`Missing "${entry}" specifier in "${pkg.name}" package`);

  // Define the search priority of conditions
  const conditions = ['default', ...(options.conditions || []), options.require ? 'require' : 'import', options.browser ? 'browser' : 'node'];
  const result = conditionsSatisfied(conditions, pathConditions);
  if (result) return Array.isArray(result) ? result : [result];

  throw new Error(`No known conditions for "${entry}" specifier in "${pkg.name}" package`);
}

// Function to resolve import conditions for a target module
function resolveImports(pkg, target, options) {
  const importsMap = pkg.imports || {};
  const pathConditions = importsMap[target];
  if (!pathConditions) throw new Error(`Missing "${target}" specifier in "${pkg.name}" package`);

  // Define the search priority of conditions for imports
  const conditions = ['default', 'import', ...(options.browser ? ['browser'] : ['node'])];
  const result = conditionsSatisfied(conditions, pathConditions);
  if (result) return Array.isArray(result) ? result : [result];

  throw new Error(`No known conditions for "${target}" specifier in "${pkg.name}" package`);
}

// Exported function to resolve exports for a package
export function exports(pkg, entry = '.', options = {}) {
  if (!pkg.exports) return undefined;
  return resolveConditions(pkg, entry.startsWith('./') ? entry : `./${entry}`, options);
}

// Exported function to resolve imports for a package
export function imports(pkg, target, options = {}) {
  if (!pkg.imports) return undefined;
  return resolveImports(pkg, target, options);
}

// Exported function to resolve either imports or exports based on entry prefix
export function resolve(pkg, entry = '.', options = {}) {
  if (entry.startsWith('#')) {
    return imports(pkg, entry, options);
  }
  return exports(pkg, entry, options);
}

// Exported function to resolve legacy module fields
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
