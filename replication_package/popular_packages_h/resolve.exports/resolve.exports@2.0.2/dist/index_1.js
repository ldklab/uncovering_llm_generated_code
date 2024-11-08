function throwError(pkg, specifier, unknown) {
    const message = unknown 
        ? `No known conditions for "${specifier}" specifier in "${pkg}" package`
        : `Missing "${specifier}" specifier in "${pkg}" package`;
    throw new Error(message);
}

function resolveSpecifier(pkgName, exportsMap, specifier, conditions) {
    let matchedPath, resolvedSpecifier = normalizeSpecifier(pkgName, specifier);
    
    const conditionSet = getConditionSet(conditions || {});
    let exportEntry = exportsMap[resolvedSpecifier];
    
    if (exportEntry === undefined) {
        let wildcardBase, longestWildcard, captured, regexMatch;
        for (let key in exportsMap) {
            if (wildcardBase && key.length < wildcardBase.length) continue;
            
            if (key.endsWith('/') && resolvedSpecifier.startsWith(key)) {
                captured = resolvedSpecifier.substring(key.length);
                wildcardBase = key;
            } else if (key.length > 1 && (regexMatch = key.match(/^\*(.*)\*$/))) {
                const pattern = new RegExp(`^${regexMatch[1]}(.*)${regexMatch[1]}`).exec(resolvedSpecifier);
                if (pattern && pattern[1]) {
                    captured = pattern[1];
                    wildcardBase = key;
                }
            }
        }
        exportEntry = exportsMap[wildcardBase];
        matchedPath = captured;
    }
    
    if (!exportEntry) {
        throwError(pkgName, resolvedSpecifier);
    }
    
    let resolvedPaths = selectExportPaths(exportEntry, conditionSet);
    if (!resolvedPaths) {
        throwError(pkgName, resolvedSpecifier, true);
    }
    
    if (matchedPath) {
        prependMatchedPath(resolvedPaths, matchedPath);
    }
    
    return resolvedPaths;
}

function normalizeSpecifier(pkgName, specifier, optional=false) {
    if (pkgName === specifier || specifier === ".") return ".";

    const pkgPathPrefix = pkgName + "/";
    const isInsidePackage = specifier.startsWith(pkgPathPrefix);
    
    let normalized = isInsidePackage ? specifier.slice(pkgPathPrefix.length) : specifier;
    
    return normalized.startsWith("#") ? normalized : 
           (isInsidePackage || !optional ? 
           (normalized.startsWith("./") ? normalized : "./" + normalized) : normalized);
}

function getConditionSet(conditions) {
    const conditionSet = new Set(["default", ...(conditions.conditions || [])]);
    
    if (!conditions.unsafe) {
        conditionSet.add(conditions.require ? "require" : "import");
        conditionSet.add(conditions.browser ? "browser" : "node");
    }
    
    return conditionSet;
}

function selectExportPaths(exportEntry, conditionSet, resultSet = new Set()) {
    if (typeof exportEntry === 'string') {
        resultSet.add(exportEntry);
        return [exportEntry];
    }
    
    if (Array.isArray(exportEntry)) {
        exportEntry.forEach(entry => selectExportPaths(entry, conditionSet, resultSet));
        return resultSet.size ? [...resultSet] : undefined;
    }
    
    for (let condition in exportEntry) {
        if (conditionSet.has(condition)) {
            return selectExportPaths(exportEntry[condition], conditionSet, resultSet);
        }
    }
}

function prependMatchedPath(paths, match) {
    for (let i = 0; i < paths.length; i++) {
        if (paths[i].includes('*')) {
            paths[i] = paths[i].replace(/\*/, match);
        } else if (paths[i].endsWith('/')) {
            paths[i] += match;
        }
    }
}

function resolveLegacyFields(pkg, options = {}) {
    let entry, browserPath, idx = 0;
    const fields = options.fields || ["module", "main"];
    const browserField = options.browser;
    
    if (browserField) {
        fields.unshift("browser");
        browserPath = normalizeSpecifier(pkg.name, browserField, true);
    }
    
    while (idx < fields.length) {
        entry = pkg[fields[idx]];
        
        if (typeof entry === 'string') return "./" + entry.replace(/^\.\//, "");
        if (typeof entry === 'object' && fields[idx] === "browser") {
            if (browserPath && (entry = entry[browserPath], entry == null)) return browserPath;
            return typeof entry === 'string' ? "./" + entry.replace(/^\.\//, "") :entry;
        }
        idx++;
    }
}

function resolveExports(pkg, specifier, subpath, conditions) {
    const exports = pkg.exports;
    
    if (!exports) return;
    
    if (typeof exports === 'string') {
        exports = { ".": exports };
    } else {
        for (let key in exports) {
            if (!key.startsWith('.')) {
                exports = { ".": exports };
                break;
            }
        }
    }
    
    return resolveSpecifier(pkg.name, exports, subpath || ".", conditions);
}

function resolveImports(pkg, specifier, conditions) {
    return pkg.imports ? resolveSpecifier(pkg.name, pkg.imports, specifier, conditions) : undefined;
}

function resolvePackage(pkg, specifier, conditions) {
    const resolvedSpecifier = normalizeSpecifier(pkg.name, specifier || ".");
    return resolvedSpecifier.startsWith('#') ? resolveImports(pkg, resolvedSpecifier, conditions) 
                                             : resolveExports(pkg, specifier, conditions);
}

exports.exports = resolveExports;
exports.imports = resolveImports;
exports.legacy = resolveLegacyFields;
exports.resolve = resolvePackage;
