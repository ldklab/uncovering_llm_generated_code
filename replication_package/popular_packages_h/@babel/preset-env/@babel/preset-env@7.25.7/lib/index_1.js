"use strict";

import semver from "semver";
import debug from "./debug.js";
import filterItems from "./filter-items.js";
import moduleTransformations from "./module-transformations.js";
import normalizeOptions from "./normalize-options.js";
import shippedProposals from "./shipped-proposals.js";
import pluginsCompatData from "./plugins-compat-data.js";
import babelPluginPolyfillCorejs from "babel-plugin-polyfill-corejs3";
import babel7Plugins from "./polyfills/babel-7-plugins.cjs";
import helperCompilationTargets from "@babel/helper-compilation-targets";
import availablePlugins from "./available-plugins.js";
import { declarePreset } from "@babel/helper-plugin-utils";

// Helper function to determine if a plugin is required
export function isPluginRequired(targets, support) {
  return helperCompilationTargets.isRequired("fake-name", targets, {
    compatData: { "fake-name": support }
  });
}

// Filters plugins based on stages
function filterStageFromList(list, stageList) {
  return Object.keys(list).reduce((result, item) => {
    if (!stageList.has(item)) result[item] = list[item];
    return result;
  }, {});
}

// Plugin lists with and without proposals/bugfixes
const pluginLists = {
  withProposals: {
    withoutBugfixes: pluginsCompatData.plugins,
    withBugfixes: { ...pluginsCompatData.plugins, ...pluginsCompatData.pluginsBugfixes }
  },
  withoutProposals: {
    withoutBugfixes: filterStageFromList(pluginsCompatData.plugins, shippedProposals.proposalPlugins),
    withBugfixes: filterStageFromList({ ...pluginsCompatData.plugins, ...pluginsCompatData.pluginsBugfixes }, shippedProposals.proposalPlugins)
  }
};

// Retrieve appropriate plugin list
function getPluginList(proposals, bugfixes) {
  if (proposals) {
    return bugfixes ? pluginLists.withProposals.withBugfixes : pluginLists.withProposals.withoutBugfixes;
  } else {
    return bugfixes ? pluginLists.withoutProposals.withBugfixes : pluginLists.withoutProposals.withoutBugfixes;
  }
}

// Safe plugin retrieval
const getPlugin = (pluginName) => {
  const plugin = availablePlugins.default[pluginName]();
  if (!plugin) {
    throw new Error(`Could not find plugin "${pluginName}". Ensure there is an entry in ./available-plugins.js for it.`);
  }
  return plugin;
};

// Transform include and exclude options into usable sets
export const transformIncludesAndExcludes = (opts) => {
  return opts.reduce((result, opt) => {
    const target = /^(?:es|es6|es7|esnext|web)\./.test(opt) ? "builtIns" : "plugins";
    result[target].add(opt);
    return result;
  }, {
    all: opts,
    plugins: new Set(),
    builtIns: new Set()
  });
};

// Get special module plugin names
function getSpecialModulesPluginNames(modules, shouldTransformDynamicImport, babelVersion) {
  const modulesPluginNames = [];
  if (modules) {
    modulesPluginNames.push(moduleTransformations[modules]);
  }
  if (shouldTransformDynamicImport && modules && modules !== "umd") {
    modulesPluginNames.push("transform-dynamic-import");
  }
  if (babelVersion[0] !== "8") {
    if (!shouldTransformDynamicImport) {
      modulesPluginNames.push("syntax-dynamic-import");
    }
    modulesPluginNames.push("syntax-top-level-await", "syntax-import-meta");
  }
  return modulesPluginNames;
}

// CoreJS options for polyfill plugins
const getCoreJSOptions = ({
  useBuiltIns, corejs, polyfillTargets, include, exclude, proposals, shippedProposals, debug
}) => ({
  method: `${useBuiltIns}-global`,
  version: corejs ? corejs.toString() : undefined,
  targets: polyfillTargets,
  include,
  exclude,
  proposals,
  shippedProposals,
  debug,
  // Secret key for internal use
  "#__secret_key__@babel/preset-env__compatibility": {
    noRuntimeName: true
  }
});

// Generate polyfill plugins based on user options
var getPolyfillPlugins = ({
  useBuiltIns, corejs, polyfillTargets, include, exclude, proposals,
  shippedProposals, regenerator, debug
}) => {
  const polyfillPlugins = [];
  if (useBuiltIns === "usage" || useBuiltIns === "entry") {
    const pluginOptions = getCoreJSOptions({
      useBuiltIns, corejs, polyfillTargets, include, exclude, proposals, shippedProposals, debug
    });
    if (corejs) {
      if (useBuiltIns === "usage") {
        const corejsPlugins = corejs.major === 2 ? [_babel7Plugins.pluginCoreJS2, _babel7Plugins.legacyBabelPolyfillPlugin] : [pluginCoreJS3, _babel7Plugins.legacyBabelPolyfillPlugin];
        polyfillPlugins.push(...corejsPlugins.map(plugin => [plugin, { usage: true, deprecated: true }]));
        if (regenerator) {
          polyfillPlugins.push([_babel7Plugins.pluginRegenerator, { method: "usage-global", debug }]);
        }
      } else {
        const corejsPlugins = corejs.major === 2 ? [_babel7Plugins.legacyBabelPolyfillPlugin, _babel7Plugins.pluginCoreJS2] : [pluginCoreJS3, _babel7Plugins.legacyBabelPolyfillPlugin];
        polyfillPlugins.push(...corejsPlugins.map(plugin => [plugin, { usage: false, deprecated: true }]));
        if (!regenerator) {
          polyfillPlugins.push([_babel7Plugins.removeRegeneratorEntryPlugin, pluginOptions]);
        }
      }
    }
  }
  return polyfillPlugins;
};

// Main Babel preset function
export default declarePreset((api, opts) => {
  api.assertVersion(7);
  const babelTargets = api.targets();
  
  const {
    bugfixes, configPath, debug, exclude: optionsExclude, forceAllTransforms,
    ignoreBrowserslistConfig, include: optionsInclude, modules: optionsModules, 
    shippedProposals, targets: optionsTargets, useBuiltIns, corejs: { version: corejs, proposals }, 
    browserslistEnv
  } = normalizeOptions(opts);

  let targets = babelTargets;
  if (semver.lt(api.version, "7.13.0") || optionsTargets || configPath || browserslistEnv || ignoreBrowserslistConfig) {
    let hasUglifyTarget = false;
    if (optionsTargets && optionsTargets.uglify) {
      hasUglifyTarget = true;
      delete optionsTargets.uglify;
      console.warn(`
        The uglify target has been deprecated. Set the top level
        option \`forceAllTransforms: true\` instead.
      `);
    }
    targets = getLocalTargets(optionsTargets, ignoreBrowserslistConfig, configPath, browserslistEnv, api);
  }

  const transformTargets = forceAllTransforms || hasUglifyTarget ? {} : targets;
  const include = transformIncludesAndExcludes(optionsInclude);
  const exclude = transformIncludesAndExcludes(optionsExclude);
  const compatData = getPluginList(shippedProposals, bugfixes);
  const modules = optionsModules === "auto" ? api.caller(supportsStaticESM) ? false : "commonjs" : optionsModules;
  const shouldTransformDynamicImport = optionsModules === "auto" ? !api.caller(supportsDynamicImport) : !!modules;

  if (!exclude.plugins.has("transform-export-namespace-from") && 
      (optionsModules === "auto" ? !api.caller(supportsExportNamespaceFrom) : !!modules)) {
    include.plugins.add("transform-export-namespace-from");
  }

  const pluginNames = filterItems(compatData, include.plugins, exclude.plugins, transformTargets, 
    getSpecialModulesPluginNames(modules, shouldTransformDynamicImport, api.version), 
    options.loose ? undefined : ["transform-typeof-symbol"], shippedProposals.pluginSyntaxMap);

  if (shippedProposals) {
    filterItems.addProposalSyntaxPlugins(pluginNames, shippedProposals.proposalSyntaxPlugins);
  }

  filterItems.removeUnsupportedItems(pluginNames, api.version);
  filterItems.removeUnnecessaryItems(pluginNames, pluginsCompatData.overlappingPlugins);

  const polyfillPlugins = getPolyfillPlugins({
    useBuiltIns, corejs, polyfillTargets: targets, include: include.builtIns, exclude: exclude.builtIns, 
    proposals, shippedProposals, regenerator: pluginNames.has("transform-regenerator"), debug
  });

  const pluginUseBuiltIns = useBuiltIns !== false;
  const plugins = Array.from(pluginNames).map(pluginName => {
    if (["transform-class-properties", "transform-private-methods", "transform-private-property-in-object"].includes(pluginName)) {
      return [getPlugin(pluginName), {
        loose: options.loose ? "#__internal__@babel/preset-env__prefer-true-but-false-is-ok-if-it-prevents-an-error" : "#__internal__@babel/preset-env__prefer-false-but-true-is-ok-if-it-prevents-an-error"
      }];
    }
    if (pluginName === "syntax-import-attributes") {
      return [getPlugin(pluginName), { deprecatedAssertSyntax: true }];
    }
    return [getPlugin(pluginName), { spec: options.spec, loose: options.loose, useBuiltIns: pluginUseBuiltIns }];
  }).concat(polyfillPlugins);

  if (debug) {
    console.log("@babel/preset-env: `DEBUG` option");
    console.log("\nUsing targets:");
    console.log(JSON.stringify(helperCompilationTargets.prettifyTargets(targets), null, 2));
    console.log(`\nUsing modules transform: ${options.modules.toString()}`);
    console.log("\nUsing plugins:");
    pluginNames.forEach(pluginName => {
      debug.logPlugin(pluginName, targets, compatData);
    });
    if (!useBuiltIns) {
      console.log("\nUsing polyfills: No polyfills were added, since the `useBuiltIns` option was not set.");
    }
  }

  return {
    plugins: plugins
  };
});

// Get modules plugin names based on conditions
exports.getModulesPluginNames = function({
  modules, transformations, shouldTransformESM, shouldTransformDynamicImport, shouldTransformExportNamespaceFrom
}) {
  const modulesPluginNames = [];
  if (modules !== false && transformations[modules]) {
    if (shouldTransformESM) {
      modulesPluginNames.push(transformations[modules]);
    }
    if (shouldTransformDynamicImport && modules !== "umd") {
      modulesPluginNames.push("transform-dynamic-import");
    }
  }
  if (shouldTransformExportNamespaceFrom) {
    modulesPluginNames.push("transform-export-namespace-from");
  }
  if (!shouldTransformDynamicImport) {
    modulesPluginNames.push("syntax-dynamic-import");
  }
  if (!shouldTransformExportNamespaceFrom) {
    modulesPluginNames.push("syntax-export-namespace-from");
  }
  modulesPluginNames.push("syntax-top-level-await", "syntax-import-meta");
  return modulesPluginNames;
}
