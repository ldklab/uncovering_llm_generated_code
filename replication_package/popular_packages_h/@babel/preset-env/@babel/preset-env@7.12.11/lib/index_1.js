"use strict";

const { isRequired, filterItems, prettifyTargets } = require("@babel/helper-compilation-targets");
const { declare } = require("@babel/helper-plugin-utils");
const semver = require("semver");

const debugUtils = require("./debug");
const getOptionSpecificExcludes = require("./get-option-specific-excludes").default;
const filterItemsByStage = require("./filter-items").removeUnnecessaryItems;
const moduleTransformations = require("./module-transformations").default;
const normalizeOptions = require("./normalize-options").default;

const shippedProposalsData = require("../data/shipped-proposals");
const pluginsCompatData = require("./plugins-compat-data");
const overlappingPlugins = require("@babel/compat-data/overlapping-plugins").default;

const corejs2UsagePlugin = require("./polyfills/corejs2/usage-plugin").default;
const corejs3UsagePlugin = require("./polyfills/corejs3/usage-plugin").default;
const regeneratorUsagePlugin = require("./polyfills/regenerator/usage-plugin").default;
const corejs2EntryPlugin = require("./polyfills/corejs2/entry-plugin").default;
const corejs3EntryPlugin = require("./polyfills/corejs3/entry-plugin").default;
const regeneratorEntryPlugin = require("./polyfills/regenerator/entry-plugin").default;

const utils = require("./utils");

const availablePlugins = require("./available-plugins").default;

function isPluginRequired(targets, support) {
  return isRequired("fake-name", targets, { compatData: { "fake-name": support } });
}

const pluginLists = {
  withProposals: {
    withoutBugfixes: pluginsCompatData.plugins,
    withBugfixes: { ...pluginsCompatData.plugins, ...pluginsCompatData.pluginsBugfixes }
  },
  withoutProposals: {
    withoutBugfixes: utils.filterStageFromList(pluginsCompatData.plugins, shippedProposalsData.proposalPlugins),
    withBugfixes: utils.filterStageFromList({ ...pluginsCompatData.plugins, ...pluginsCompatData.pluginsBugfixes }, shippedProposalsData.proposalPlugins)
  }
};

function getPluginList(proposals, bugfixes) {
  return proposals ? (bugfixes ? pluginLists.withProposals.withBugfixes : pluginLists.withProposals.withoutBugfixes)
                   : (bugfixes ? pluginLists.withoutProposals.withBugfixes : pluginLists.withoutProposals.withoutBugfixes);
}

const getPlugin = pluginName => {
  const plugin = availablePlugins[pluginName];
  if (!plugin) {
    throw new Error(`Could not find plugin "${pluginName}". Ensure there is an entry in ./available-plugins.js for it.`);
  }
  return plugin;
};

const transformIncludesAndExcludes = opts => 
  opts.reduce((result, opt) => {
    const target = /^(es|es6|es7|esnext|web)\./.test(opt) ? "builtIns" : "plugins";
    result[target].add(opt);
    return result;
  }, { all: opts, plugins: new Set(), builtIns: new Set() });

function getModulesPluginNames({ modules, transformations, shouldTransformESM, shouldTransformDynamicImport, shouldTransformExportNamespaceFrom, shouldParseTopLevelAwait }) {
  const modulesPluginNames = [];
  if (modules !== false && transformations[modules]) {
    if (shouldTransformESM) modulesPluginNames.push(transformations[modules]);
    if (shouldTransformDynamicImport && shouldTransformESM && modules !== "umd") {
      modulesPluginNames.push("proposal-dynamic-import");
    } else {
      modulesPluginNames.push(shouldTransformDynamicImport ? "syntax-dynamic-import" : "dynamic-import");
    }
  } else {
    modulesPluginNames.push("syntax-dynamic-import");
  }
  if (shouldTransformExportNamespaceFrom) modulesPluginNames.push("proposal-export-namespace-from");
  else modulesPluginNames.push("syntax-export-namespace-from");
  
  if (shouldParseTopLevelAwait) modulesPluginNames.push("syntax-top-level-await");
  
  return modulesPluginNames;
}

function getPolyfillPlugins({ useBuiltIns, corejs, polyfillTargets, include, exclude, proposals, shippedProposals, regenerator, debug }) {
  const polyfillPlugins = [];
  if (useBuiltIns === "usage" || useBuiltIns === "entry") {
    const pluginOptions = { corejs, polyfillTargets, include, exclude, proposals, shippedProposals, regenerator, debug };
    if (corejs) {
      if (useBuiltIns === "usage") {
        polyfillPlugins.push(corejs.major === 2 ? [corejs2UsagePlugin, pluginOptions] : [corejs3UsagePlugin, pluginOptions]);
        if (regenerator) polyfillPlugins.push([regeneratorUsagePlugin, pluginOptions]);
      } else {
        polyfillPlugins.push(corejs.major === 2 ? [corejs2EntryPlugin, pluginOptions] : [corejs3EntryPlugin, pluginOptions]);
        if (!regenerator) polyfillPlugins.push([regeneratorEntryPlugin, pluginOptions]);
      }
    }
  }
  return polyfillPlugins;
}

function supportsStaticESM(caller) {
  return !!caller?.supportsStaticESM;
}

function supportsDynamicImport(caller) {
  return !!caller?.supportsDynamicImport;
}

function supportsExportNamespaceFrom(caller) {
  return !!caller?.supportsExportNamespaceFrom;
}

function supportsTopLevelAwait(caller) {
  return !!caller?.supportsTopLevelAwait;
}

module.exports = declare((api, opts) => {
  api.assertVersion(7);
  const {
    bugfixes, configPath, debug, exclude: optionsExclude, forceAllTransforms, ignoreBrowserslistConfig,
    include: optionsInclude, loose, modules, shippedProposals, spec, targets: optionsTargets, useBuiltIns,
    corejs: { version: corejs, proposals }, browserslistEnv
  } = normalizeOptions(opts);

  let hasUglifyTarget = false;
  if (optionsTargets?.uglify) {
    hasUglifyTarget = true;
    delete optionsTargets.uglify;
    console.log("\nThe uglify target has been deprecated. Set the top level option `forceAllTransforms: true` instead.\n");
  }

  if (optionsTargets?.esmodules && optionsTargets.browsers) {
    console.log(`\n@babel/preset-env: esmodules and browsers targets have been specified together. \`browsers\` target, \`${optionsTargets.browsers}\` will be ignored.\n`);
  }

  const targets = filterItems(optionsTargets, { ignoreBrowserslistConfig, configPath, browserslistEnv });
  const include = transformIncludesAndExcludes(optionsInclude);
  const exclude = transformIncludesAndExcludes(optionsExclude);
  const transformTargets = forceAllTransforms || hasUglifyTarget ? {} : targets;

  const compatData = getPluginList(shippedProposals, bugfixes);
  const shouldSkipExportNamespaceFrom = (
    (modules === "auto" && api.caller && api.caller(supportsExportNamespaceFrom)) ||
    (modules === false && !isRequired("proposal-export-namespace-from", transformTargets, { compatData, includes: include.plugins, excludes: exclude.plugins }))
  );
  
  const modulesPluginNames = getModulesPluginNames({
    modules, transformations: moduleTransformations,
    shouldTransformESM: modules !== "auto" || !(api.caller && api.caller(supportsStaticESM)),
    shouldTransformDynamicImport: modules !== "auto" || !(api.caller && api.caller(supportsDynamicImport)),
    shouldTransformExportNamespaceFrom: !shouldSkipExportNamespaceFrom,
    shouldParseTopLevelAwait: !api.caller || api.caller(supportsTopLevelAwait)
  });

  const pluginNames = filterItems(compatData, include.plugins, exclude.plugins, transformTargets, modulesPluginNames, getOptionSpecificExcludes({ loose }), shippedProposalsData.pluginSyntaxMap);
  filterItemsByStage(pluginNames, overlappingPlugins);

  const polyfillPlugins = getPolyfillPlugins({
    useBuiltIns, corejs, polyfillTargets: targets, include: include.builtIns, exclude: exclude.builtIns,
    proposals, shippedProposals, regenerator: pluginNames.has("transform-regenerator"), debug
  });
  
  const pluginUseBuiltIns = useBuiltIns !== false;
  const plugins = [...Array.from(pluginNames).map(pluginName => {
    if (["proposal-class-properties", "proposal-private-methods", "proposal-private-property-in-object"].includes(pluginName)) {
      return [getPlugin(pluginName), {
        loose: loose ? "#__internal__@babel/preset-env__prefer-true-but-false-is-ok-if-it-prevents-an-error" :
                       "#__internal__@babel/preset-env__prefer-false-but-true-is-ok-if-it-prevents-an-error"
      }];
    }
    return [getPlugin(pluginName), { spec, loose, useBuiltIns: pluginUseBuiltIns }];
  }), ...polyfillPlugins];

  if (debug) {
    console.log("@babel/preset-env: `DEBUG` option\n");
    console.log("\nUsing targets:");
    console.log(JSON.stringify(prettifyTargets(targets), null, 2));
    console.log(`\nUsing modules transform: ${modules}`);
    console.log("\nUsing plugins:");
    pluginNames.forEach(pluginName => {
      debugUtils.logPluginOrPolyfill(pluginName, targets, pluginsCompatData.plugins);
    });

    if (!useBuiltIns) {
      console.log("\nUsing polyfills: No polyfills were added, since the `useBuiltIns` option was not set.");
    } else {
      console.log(`\nUsing polyfills with \`${useBuiltIns}\` option:`);
    }
  }

  return { plugins };
});
