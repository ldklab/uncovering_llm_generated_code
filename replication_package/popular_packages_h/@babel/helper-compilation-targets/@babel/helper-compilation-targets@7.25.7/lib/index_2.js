"use strict";

import browserslist from "browserslist";
import { OptionValidator, findSuggestion } from "@babel/helper-validator-option";
import { nativeModules } from "@babel/compat-data";
import LRU from "lru-cache";
import { isUnreleasedVersion, semverify, semverMin, getHighestUnreleased, getLowestUnreleased } from "./utils.js";
import { TargetNames } from "./options.js";
import { prettifyTargets } from "./pretty.js";
import { getInclusionReasons } from "./debug.js";
import { filterItems, isRequired } from "./filter-items.js"; 
import { unreleasedLabels } from "./targets.js";

export { TargetNames, filterItems, getInclusionReasons, isRequired, prettifyTargets, unreleasedLabels };
export default getTargets;
export function isBrowsersQueryValid(browsers) {
  return typeof browsers === "string" || (Array.isArray(browsers) && browsers.every(b => typeof b === "string"));
}

const ESM_SUPPORT = nativeModules["es6.module"];
const v = new OptionValidator("@babel/helper-compilation-targets");
const targetsCache = new LRU({ max: 64 });

function validateTargetNames(targets) {
  for (const target of Object.keys(targets)) {
    if (!(target in TargetNames)) {
      throw new Error(v.formatMessage(`'${target}' is not a valid target - Did you mean '${findSuggestion(target, Object.keys(TargetNames))}'?`));
    }
  }
  return targets;
}

function validateBrowsers(browsers) {
  v.invariant(browsers === undefined || isBrowsersQueryValid(browsers), `'${String(browsers)}' is not a valid browserslist query`);
  return browsers;
}

function getLowestVersions(browsers) {
  return browsers.reduce((all, browser) => {
    const [name, version] = browser.split(" ");
    const target = _targets.browserNameMap[name];
    if (!target) return all;
    try {
      const splitVersion = version.split("-")[0].toLowerCase();
      const isUnreleased = isUnreleasedVersion(splitVersion, target);
      if (!all[target]) {
        all[target] = isUnreleased ? splitVersion : semverify(splitVersion);
      } else {
        if (isUnreleased) {
          all[target] = getLowestUnreleased(all[target], splitVersion, target);
        } else {
          const parsedVersion = semverify(splitVersion);
          all[target] = semverMin(all[target], parsedVersion);
        }
      }
    } catch (_) {}
    return all;
  }, {});
}

function outputDecimalWarning(decimalTargets) {
  if (!decimalTargets.length) return;
  console.warn("Warning, the following targets are using a decimal version:\n");
  decimalTargets.forEach(({ target, value }) => console.warn(`  ${target}: ${value}`));
  console.warn("\nUse a string for minor/patch versions to avoid parsing errors.");
}

function semverifyTarget(target, value) {
  try {
    return semverify(value);
  } catch (_) {
    throw new Error(v.formatMessage(`'${value}' is not a valid value for 'targets.${target}'.`));
  }
}

function nodeTargetParser(value) {
  const parsed = (value === true || value === "current") ? process.versions.node : semverifyTarget("node", value);
  return ["node", parsed];
}

function defaultTargetParser(target, value) {
  const version = isUnreleasedVersion(value, target) ? value.toLowerCase() : semverifyTarget(target, value);
  return [target, version];
}

function generateTargets(inputTargets) {
  const input = {...inputTargets};
  delete input.esmodules;
  delete input.browsers;
  return input;
}

function resolveTargets(queries, env) {
  return getLowestVersions(browserslist(queries, { mobileToDesktop: true, env }));
}

function resolveTargetsCached(queries, env) {
  const cacheKey = typeof queries === "string" ? queries : queries.join() + env;
  let cached = targetsCache.get(cacheKey);
  if (!cached) {
    cached = resolveTargets(queries, env);
    targetsCache.set(cacheKey, cached);
  }
  return {...cached};
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
    const configFile = options.configFile || browserslist.findConfigFile(configPath);
    if (configFile) {
      onBrowserslistConfigFound?.(configFile);
      browsers = browserslist.loadConfig({ config: configFile, env: options.browserslistEnv });
    }
    if (!browsers) {
      browsers = [];
    }
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
            queryBrowsers[browser] = getHighestUnreleased(queryBrowsers[browser], semverify(esmSupportVersion), browser);
          } else {
            delete queryBrowsers[browser];
          }
        } else {
          delete queryBrowsers[browser];
        }
      }
    }
    targets = {...queryBrowsers, ...targets};
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
//# sourceMappingURL=index.js.map
