"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.default = void 0;
exports.isPluginRequired = isPluginRequired;
exports.transformIncludesAndExcludes = void 0;

const { isRequired } = require("@babel/helper-compilation-targets");
const { default: pluginCoreJS3 } = require("babel-plugin-polyfill-corejs3");
const _helperPluginUtils = require("@babel/helper-plugin-utils");
const { plugins: availablePlugins } = require("./available-plugins.js");

const { 
  plugins: compatPlugins, 
  proposals: proposalPlugins 
} = require("./plugins-compat-data.js");

const getPluginsCompatList = (includeProposals, includeBugfixes) => {
  return includeProposals
    ? includeBugfixes ? { ...compatPlugins, ...proposals } : compatPlugins
    : includeBugfixes 
      ? filterPluginList({ ...compatPlugins, ...proposals }, proposalPlugins)
      : filterPluginList(compatPlugins, proposalPlugins);
};

function isPluginRequired(targets, support) {
  return isRequired("specified-plugin", targets, { compatData: { "specified-plugin": support } });
}

const filterPluginList = (list, stageList) => {
  return Object.keys(list).reduce((result, item) => {
    if (!stageList.has(item)) result[item] = list[item];
    return result;
  }, {});
};

const transformIncludesAndExcludes = (opts) => {
  return opts.reduce((result, opt) => {
    const target = /^(es|web)\./.test(opt) ? "builtIns" : "plugins";
    result[target].add(opt);
    return result;
  }, { all: opts, plugins: new Set(), builtIns: new Set() });
};
exports.transformIncludesAndExcludes = transformIncludesAndExcludes;

function getSpecialModulesPluginNames(modules, shouldTransformDynamicImport, babelVersion) {
  const modulePlugins = [];
  if (modules) {
    modulePlugins.push(availablePlugins[modules]);
  }
  if (shouldTransformDynamicImport) {
    if (modules && modules !== "umd") {
      modulePlugins.push("transform-dynamic-import");
    } else {
      console.warn("Dynamic import can only be transformed with specific module systems (AMD, CommonJS, SystemJS).");
    }
  }
  if (babelVersion[0] !== "8") {
    modulePlugins.push("syntax-top-level-await", "syntax-dynamic-import", "syntax-import-meta");
  }
  return modulePlugins;
}

const definePreset = (api, opts) => {
  api.assertVersion(7);
  const { bugfixes, configPath, debug, exclude, forceAllTransforms, ignoreBrowserslistConfig, include, modules, shippedProposals, targets, useBuiltIns, corejs } = (0, _normalizeOptions.default)(opts);
  let targetsSet = api.targets();

  if (!useBuiltIns && targets) {
    console.warn("Conflicting configuration detected (esmodules and browsers together) - 'browsers' target will be ignored.");
  }

  // Targets configuration and transformation
  const transformTargets = forceAllTransforms ? {} : targetsSet;
  const includeOpts = transformIncludesAndExcludes(include);
  const excludeOpts = transformIncludesAndExcludes(exclude);
  const pluginCompat = getPluginsCompatList(shippedProposals, bugfixes);

  const shouldTransformDynamicImport = modules === "auto" ? !api.caller(supportsDynamicImport) : !!modules;
  if (!excludeOpts.plugins.has("transform-export-namespace-from") && 
    (modules === "auto" ? !api.caller(supportsExportNamespaceFrom) : !!modules)) 
  {
    includeOpts.plugins.add("transform-export-namespace-from");
  }

  const pluginNames = (0, _helperCompilationTargets.filterItems)(
    pluginCompat, 
    includeOpts.plugins, 
    excludeOpts.plugins, 
    transformTargets, 
    getSpecialModulesPluginNames(modules, shouldTransformDynamicImport, api.version), 
    undefined, 
    _shippedProposals.pluginSyntaxMap
  );

  if (shippedProposals) {
    (0, _filterItems.addProposalSyntaxPlugins)(pluginNames, _shippedProposals.proposalSyntaxPlugins);
  }
  
  // Applying filters and polyfills
  (0, _filterItems.removeUnsupportedItems)(pluginNames, api.version);
  (0, _filterItems.removeUnnecessaryItems)(pluginNames, compatPlugins.overlappingPlugins);
  
  const polyfillPlugins = getPolyfillPlugins({ 
    useBuiltIns, 
    corejs, 
    debug, 
    targets: targetsSet, 
    include: includeOpts.builtIns, 
    exclude: excludeOpts.builtIns, 
    proposals: corejs.proposals, 
    shippedProposals, 
    regenerator: pluginNames.has("transform-regenerator") 
  });

  const plugins = Array.from(pluginNames).map(pluginName => getPluginConfig(pluginName, useBuiltIns)).concat(polyfillPlugins);

  if (debug) {
    logDebugInfo({
      plugins: pluginNames, 
      targets: targetsSet, 
      modules 
    });
  }

  return { plugins };
};

function getPluginConfig(pluginName, useBuiltIns) {
  if (pluginName === "transform-class-properties" || pluginName === "transform-private-methods" || pluginName === "transform-private-property-in-object") {
    return [availablePlugins[pluginName], { loose: true }];
  }
  if (pluginName === "syntax-import-attributes") {
    return [availablePlugins[pluginName], { deprecatedAssertSyntax: true }];
  }
  return [availablePlugins[pluginName], { useBuiltIns }];
}

function logDebugInfo({ plugins, targets, modules }) {
  console.log("@babel/preset-env: `DEBUG` option");
  console.log("\nUsing targets:");
  console.log(JSON.stringify(targets, null, 2));
  console.log(`\nUsing modules transform: ${modules}`);
  console.log("\nUsing plugins:");
  plugins.forEach(plugin => console.log(plugin));
}

exports.default = definePreset;
