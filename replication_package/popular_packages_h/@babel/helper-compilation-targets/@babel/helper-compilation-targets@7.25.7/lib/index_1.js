"use strict";

// Named exports
Object.defineProperty(exports, "__esModule", { value: true });
Object.defineProperty(exports, "TargetNames", {
  enumerable: true,
  get: function () { return _options.TargetNames; }
});
Object.defineProperty(exports, "filterItems", {
  enumerable: true,
  get: function () { return _filterItems.default; }
});
Object.defineProperty(exports, "getInclusionReasons", {
  enumerable: true,
  get: function () { return _debug.getInclusionReasons; }
});
Object.defineProperty(exports, "isRequired", {
  enumerable: true,
  get: function () { return _filterItems.isRequired; }
});
Object.defineProperty(exports, "prettifyTargets", {
  enumerable: true,
  get: function () { return _pretty.prettifyTargets; }
});
Object.defineProperty(exports, "unreleasedLabels", {
  enumerable: true,
  get: function () { return _targets.unreleasedLabels; }
});

// Default export
exports.default = getTargets;

// Imports
var _browserslist = require("browserslist");
var _helperValidatorOption = require("@babel/helper-validator-option");
var _nativeModules = require("@babel/compat-data/native-modules");
var _lruCache = require("lru-cache");
var _utils = require("./utils.js");
var _targets = require("./targets.js");
var _options = require("./options.js");
var _pretty = require("./pretty.js");
var _debug = require("./debug.js");
var _filterItems = require("./filter-items.js");

// Constants and Initialize Cache
const ESM_SUPPORT = _nativeModules["es6.module"];
const v = new _helperValidatorOption.OptionValidator("@babel/helper-compilation-targets");
const targetsCache = new _lruCache({ max: 64 });

// Utility for validating target names
function validateTargetNames(targets) {
  const validTargets = Object.keys(_options.TargetNames);
  Object.keys(targets).forEach(target => {
    if (!(target in _options.TargetNames)) {
      throw new Error(v.formatMessage(`'${target}' is not a valid target. Did you mean '${(0, _helperValidatorOption.findSuggestion)(target, validTargets)}'?`));
    }
  });
  return targets;
}

// Validate if the browser query is valid
function isBrowsersQueryValid(browsers) {
  return typeof browsers === "string" || (Array.isArray(browsers) && browsers.every(b => typeof b === "string"));
}

// Validate browsers input
function validateBrowsers(browsers) {
  v.invariant(browsers === undefined || isBrowsersQueryValid(browsers), `'${String(browsers)}' is not a valid browserslist query`);
  return browsers;
}

// Function to get lowest version numbers from browserslist output
function getLowestVersions(browsers) {
  return browsers.reduce((all, browser) => {
    const [browserName, browserVersion] = browser.split(" ");
    const target = _targets.browserNameMap[browserName];
    if (!target) return all;
    try {
      const splitVersion = browserVersion.split("-")[0].toLowerCase();
      const isSplitUnreleased = (0, _utils.isUnreleasedVersion)(splitVersion, target);
      if (!all[target]) {
        all[target] = isSplitUnreleased ? splitVersion : (0, _utils.semverify)(splitVersion);
      } else {
        const version = all[target];
        const isUnreleased = (0, _utils.isUnreleasedVersion)(version, target);
        if (isUnreleased && isSplitUnreleased) {
          all[target] = (0, _utils.getLowestUnreleased)(version, splitVersion, target);
        } else if (isUnreleased) {
          all[target] = (0, _utils.semverify)(splitVersion);
        } else {
          all[target] = (0, _utils.semverMin)(version, (0, _utils.semverify)(splitVersion));
        }
      }
    } catch (_) {} // Ignore errors
    return all;
  }, {});
}

// Output warning for decimal target versions
function outputDecimalWarning(decimalTargets) {
  if (!decimalTargets.length) return;
  console.warn("Warning, the following targets are using a decimal version:\n");
  decimalTargets.forEach(({ target, value }) => console.warn(`  ${target}: ${value}`));
  console.warn(`\nWe recommend using a string for minor/patch versions to avoid numbers like 6.10 getting parsed as 6.1, leading to unexpected behavior.`);
}

// Helper to verify and parse version
function semverifyTarget(target, value) {
  try {
    return (0, _utils.semverify)(value);
  } catch (_) {
    throw new Error(v.formatMessage(`'${value}' is not a valid value for 'targets.${target}'.`));
  }
}

// Parser for node target version
function nodeTargetParser(value) {
  const parsed = (value === true || value === "current") ? process.versions.node : semverifyTarget("node", value);
  return ["node", parsed];
}

// Default target parser function
function defaultTargetParser(target, value) {
  const version = (0, _utils.isUnreleasedVersion)(value, target) ? value.toLowerCase() : semverifyTarget(target, value);
  return [target, version];
}

// Generate targets from input
function generateTargets(inputTargets) {
  const input = Object.assign({}, inputTargets);
  delete input.esmodules;
  delete input.browsers;
  return input;
}

// Resolve target versions based on queries
function resolveTargets(queries, env) {
  const resolved = _browserslist(queries, { mobileToDesktop: true, env });
  return getLowestVersions(resolved);
}

// Cached version of resolveTargets function
function resolveTargetsCached(queries, env) {
  const cacheKey = typeof queries === "string" ? queries : queries.join() + env;
  let cached = targetsCache.get(cacheKey);
  if (!cached) {
    cached = resolveTargets(queries, env);
    targetsCache.set(cacheKey, cached);
  }
  return Object.assign({}, cached);
}

// Main function to get targets based on input
function getTargets(inputTargets = {}, options = {}) {
  let { browsers, esmodules } = inputTargets;
  const { configPath = ".", onBrowserslistConfigFound } = options;

  // Validate inputs
  validateBrowsers(browsers);
  const input = generateTargets(inputTargets);
  let targets = validateTargetNames(input);
  const shouldParseBrowsers = !!browsers;
  const hasTargets = shouldParseBrowsers || Object.keys(targets).length > 0;
  const shouldSearchForConfig = !options.ignoreBrowserslistConfig && !hasTargets;

  // Handle browsers list configuration
  if (!browsers && shouldSearchForConfig) {
    const configFile = options.configFile ?? _browserslist.findConfigFile(configPath);
    if (configFile) {
      onBrowserslistConfigFound?.(configFile);
      browsers = _browserslist.loadConfig({ config: configFile, env: options.browserslistEnv });
    }
    if (browsers == null) browsers = [];
  }

  // Handle ES Modules
  if (esmodules && (esmodules !== "intersect" || !(browsers?.length))) {
    browsers = Object.keys(ESM_SUPPORT).map(browser => `${browser} >= ${ESM_SUPPORT[browser]}`).join(", ");
    esmodules = false;
  }

  // Resolve query browsers
  if (browsers?.length) {
    const queryBrowsers = resolveTargetsCached(browsers, options.browserslistEnv);
    if (esmodules === "intersect") {
      Object.keys(queryBrowsers).forEach(browser => {
        if (browser !== "deno" && browser !== "ie") {
          const esmSupportVersion = ESM_SUPPORT[browser === "opera_mobile" ? "op_mob" : browser];
          if (esmSupportVersion) {
            const version = queryBrowsers[browser];
            queryBrowsers[browser] = (0, _utils.getHighestUnreleased)(version, (0, _utils.semverify)(esmSupportVersion), browser);
          } else {
            delete queryBrowsers[browser];
          }
        } else {
          delete queryBrowsers[browser];
        }
      });
    }
    targets = Object.assign(queryBrowsers, targets);
  }

  // Create target results and handle decimal warnings
  const result = {};
  const decimalWarnings = [];
  Object.keys(targets).sort().forEach(target => {
    const value = targets[target];
    if (typeof value === "number" && value % 1 !== 0) {
      decimalWarnings.push({ target, value });
    }
    const [parsedTarget, parsedValue] = target === "node" ? nodeTargetParser(value) : defaultTargetParser(target, value);
    if (parsedValue) {
      result[parsedTarget] = parsedValue;
    }
  });
  outputDecimalWarning(decimalWarnings);

  return result;
}

//# sourceMappingURL=index.js.map
