function generateError(packageName, specifier, knownCondition) {
    throw new Error(
        knownCondition
            ? `No known conditions for "${specifier}" specifier in "${packageName}" package`
            : `Missing "${specifier}" specifier in "${packageName}" package`
    );
}

function resolveSpecifier(packageName, exportsObject, targetSpecifier, conditions) {
    let resolvedSpecifier, pathFragment;
    const effectiveSpecifier = normalizeSpecifier(packageName, targetSpecifier);
    const possibleConditionsSet = generateConditionsSet(conditions || {});
    let entry = exportsObject[effectiveSpecifier];

    if (entry === undefined) {
        let matchedSpecifier;
        for (let key in exportsObject) {
            if (matchedSpecifier && key.length < matchedSpecifier.length) continue;
            if (key.endsWith("/") && effectiveSpecifier.startsWith(key)) {
                pathFragment = effectiveSpecifier.substring(key.length);
                matchedSpecifier = key;
            } else if (key.length > 1) {
                const wildcardIndex = key.indexOf("*", 1);
                if (wildcardIndex !== -1) {
                    const matchResult = new RegExp(`^${key.substring(0, wildcardIndex)}(.*)${key.substring(1 + wildcardIndex)}`).exec(effectiveSpecifier);
                    if (matchResult && matchResult[1]) {
                        pathFragment = matchResult[1];
                        matchedSpecifier = key;
                    }
                }
            }
        }
        entry = exportsObject[matchedSpecifier];
    }

    if (!entry) generateError(packageName, effectiveSpecifier);

    const resolvedPaths = matchConditions(entry, possibleConditionsSet);
    if (!resolvedPaths) generateError(packageName, effectiveSpecifier, true);

    if (pathFragment) appendPathFragment(resolvedPaths, pathFragment);
    return resolvedPaths;
}

function normalizeSpecifier(packageName, specifier, addDotSlash) {
    if (packageName === specifier || specifier === ".") return ".";
    const packagePrefix = packageName + "/";
    const startsWithPackage = specifier.startsWith(packagePrefix);

    const remainingPath = startsWithPackage ? specifier.slice(packagePrefix.length) : specifier;
    if (remainingPath.startsWith("#")) return remainingPath;
    if (startsWithPackage || !addDotSlash) return remainingPath.startsWith("./") ? remainingPath : `./${remainingPath}`;
    return remainingPath;
}

function matchConditions(entry, possibleConditionsSet, pathSet) {
    if (entry) {
        if (typeof entry === "string") {
            if (pathSet) pathSet.add(entry);
            return [entry];
        }

        if (Array.isArray(entry)) {
            const resultSet = pathSet || new Set();
            entry.forEach(item => matchConditions(item, possibleConditionsSet, resultSet));
            if (!pathSet && resultSet.size) {
                return [...resultSet];
            }
        } else {
            for (let condition in entry) {
                if (possibleConditionsSet.has(condition)) {
                    return matchConditions(entry[condition], possibleConditionsSet, pathSet);
                }
            }
        }
    }
}

function resolveLegacy(packageConfig, options = {}) {
    const fields = options.fields || ["module", "main"];
    const browserOption = options.browser;
    let browserSpecifier = typeof browserOption === "string" ? normalizeSpecifier(packageConfig.name, browserOption, true) : browserOption;
    if (browserOption && !fields.includes("browser")) fields.unshift("browser");

    for (let fieldIndex = 0; fieldIndex < fields.length; fieldIndex++) {
        let entryPoint = packageConfig[fields[fieldIndex]];
        if (typeof entryPoint === "string") {
            return `./${entryPoint.replace(/^\.?\//, "")}`;
        } else if (typeof entryPoint === "object" && fields[fieldIndex] === "browser") {
            if (typeof browserSpecifier === "string") {
                entryPoint = entryPoint[browserSpecifier];
                if (entryPoint != null) return entryPoint;
                return browserSpecifier;
            }
        }
    }
}

function handleExports(packageConfig, specifier, conditionOverrides) {
    let exportsMap;
    const packageExports = packageConfig.exports;
    if (packageExports) {
        if (typeof packageExports === "string") {
            exportsMap = { ".": packageExports };
        } else {
            for (let key in packageExports) {
                if (key[0] !== ".") {
                    exportsMap = { ".": packageExports };
                    break;
                }
            }
        }
        return resolveSpecifier(packageConfig.name, exportsMap, specifier || ".", conditionOverrides);
    }
}

function handleImports(packageConfig, importSpecifier, conditionOverrides) {
    if (packageConfig.imports) {
        return resolveSpecifier(packageConfig.name, packageConfig.imports, importSpecifier, conditionOverrides);
    }
}

function mainResolve(packageConfig, specifier, conditionOverrides) {
    const normalizedSpecifier = normalizeSpecifier(packageConfig.name, specifier || ".");
    if (normalizedSpecifier.startsWith("#")) {
        return handleImports(packageConfig, normalizedSpecifier, conditionOverrides);
    }
    return handleExports(packageConfig, normalizedSpecifier, conditionOverrides);
}

exports.exports = handleExports;
exports.imports = handleImports;
exports.legacy = resolveLegacy;
exports.resolve = mainResolve;
