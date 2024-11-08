// resolve-exports.js

function conditionsSatisfied(conditionsList, pathConditions) {
  for (let condition of conditionsList) {
    if (pathConditions[condition]) return pathConditions[condition];
  }
  return undefined;
}

function resolveConditions(pkg, entry, options) {
  const pathConditions = pkg.exports[entry];
  if (!pathConditions) throw new Error(`Missing "${entry}" specifier in "${pkg.name}" package`);

  const conditions = ['default', ...(options.conditions || []), options.require ? 'require' : 'import', options.browser ? 'browser' : 'node'];
  const result = conditionsSatisfied(conditions, pathConditions);
  if (result) return Array.isArray(result) ? result : [result];

  throw new Error(`No known conditions for "${entry}" specifier in "${pkg.name}" package`);
}

function resolveImports(pkg, target, options) {
  const importsMap = pkg.imports || {};
  const pathConditions = importsMap[target];
  if (!pathConditions) throw new Error(`Missing "${target}" specifier in "${pkg.name}" package`);

  const conditions = ['default', 'import', ...(options.browser ? ['browser'] : ['node'])];
  const result = conditionsSatisfied(conditions, pathConditions);
  if (result) return Array.isArray(result) ? result : [result];

  throw new Error(`No known conditions for "${target}" specifier in "${pkg.name}" package`);
}

export function exports(pkg, entry = '.', options = {}) {
  if (!pkg.exports) return undefined;
  return resolveConditions(pkg, entry.startsWith('./') ? entry : `./${entry}`, options);
}

export function imports(pkg, target, options = {}) {
  if (!pkg.imports) return undefined;
  return resolveImports(pkg, target, options);
}

export function resolve(pkg, entry = '.', options = {}) {
  return entry.startsWith('#') ? imports(pkg, entry, options) : exports(pkg, entry, options);
}

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
