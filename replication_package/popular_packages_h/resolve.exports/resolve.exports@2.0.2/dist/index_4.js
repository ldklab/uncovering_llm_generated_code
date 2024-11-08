function throwError(packageName, specifier, isKnownCondition) {
    throw new Error(isKnownCondition 
        ? `No known conditions for "${specifier}" specifier in "${packageName}" package`
        : `Missing "${specifier}" specifier in "${packageName}" package`);
}

function resolveSpecifier(packageName, conditionMap, requestedSpecifier, envConditions) {
    let target, matchedSpecifier, matchedPattern;
    let resolvedSpecifier = resolvePath(packageName, requestedSpecifier);
    let conditionSet = createConditionSet(envConditions || {});
    let matchedExport = conditionMap[resolvedSpecifier];

    if (matchedExport === undefined) {
        let lengthMatch, wildcardMatch, patternMatch;
        
        for (let condSpecifier in conditionMap) {
            if (lengthMatch && condSpecifier.length < lengthMatch.length) continue;

            if (condSpecifier.endsWith("/") && resolvedSpecifier.startsWith(condSpecifier)) {
                matchedPattern = resolvedSpecifier.substring(condSpecifier.length);
                lengthMatch = condSpecifier;
            } else if (condSpecifier.length > 1) {
                let wildcardIndex = condSpecifier.indexOf("*", 1);
                if (~wildcardIndex) {
                    patternMatch = RegExp("^" + condSpecifier.slice(0, wildcardIndex) + "(.*)" + condSpecifier.slice(1 + wildcardIndex)).exec(resolvedSpecifier);
                    if (patternMatch && patternMatch[1] && (!lengthMatch || condSpecifier.length > lengthMatch.length)) {
                        matchedPattern = patternMatch[1];
                        lengthMatch = condSpecifier;
                    }
                }
            }
        }
        
        matchedExport = conditionMap[lengthMatch];
    }

    if (!matchedExport) throwError(packageName, resolvedSpecifier);

    target = findConditionMatch(matchedExport, conditionSet);

    if (!target) throwError(packageName, resolvedSpecifier, true);

    if (matchedPattern) appendPattern(target, matchedPattern);
    return target;
}

function resolvePath(base, specifier, allowPathFallback) {
    if (base === specifier || "." === specifier) return ".";
    let baseSlash = base + "/";
    let baseSlashLength = baseSlash.length;
    let isRelative = baseSlash === specifier.slice(0, baseSlashLength);

    let childSpecifier = isRelative ? specifier.slice(baseSlashLength) : specifier;

    if (childSpecifier.startsWith("#")) return childSpecifier;
    if (isRelative || !allowPathFallback) return "./" + (childSpecifier.startsWith("./") ? childSpecifier : ('./' + childSpecifier));

    return childSpecifier;
}

function createConditionSet(envConditions) {
    let conditionSet = new Set(["default", ...(envConditions.conditions || [])]);
    if (!envConditions.unsafe) {
        conditionSet.add(envConditions.require ? "require" : "import");
        conditionSet.add(envConditions.browser ? "browser" : "node");
    }
    return conditionSet;
}

function findConditionMatch(matchedExport, conditionSet, resultSet) {
    if (matchedExport) {
        if (typeof matchedExport === "string") {
            resultSet && resultSet.add(matchedExport);
            return [matchedExport];
        }

        if (Array.isArray(matchedExport)) {
            resultSet = resultSet || new Set();
            matchedExport.forEach(item => findConditionMatch(item, conditionSet, resultSet));
            if (!resultSet) return Array.from(resultSet);
        } else {
            for (let condition in matchedExport) {
                if (conditionSet.has(condition)) return findConditionMatch(matchedExport[condition], conditionSet, resultSet);
            }
        }
    }
}

function appendPattern(results, pattern) {
    let i = 0, len = results.length;
    let endsWithWildcard = /[*]/g;
    let endsWithSlash = /[/]$/;

    for (; i < len; i++) {
        let item = results[i];
        results[i] = endsWithWildcard.test(item) ? item.replace(endsWithWildcard, pattern) 
                     : endsWithSlash.test(item) ? item + pattern
                     : item;
    }
}

function legacyEntryResolve(packageData, { browser, fields = ["module", "main"] } = {}) {
    let entry, i = 0;
    let isStringBrowser = typeof browser === "string";

    if (browser && !fields.includes("browser")) {
        fields.unshift("browser");
        if (isStringBrowser) browser = resolvePath(packageData.name, browser, true);
    }

    for (; i < fields.length; i++) {
        if (entry = packageData[fields[i]]) {
            if (typeof entry === "string") return entry.startsWith(".") ? entry : './' + entry.replace(/^\.?\//, "");
            if (typeof entry === "object" && isStringBrowser && entry.browser === fields[i]) {
                return entry[browser] || null;
            }
        }
    }
}

function resolveExports(package, specifier, conditions) {
    let exports = package.exports;
    
    if (exports) {
        if (typeof exports === "string") exports = { ".": exports };
        
        for (let key in exports) {
            if (key[0] !== ".") {
                exports = { ".": exports };
                break;
            }
        }
        return resolveSpecifier(package.name, exports, specifier || ".", conditions);
    }
}

function resolveImports(package, specifier, conditions) {
    if (package.imports) {
        return resolveSpecifier(package.name, package.imports, specifier, conditions);
    }
}

function mainResolver(package, specifier, conditions) {
    specifier = resolvePath(package.name, specifier || ".");
    return specifier[0] === "#"
        ? resolveImports(package, specifier, conditions)
        : resolveExports(package, specifier, conditions);
}

exports.exports = resolveExports;
exports.imports = resolveImports;
exports.legacy = legacyEntryResolve;
exports.resolve = mainResolver;
