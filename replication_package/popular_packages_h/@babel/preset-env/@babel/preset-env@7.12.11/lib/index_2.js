"use strict";

const { isRequired, filterItems, default: resolveTargets, prettifyTargets } = require("@babel/helper-compilation-targets");
const babelHelperPluginUtils = require("@babel/helper-plugin-utils");
const semver = require("semver");
const debugHelpers = require("./debug");
const getSpecificExcludes = require("./get-option-specific-excludes").default;
const filterHelperItems = require("./filter-items");
const moduleTransforms = require("./module-transformations").default;
const normalizeOpts = require("./normalize-options").default;
const proposalsData = require("../data/shipped-proposals");
const pluginsCompat = require("./plugins-compat-data");
const overlappingPluginsData = require("@babel/compat-data/overlapping-plugins").default;
const polyfillUsageCorejs2 = require("./polyfills/corejs2/usage-plugin").default;
const polyfillUsageCorejs3 = require("./polyfills/corejs3/usage-plugin").default;
const polyfillUsageRegenerator = require("./polyfills/regenerator/usage-plugin").default;
const polyfillEntryCorejs2 = require("./polyfills/corejs2/entry-plugin").default;
const polyfillEntryCorejs3 = require("./polyfills/corejs3/entry-plugin").default;
const polyfillEntryRegenerator = require("./polyfills/regenerator/entry-plugin").default;
const availablePlugins = require("./available-plugins").default;
const utils = require("./utils");

function isPluginRequired(targets, support) {
  return isRequired("fake-name", targets, { compatData: { "fake-name": support } });
}

const pluginLists = {
  withProposals: {
    withoutBugfixes: pluginsCompat.plugins,
    withBugfixes: { ...pluginsCompat.plugins, ...pluginsCompat.pluginsBugfixes }
  },
  withoutProposals: {
    withoutBugfixes: utils.filterStageFromList(pluginsCompat.plugins, proposalsData.proposalPlugins),
    withBugfixes: utils.filterStageFromList({ ...pluginsCompat.plugins, ...pluginsCompat.pluginsBugfixes }, proposalsData.proposalPlugins)
  }
};

function getPluginList(proposals, bugfixes) {
  return proposals 
    ? (bugfixes ? pluginLists.withProposals.withBugfixes : pluginLists.withProposals.withoutBugfixes)
    : (bugfixes ? pluginLists.withoutProposals.withBugfixes : pluginLists.withoutProposals.withoutBugfixes);
}

const getPlugin = pluginName => {
  const plugin = availablePlugins[pluginName];
  if (!plugin) {
    throw new Error(`Could not find plugin "${pluginName}". Ensure there is an entry for it.`);
  }
  return plugin;
};

const transformIncludesAndExcludes = opts => {
  return opts.reduce((result, opt) => {
    const target = /^(es|es6|es7|esnext|web)\./.test(opt) ? "builtIns" : "plugins";
    result[target].add(opt);
    return result;
  }, {
    all: opts,
    plugins: new Set(),
    builtIns: new Set()
  });
};

function supportsStaticESM(caller) {
  return caller?.supportsStaticESM ?? false;
}

function supportsDynamicImport(caller) {
  return caller?.supportsDynamicImport ?? false;
}

function supportsExportNamespaceFrom(caller) {
  return caller?.supportsExportNamespaceFrom ?? false;
}

function supportsTopLevelAwait(caller) {
  return caller?.supportsTopLevelAwait ?? false;
}

const getModulesPluginNames = ({
  modules, transformations, shouldTransformESM, 
  shouldTransformDynamicImport, shouldTransformExportNamespaceFrom,
  shouldParseTopLevelAwait
}) => {
  const modulesPluginNames = [];

  if (modules !== false && transformations[modules]) {
    if (shouldTransformESM) {
      modulesPluginNames.push(transformations[modules]);
    }

    if (shouldTransformDynamicImport && shouldTransformESM && modules !== "umd") {
      modulesPluginNames.push("proposal-dynamic-import");
    } else {
      if (shouldTransformDynamicImport) {
        console.warn("Dynamic import can only be supported when transforming ES modules" +
          " to AMD, CommonJS or SystemJS. Only the parser plugin will be enabled.");
      }
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

const getPolyfillPlugins = ({ useBuiltIns, corejs, polyfillTargets, include, 
                             exclude, proposals, shippedProposals, regenerator, debug }) => {
  const polyfillPlugins = [];

  if (useBuiltIns === "usage" || useBuiltIns === "entry") {
    const pluginOptions = { corejs, polyfillTargets, include, exclude, proposals, shippedProposals, regenerator, debug };

    if (corejs) {
      if (useBuiltIns === "usage") {
        if (corejs.major === 2) {
          polyfillPlugins.push([polyfillUsageCorejs2, pluginOptions]);
        } else {
          polyfillPlugins.push([polyfillUsageCorejs3, pluginOptions]);
        }

        if (regenerator) {
          polyfillPlugins.push([polyfillUsageRegenerator, pluginOptions]);
        }
      } else {
        if (corejs.major === 2) {
          polyfillPlugins.push([polyfillEntryCorejs2, pluginOptions]);
        } else {
          polyfillPlugins.push([polyfillEntryCorejs3, pluginOptions]);
          if (!regenerator) {
            polyfillPlugins.push([polyfillEntryRegenerator, pluginOptions]);
          }
        }
      }
    }
  }

  return polyfillPlugins;
};

const babelPresetEnv = babelHelperPluginUtils.declare((api, opts) => {
  api.assertVersion(7);

  const { bugfixes, configPath, debug, exclude: optionsExclude, forceAllTransforms, 
          ignoreBrowserslistConfig, include: optionsInclude, loose, 
          modules, shippedProposals, spec, targets: optionsTargets, 
          useBuiltIns, corejs, browserslistEnv } = normalizeOpts(opts);

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

  const targets = resolveTargets(optionsTargets, { ignoreBrowserslistConfig, configPath, browserslistEnv });
  const include = transformIncludesAndExcludes(optionsInclude);
  const exclude = transformIncludesAndExcludes(optionsExclude);
  const transformTargets = forceAllTransforms || hasUglifyTarget ? {} : targets;
  const compatData = getPluginList(shippedProposals, bugfixes);

  const shouldSkipExportNamespaceFrom = modules === "auto" && api.caller?.(supportsExportNamespaceFrom) || modules === false &&
    !isRequired("proposal-export-namespace-from", transformTargets, {
      compatData, includes: include.plugins, excludes: exclude.plugins
    });

  const modulesPluginNames = getModulesPluginNames({
    modules, transformations: moduleTransforms,
    shouldTransformESM: modules !== "auto" || api.caller?.(supportsStaticESM) === false,
    shouldTransformDynamicImport: modules !== "auto" || api.caller?.(supportsDynamicImport) === false,
    shouldTransformExportNamespaceFrom: !shouldSkipExportNamespaceFrom,
    shouldParseTopLevelAwait: api.caller?.(supportsTopLevelAwait) ?? true
  });

  const pluginNames = filterItems(compatData, include.plugins, exclude.plugins,
    transformTargets, modulesPluginNames, getSpecificExcludes({ loose }), proposalsData.pluginSyntaxMap);

  filterHelperItems.removeUnnecessaryItems(pluginNames, overlappingPluginsData);
  
  const polyfillPlugins = getPolyfillPlugins({
    useBuiltIns, corejs, polyfillTargets: targets,
    include: include.builtIns, exclude: exclude.builtIns,
    proposals, shippedProposals,
    regenerator: pluginNames.has("transform-regenerator"), debug
  });

  const pluginUseBuiltIns = useBuiltIns !== false;
  const plugins = Array.from(pluginNames).map(pluginName => {
    if (["proposal-class-properties", "proposal-private-methods", "proposal-private-property-in-object"].includes(pluginName)) {
      return [getPlugin(pluginName), {
        loose: loose ? "#__internal__@babel/preset-env__prefer-true-but-false-is-ok-if-it-prevents-an-error"
                     : "#__internal__@babel/preset-env__prefer-false-but-true-is-ok-if-it-prevents-an-error"
      }];
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
      debugHelpers.logPluginOrPolyfill(pluginName, targets, pluginsCompat.plugins);
    });

    if (!useBuiltIns) {
      console.log("\nUsing polyfills: No polyfills were added, since the `useBuiltIns` option was not set.");
    } else {
      console.log(`\nUsing polyfills with \`${useBuiltIns}\` option:`);
    }
  }

  return { plugins };
});

exports.isPluginRequired = isPluginRequired;
exports.transformIncludesAndExcludes = transformIncludesAndExcludes;
exports.getModulesPluginNames = getModulesPluginNames;
exports.getPolyfillPlugins = getPolyfillPlugins;
exports.default = babelPresetEnv;
