"use strict";

const { OptionValidator, findSuggestion } = require("@babel/helper-validator-option");
const { browserNameMap, unreleasedLabels } = require("./targets.js");
const { semverify, isUnreleasedVersion, semverMin, getLowestUnreleased, getHighestUnreleased } = require("./utils.js");
const browserslist = require("browserslist");
const nativeModules = require("@babel/compat-data/native-modules").es6.module;
const LRU = require("lru-cache");

const TARGET_NAMES = {
  // Define Target Names
};

function validateTargetNames(targets) {
  const validTargets = Object.keys(TARGET_NAMES);
  for (const target of Object.keys(targets)) {
    if (!TARGET_NAMES.hasOwnProperty(target)) {
      throw new Error(`'${target}' is not a valid target - Did you mean '${findSuggestion(target, validTargets)}'?`);
    }
  }
  return targets;
}

function isBrowsersQueryValid(browsers) {
  return typeof browsers === "string" || (Array.isArray(browsers) && browsers.every(b => typeof b === "string"));
}

function validateBrowsers(browsers) {
  if (browsers !== undefined && !isBrowsersQueryValid(browsers)) {
    throw new Error(`'${String(browsers)}' is not a valid browserslist query`);
  }
  return browsers;
}

function getLowestVersions(browsers) {
  return browsers.reduce((all, browser) => {
    const [browserName, browserVersion] = browser.split(" ");
    const target = browserNameMap[browserName];
    if (!target) return all;

    try {
      const splitVersion = browserVersion.split("-")[0].toLowerCase();
      const isSplitUnreleased = isUnreleasedVersion(splitVersion, target);
      if (!all[target]) {
        all[target] = isSplitUnreleased ? splitVersion : semverify(splitVersion);
        return all;
      }
      const version = all[target];
      const isUnreleased = isUnreleasedVersion(version, target);
      if (isUnreleased && isSplitUnreleased) {
        all[target] = getLowestUnreleased(version, splitVersion, target);
      } else if (isUnreleased) {
        all[target] = semverify(splitVersion);
      } else if (!isUnreleased && !isSplitUnreleased) {
        all[target] = semverMin(version, semverify(splitVersion));
      }
    } catch (e) {}
    return all;
  }, {});
}

function outputDecimalWarning(decimalTargets) {
  if (decimalTargets.length === 0) return;
  console.warn("Warning, the following targets use a decimal version:");
  decimalTargets.forEach(({ target, value }) => console.warn(`  ${target}: ${value}`));
  console.warn(`
We recommend using string versions for minor/patch versions to avoid parsing errors, e.g. 6.10 becoming 6.1.
`);
}

function semverifyTarget(target, value) {
  try {
    return semverify(value);
  } catch {
    throw new Error(`'${value}' is not a valid value for 'targets.${target}'.`);
  }
}

function nodeTargetParser(value) {
  const parsed = value === true || value === "current" ? process.versions.node : semverifyTarget("node", value);
  return ["node", parsed];
}

function defaultTargetParser(target, value) {
  const version = isUnreleasedVersion(value, target) ? value.toLowerCase() : semverifyTarget(target, value);
  return [target, version];
}

function generateTargets(inputTargets) {
  const copy = { ...inputTargets };
  delete copy.esmodules;
  delete copy.browsers;
  return copy;
}

function resolveTargets(queries, env) {
  const resolved = browserslist(queries, { mobileToDesktop: true, env });
  return getLowestVersions(resolved);
}

const targetsCache = new LRU({ max: 64 });

function resolveTargetsCached(queries, env) {
  const cacheKey = typeof queries === "string" ? queries : queries.join(",") + env;
  let cached = targetsCache.get(cacheKey);
  if (!cached) {
    cached = resolveTargets(queries, env);
    targetsCache.set(cacheKey, cached);
  }
  return { ...cached };
}

function getTargets(inputTargets = {}, options = {}) {
  const { configPath = ".", onBrowserslistConfigFound } = options;
  let { browsers, esmodules } = inputTargets;

  validateBrowsers(browsers);

  const input = generateTargets(inputTargets);
  let targets = validateTargetNames(input);

  if (!browsers && !options.ignoreBrowserslistConfig && !Object.keys(targets).length) {
    const configFile = options.configFile ?? browserslist.findConfigFile(configPath);
    if (configFile) {
      onBrowserslistConfigFound?.(configFile);
      browsers = browserslist.loadConfig({ config: configFile, env: options.browserslistEnv });
    }
    browsers = browsers ?? [];
  }

  if (esmodules && (!browsers || !browsers.length || esmodules !== "intersect")) {
    browsers = Object.keys(nativeModules).map(browser => `${browser} >= ${nativeModules[browser]}`).join(", ");
    esmodules = false;
  }

  if (browsers && browsers.length) {
    const queryBrowsers = resolveTargetsCached(browsers, options.browserslistEnv);
    if (esmodules === "intersect") {
      for (const browser of Object.keys(queryBrowsers)) {
        if (["deno", "ie"].includes(browser)) {
          delete queryBrowsers[browser];
          continue;
        }
        const esmSupportVersion = nativeModules[browser === "opera_mobile" ? "op_mob" : browser];
        if (esmSupportVersion) {
          const version = queryBrowsers[browser];
          queryBrowsers[browser] = getHighestUnreleased(version, semverify(esmSupportVersion), browser);
        } else {
          delete queryBrowsers[browser];
        }
      }
    }
    targets = { ...queryBrowsers, ...targets };
  }

  const result = {};
  const decimalWarnings = [];

  for (const target of Object.keys(targets).sort()) {
    const value = targets[target];
    if (typeof value === "number" && value % 1 !== 0) {
      decimalWarnings.push({ target, value });
    }
    const [parsedTarget, parsedValue] = target === "node" ? nodeTargetParser(value) : defaultTargetParser(target, value);
    if (parsedValue) {
      result[parsedTarget] = parsedValue;
    }
  }

  outputDecimalWarning(decimalWarnings);
  return result;
}

Object.defineProperty(exports, "__esModule", { value: true });
exports.TargetNames = TARGET_NAMES;
exports.filterItems = require("./filter-items.js").default;
exports.getInclusionReasons = require("./debug.js").getInclusionReasons;
exports.isBrowsersQueryValid = isBrowsersQueryValid;
exports.isRequired = require("./filter-items.js").isRequired;
exports.prettifyTargets = require("./pretty.js").prettifyTargets;
exports.unreleasedLabels = unreleasedLabels;
exports.default = getTargets;
