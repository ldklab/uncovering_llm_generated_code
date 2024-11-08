function throwError(pkgName, specifier, hasConditions) {
    throw new Error(hasConditions 
        ? `No known conditions for "${specifier}" specifier in "${pkgName}" package` 
        : `Missing "${specifier}" specifier in "${pkgName}" package`);
}

function resolveSpecifier(pkgName, specifiers, request, conditions) {
    let result, matchedPath, potentialPaths = matchPath(request, pkgName), conditionSet = buildConditionSet(conditions);
    let matchedSpecifier = specifiers[potentialPaths];

    if (matchedSpecifier === undefined) {
        Object.keys(specifiers).forEach(specPath => {
            let currentPath;
            if (specPath.endsWith('/') && potentialPaths.startsWith(specPath)) {
                matchedPath = potentialPaths.substring(specPath.length);
                currentPath = specPath;
            } else if (specPath.includes('*') && new RegExp(specPath.replace('*', '(.*)')).test(potentialPaths)) {
                matchedPath = potentialPaths.replace(new RegExp(specPath.replace('*', '(.*)')), '$1');
                currentPath = specPath;
            }
            if (currentPath && (!matchedSpecifier || currentPath.length > matchedSpecifier.length)) {
                matchedSpecifier = currentPath;
            }
        });

        matchedSpecifier = specifiers[matchedSpecifier];
    }

    if (!matchedSpecifier) {
        throwError(pkgName, potentialPaths);
    }

    matchedPath && appendPath(result, matchedPath);
    result = matchConditions(matchedSpecifier, conditionSet) || throwError(pkgName, potentialPaths, true);
    
    return result;
}

function matchPath(pkgName, request) {
    if (pkgName === request || request === '.') return '.';
    return request.startsWith(`${pkgName}/`) ? request.slice(pkgName.length + 1) : `./${request}`;
}

function buildConditionSet(conditions) {
    let conditionSet = new Set(["default", ...(conditions.conditions || [])]);
    if (!conditions.unsafe) {
        conditionSet.add(conditions.require ? "require" : "import");
        conditionSet.add(conditions.browser ? "browser" : "node");
    }
    return conditionSet;
}

function matchConditions(value, conditionSet, paths = new Set()) {
    if (typeof value === 'string') {
        paths.add(value);
        return Array.from(paths);
    }

    if (Array.isArray(value)) {
        value.forEach(item => matchConditions(item, conditionSet, paths));
        return Array.from(paths);
    }

    for (let [key, val] of Object.entries(value)) {
        if (conditionSet.has(key)) {
            return matchConditions(val, conditionSet, paths);
        }
    }
}

function handleLegacy(pkg, options = {}) {
    const fields = options.fields || ["module", "main"];
    let browserField = options.browser;
    let fieldIndex = 0;

    if (browserField && !fields.includes('browser')) {
        fields.unshift('browser');
    }

    for (; fieldIndex < fields.length; fieldIndex++) {
        let fieldValue = pkg[fields[fieldIndex]];
        if (typeof fieldValue === 'string') {
            return `./${fieldValue.replace(/^\.?\//, '')}`;
        }
        if (typeof fieldValue === 'object' && fields[fieldIndex] === 'browser' && browserField) {
            return fieldValue[browserField] || throwError(pkg.name, browserField, true);
        }
    }
}

function handleExports(pkg, request, conditions) {
    let exports = pkg.exports;
    if (exports) {
        if (typeof exports === 'string') {
            exports = { ".": exports };
        }
        let specifiers = Object.entries(exports).some(([key]) => !key.startsWith('.'))
            ? { ".": exports }
            : exports;
        return resolveSpecifier(pkg.name, specifiers, request || '.', conditions);
    }
}

function handleImports(pkg, request, conditions) {
    if (pkg.imports) {
        return resolveSpecifier(pkg.name, pkg.imports, request, conditions);
    }
}

function resolve(pkg, request, conditions) {
    const resolvedSpecifier = matchPath(pkg.name, request || ".");
    if (resolvedSpecifier.startsWith('#')) {
        return handleImports(pkg, resolvedSpecifier, conditions);
    }
    return handleExports(pkg, resolvedSpecifier, conditions);
}

exports.exports = handleExports;
exports.imports = handleImports;
exports.legacy = handleLegacy;
exports.resolve = resolve;
