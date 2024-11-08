"use strict";

const { isRequired, default: getCompilationTargets, filterItems, prettifyTargets } = require("@babel/helper-compilation-targets");
const _debug = require("./debug");
const getOptionSpecificExcludes = require("./get-option-specific-excludes");
const filterItems = require("./filter-items");
const moduleTransformations = require("./module-transformations");
const normalizeOptions = require("./normalize-options");
const shippedProposals = require("../data/shipped-proposals");
const pluginsCompatData = require("./plugins-compat-data");
const overlappingPlugins = require("@babel/compat-data/overlapping-plugins");
const usagePlugin = require("./polyfills/corejs2/usage-plugin");
const usagePlugin2 = require("./polyfills/corejs3/usage-plugin");
const usagePlugin3 = require("./polyfills/regenerator/usage-plugin");
const entryPlugin = require("./polyfills/corejs2/entry-plugin");
const entryPlugin2 = require("./polyfills/corejs3/entry-plugin");
const entryPlugin3 = require("./polyfills/regenerator/entry-plugin");
const availablePlugins = require("./available-plugins");
const utils = require("./utils");
const { declare } = require("@babel/helper-plugin-utils");

function isPluginRequired(targets, support) {
  return isRequired("fake-name", targets, {
    compatData: { "fake-name": support }
  });
}

const pluginLists = {
  withProposals: {
    withoutBugfixes: pluginsCompatData.plugins,
    withBugfixes: { ...pluginsCompatData.plugins, ...pluginsCompatData.pluginsBugfixes }
  },
  withoutProposals: {
    withoutBugfixes: utils.filterStageFromList(pluginsCompatData.plugins, shippedProposals.proposalPlugins),
    withBugfixes: utils.filterStageFromList({ ...pluginsCompatData.plugins, ...pluginsCompatData.pluginsBugfixes }, shippedProposals.proposalPlugins)
  }
};

function getPluginList(proposals, bugfixes) {
  if (proposals) {
    return bugfixes ? pluginLists.withProposals.withBugfixes : pluginLists.withProposals.withoutBugfixes;
  } else {
    return bugfixes ? pluginLists.withoutProposals.withBugfixes : pluginLists.withoutProposals.withoutBugfixes;
  }
}

const getPlugin = pluginName => {
  const plugin = availablePlugins.default[pluginName];
  if (!plugin) throw new Error(`Could not find plugin "${pluginName}". Ensure there is an entry in ./available-plugins.js for it.`);
  return plugin;
};

const transformIncludesAndExcludes = opts => {
  return opts.reduce((result, opt) => {
    const target = opt.match(/^(es|es6|es7|esnext|web)\./) ? "builtIns" : "plugins";
    result[target].add(opt);
    return result;
  }, {
    all: opts,
    plugins: new Set(),
    builtIns: new Set()
  });
};

exports.transformIncludesAndExcludes = transformIncludesAndExcludes;

const getModulesPluginNames = ({
  modules,
  transformations,
  shouldTransformESM,
  shouldTransformDynamicImport,
  shouldTransformExportNamespaceFrom,
  shouldParseTopLevelAwait
}) => {
  const modulesPluginNames = [];

  if (modules !== false && transformations[modules]) {
    if (shouldTransformESM) modulesPluginNames.push(transformations[modules]);
    if (shouldTransformDynamicImport && shouldTransformESM && modules !== "umd") {
      modulesPluginNames.push("proposal-dynamic-import");
    } else {
      if (shouldTransformDynamicImport) console.warn("Dynamic import can only be supported when transforming ES modules to AMD, CommonJS or SystemJS. Only the parser plugin will be enabled.");
      modulesPluginNames.push("syntax-dynamic-import");
    }
  } else {
    modulesPluginNames.push("syntax-dynamic-import");
  }

  if (shouldTransformExportNamespaceFrom) {
    modulesPluginNames.push("proposal-export-namespace-from");
  } else {
    modulesPluginNames.push("syntax-export-namespace-from");
  }

  if (shouldParseTopLevelAwait) {
    modulesPluginNames.push("syntax-top-level-await");
  }

  return modulesPluginNames;
};

exports.getModulesPluginNames = getModulesPluginNames;

const getPolyfillPlugins = ({
  useBuiltIns,
  corejs,
  polyfillTargets,
  include,
  exclude,
  proposals,
  shippedProposals,
  regenerator,
  debug
}) => {
  const polyfillPlugins = [];

  if (useBuiltIns === "usage" || useBuiltIns === "entry") {
    const pluginOptions = {
      corejs,
      polyfillTargets,
      include,
      exclude,
      proposals,
      shippedProposals,
      regenerator,
      debug
    };

    if (corejs) {
      if (useBuiltIns === "usage") {
        corejs.major === 2 ? polyfillPlugins.push([usagePlugin.default, pluginOptions]) : polyfillPlugins.push([usagePlugin2.default, pluginOptions]);
        if (regenerator) polyfillPlugins.push([usagePlugin3.default, pluginOptions]);
      } else {
        corejs.major === 2 ? polyfillPlugins.push([entryPlugin.default, pluginOptions]) : polyfillPlugins.push([entryPlugin2.default, pluginOptions]);
        if (!regenerator) polyfillPlugins.push([entryPlugin3.default, pluginOptions]);
      }
    }
  }

  return polyfillPlugins;
};

exports.getPolyfillPlugins = getPolyfillPlugins;

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
    bugfixes,
    configPath,
    debug,
    exclude: optionsExclude,
    forceAllTransforms,
    ignoreBrowserslistConfig,
    include: optionsInclude,
    loose,
    modules,
    shippedProposals,
    spec,
    targets: optionsTargets,
    useBuiltIns,
    corejs: { version: corejs, proposals },
    browserslistEnv
  } = normalizeOptions.default(opts);

  let hasUglifyTarget = false;
  if (optionsTargets?.uglify) {
    hasUglifyTarget = true;
    delete optionsTargets.uglify;
    console.log("\nThe uglify target has been deprecated. Set the top level option `forceAllTransforms: true` instead.\n");
  }

  if (optionsTargets?.esmodules && optionsTargets.browsers) {
    console.log("\n@babel/preset-env: esmodules and browsers targets have been specified together.");
    console.log(`\`browsers\` target, \`${optionsTargets.browsers}\` will be ignored.\n`);
  }

  const targets = getCompilationTargets(optionsTargets, {
    ignoreBrowserslistConfig,
    configPath,
    browserslistEnv
  });

  const include = transformIncludesAndExcludes(optionsInclude);
  const exclude = transformIncludesAndExcludes(optionsExclude);

  const transformTargets = forceAllTransforms || hasUglifyTarget ? {} : targets;
  const compatData = getPluginList(shippedProposals, bugfixes);

  const shouldSkipExportNamespaceFrom = modules === "auto" && api.caller?.(supportsExportNamespaceFrom)
    || modules === false && !isRequired("proposal-export-namespace-from", transformTargets, { compatData, includes: include.plugins, excludes: exclude.plugins });

  const modulesPluginNames = getModulesPluginNames({
    modules,
    transformations: moduleTransformations.default,
    shouldTransformESM: modules !== "auto" || !api.caller?.(supportsStaticESM),
    shouldTransformDynamicImport: modules !== "auto" || !api.caller?.(supportsDynamicImport),
    shouldTransformExportNamespaceFrom: !shouldSkipExportNamespaceFrom,
    shouldParseTopLevelAwait: !api.caller || api.caller(supportsTopLevelAwait)
  });

  const pluginNames = filterItems(compatData, include.plugins, exclude.plugins, transformTargets, modulesPluginNames,
    getOptionSpecificExcludes.default({ loose }), shippedProposals.pluginSyntaxMap);

  filterItems.removeUnnecessaryItems(pluginNames, overlappingPlugins.default);

  const polyfillPlugins = getPolyfillPlugins({
    useBuiltIns,
    corejs,
    polyfillTargets: targets,
    include: include.builtIns,
    exclude: exclude.builtIns,
    proposals,
    shippedProposals,
    regenerator: pluginNames.has("transform-regenerator"),
    debug
  });

  const pluginUseBuiltIns = useBuiltIns !== false;
  const plugins = Array.from(pluginNames).map(pluginName => {
    if (["proposal-class-properties", "proposal-private-methods", "proposal-private-property-in-object"].includes(pluginName)) {
      return [getPlugin(pluginName), { loose: loose ? "#__internal__@babel/preset-env__prefer-true-but-false-is-ok-if-it-prevents-an-error" : "#__internal__@babel/preset-env__prefer-false-but-true-is-ok-if-it-prevents-an-error" }];
    }
    return [getPlugin(pluginName), { spec, loose, useBuiltIns: pluginUseBuiltIns }];
  }).concat(polyfillPlugins);

  if (debug) {
    console.log("@babel/preset-env: `DEBUG` option");
    console.log("\nUsing targets:");
    console.log(JSON.stringify(prettifyTargets(targets), null, 2));
    console.log(`\nUsing modules transform: ${modules.toString()}`);
    console.log("\nUsing plugins:");
    pluginNames.forEach(pluginName => {
      _debug.logPluginOrPolyfill(pluginName, targets, pluginsCompatData.plugins);
    });

    if (!useBuiltIns) {
      console.log("\nUsing polyfills: No polyfills were added, since the `useBuiltIns` option was not set.");
    } else {
      console.log(`\nUsing polyfills with \`${useBuiltIns}\` option:`);
    }
  }

  return { plugins };
});
