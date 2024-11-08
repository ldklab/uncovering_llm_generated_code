"use strict";

const browserslist = require("browserslist");
const { OptionValidator, findSuggestion } = require("@babel/helper-validator-option");
const { es6 } = require("@babel/compat-data/native-modules");
const LRU = require("lru-cache");
const { isUnreleasedVersion, semverify, getLowestUnreleased, getHighestUnreleased, semverMin } = require("./utils.js");
const { browserNameMap, unreleasedLabels } = require("./targets.js");
const { TargetNames } = require("./options.js");
const { prettifyTargets } = require("./pretty.js");
const { getInclusionReasons } = require("./debug.js");
const filterItems = require("./filter-items.js");

exports.TargetNames = TargetNames;
exports.filterItems = filterItems.default;
exports.getInclusionReasons = getInclusionReasons;
exports.isRequired = filterItems.isRequired;
exports.prettifyTargets = prettifyTargets;
exports.unreleasedLabels = unreleasedLabels;
exports.isBrowsersQueryValid = isBrowsersQueryValid;
exports.default = getTargets;

const ESM_SUPPORT = es6.module;
const v = new OptionValidator("@babel/helper-compilation-targets");

function validateTargetNames(targets) {
  const validTargets = Object.keys(TargetNames);
  for (const target of Object.keys(targets)) {
    if (!(target in TargetNames)) {
      throw new Error(v.formatMessage(`'${target}' is not a valid target
- Did you mean '${findSuggestion(target, validTargets)}'?`));
    }
  }
  return targets;
}

function isBrowsersQueryValid(browsers) {
  return typeof browsers === "string" || (Array.isArray(browsers) && browsers.every(b => typeof b === "string"));
}

function validateBrowsers(browsers) {
  v.invariant(browsers === undefined || isBrowsersQueryValid(browsers), `'${String(browsers)}' is not a valid browserslist query`);
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
        const parsedBrowserVersion = semverify(splitVersion);
        all[target] = semverMin(version, parsedBrowserVersion);
      }
    } catch (_) {}
    return all;
  }, {});
}

function outputDecimalWarning(decimalTargets) {
  if (!decimalTargets.length) return;
  console.warn("Warning, the following targets are using a decimal version:\n");
  decimalTargets.forEach(({ target, value }) => console.warn(`  ${target}: ${value}`));
  console.warn(`
We recommend using a string for minor/patch versions to avoid numbers like 6.10
getting parsed as 6.1, which can lead to unexpected behavior.
`);
}

function semverifyTarget(target, value) {
  try {
    return semverify(value);
  } catch (_) {
    throw new Error(v.formatMessage(`'${value}' is not a valid value for 'targets.${target}'.`));
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
  const input = Object.assign({}, inputTargets);
  delete input.esmodules;
  delete input.browsers;
  return input;
}

function resolveTargets(queries, env) {
  const resolved = browserslist(queries, { mobileToDesktop: true, env });
  return getLowestVersions(resolved);
}

const targetsCache = new LRU({ max: 64 });

function resolveTargetsCached(queries, env) {
  const cacheKey = typeof queries === "string" ? queries : queries.join() + env;
  let cached = targetsCache.get(cacheKey);
  if (!cached) {
    cached = resolveTargets(queries, env);
    targetsCache.set(cacheKey, cached);
  }
  return Object.assign({}, cached);
}

function getTargets(inputTargets = {}, options = {}) {
  let { browsers, esmodules } = inputTargets;
  const { configPath = ".", onBrowserslistConfigFound } = options;

  validateBrowsers(browsers);

  const input = generateTargets(inputTargets);
  let targets = validateTargetNames(input);

  const shouldParseBrowsers = !!browsers;
  const hasTargets = shouldParseBrowsers || Object.keys(targets).length > 0;
  const shouldSearchForConfig = !options.ignoreBrowserslistConfig && !hasTargets;

  if (!browsers && shouldSearchForConfig) {
    const configFile = options.configFile ?? browserslist.findConfigFile(configPath);
    if (configFile) {
      onBrowserslistConfigFound?.(configFile);
      browsers = browserslist.loadConfig({ config: configFile, env: options.browserslistEnv });
    }
    if (!browsers) browsers = [];
  }

  if (esmodules && (esmodules !== "intersect" || !browsers?.length)) {
    browsers = Object.keys(ESM_SUPPORT).map(browser => `${browser} >= ${ESM_SUPPORT[browser]}`).join(", ");
    esmodules = false;
  }

  if (browsers?.length) {
    const queryBrowsers = resolveTargetsCached(browsers, options.browserslistEnv);
    if (esmodules === "intersect") {
      for (const browser of Object.keys(queryBrowsers)) {
        if (browser !== "deno" && browser !== "ie") {
          const esmSupportVersion = ESM_SUPPORT[browser === "opera_mobile" ? "op_mob" : browser];
          if (esmSupportVersion) {
            const version = queryBrowsers[browser];
            queryBrowsers[browser] = getHighestUnreleased(version, semverify(esmSupportVersion), browser);
          } else {
            delete queryBrowsers[browser];
          }
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
