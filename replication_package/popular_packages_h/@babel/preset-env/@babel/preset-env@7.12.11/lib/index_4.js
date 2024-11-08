"use strict";

const { isRequired, default: getDefaultTargets, filterItems } = require("@babel/helper-compilation-targets");
const { declare } = require("@babel/helper-plugin-utils");
const semver = require("semver");
const debug = require("./debug");
const getOptionSpecificExcludes = require("./get-option-specific-excludes").default;
const filterItemsUtil = require("./filter-items");
const moduleTransformations = require("./module-transformations").default;
const normalizeOptions = require("./normalize-options").default;
const { proposalPlugins } = require("../data/shipped-proposals");
const { plugins, pluginsBugfixes, pluginSyntaxMap } = require("./plugins-compat-data");
const overlappingPlugins = require("@babel/compat-data/overlapping-plugins").default;
const usagePluginCorejs2 = require("./polyfills/corejs2/usage-plugin").default;
const usagePluginCorejs3 = require("./polyfills/corejs3/usage-plugin").default;
const usagePluginRegenerator = require("./polyfills/regenerator/usage-plugin").default;
const entryPluginCorejs2 = require("./polyfills/corejs2/entry-plugin").default;
const entryPluginCorejs3 = require("./polyfills/corejs3/entry-plugin").default;
const entryPluginRegenerator = require("./polyfills/regenerator/entry-plugin").default;
const availablePlugins = require("./available-plugins").default;
const { filterStageFromList } = require("./utils");

function isPluginRequired(targets, support) {
  return isRequired("fake-name", targets, { compatData: { "fake-name": support } });
}

const pluginLists = {
  withProposals: {
    withoutBugfixes: plugins,
    withBugfixes: Object.assign({}, plugins, pluginsBugfixes)
  },
  withoutProposals: {
    withoutBugfixes: filterStageFromList(plugins, proposalPlugins),
    withBugfixes: filterStageFromList(Object.assign({}, plugins, pluginsBugfixes), proposalPlugins)
  }
};

function getPluginList(proposals, bugfixes) {
  return proposals
    ? bugfixes
      ? pluginLists.withProposals.withBugfixes
      : pluginLists.withProposals.withoutBugfixes
    : bugfixes
    ? pluginLists.withoutProposals.withBugfixes
    : pluginLists.withoutProposals.withoutBugfixes;
}

const getPlugin = pluginName => {
  const plugin = availablePlugins[pluginName];
  if (!plugin) {
    throw new Error(`Could not find plugin "${pluginName}". Ensure there is an entry in ./available-plugins.js for it.`);
  }
  return plugin;
};

const transformIncludesAndExcludes = opts =>
  opts.reduce(
    (result, opt) => {
      const target = opt.match(/^(es|es6|es7|esnext|web)\./) ? "builtIns" : "plugins";
      result[target].add(opt);
      return result;
    },
    { all: opts, plugins: new Set(), builtIns: new Set() }
  );

function getModulesPluginNames({
  modules,
  transformations,
  shouldTransformESM,
  shouldTransformDynamicImport,
  shouldTransformExportNamespaceFrom,
  shouldParseTopLevelAwait
}) {
  const modulesPluginNames = [];
  if (modules !== false && transformations[modules]) {
    if (shouldTransformESM) modulesPluginNames.push(transformations[modules]);
    if (shouldTransformDynamicImport && shouldTransformESM && modules !== "umd") {
      modulesPluginNames.push("proposal-dynamic-import");
    } else {
      if (shouldTransformDynamicImport) {
        console.warn(
          "Dynamic import can only be supported when transforming ES modules" +
            " to AMD, CommonJS or SystemJS. Only the parser plugin will be enabled."
        );
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
}

function getPolyfillPlugins({
  useBuiltIns,
  corejs,
  polyfillTargets,
  include,
  exclude,
  proposals,
  shippedProposals,
  regenerator,
  debug
}) {
  const polyfillPlugins = [];
  if (useBuiltIns === "usage" || useBuiltIns === "entry") {
    const pluginOptions = { corejs, polyfillTargets, include, exclude, proposals, shippedProposals, regenerator, debug };
    if (corejs) {
      if (useBuiltIns === "usage") {
        if (corejs.major === 2) {
          polyfillPlugins.push([usagePluginCorejs2, pluginOptions]);
        } else {
          polyfillPlugins.push([usagePluginCorejs3, pluginOptions]);
        }
        if (regenerator) {
          polyfillPlugins.push([usagePluginRegenerator, pluginOptions]);
        }
      } else {
        if (corejs.major === 2) {
          polyfillPlugins.push([entryPluginCorejs2, pluginOptions]);
        } else {
          polyfillPlugins.push([entryPluginCorejs3, pluginOptions]);
          if (!regenerator) {
            polyfillPlugins.push([entryPluginRegenerator, pluginOptions]);
          }
        }
      }
    }
  }
  return polyfillPlugins;
}

function supportsStaticESM(caller) {
  return !!(caller == null ? void 0 : caller.supportsStaticESM);
}

function supportsDynamicImport(caller) {
  return !!(caller == null ? void 0 : caller.supportsDynamicImport);
}

function supportsExportNamespaceFrom(caller) {
  return !!(caller == null ? void 0 : caller.supportsExportNamespaceFrom);
}

function supportsTopLevelAwait(caller) {
  return !!(caller == null ? void 0 : caller.supportsTopLevelAwait);
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
  } = normalizeOptions(opts);

  let hasUglifyTarget = false;
  if (optionsTargets == null ? void 0 : optionsTargets.uglify) {
    hasUglifyTarget = true;
    delete optionsTargets.uglify;
    console.log("");
    console.log("The uglify target has been deprecated. Set the top level");
    console.log("option `forceAllTransforms: true` instead.");
    console.log("");
  }

  if ((optionsTargets == null ? void 0 : optionsTargets.esmodules) && optionsTargets.browsers) {
    console.log("");
    console.log("@babel/preset-env: esmodules and browsers targets have been specified together.");
    console.log(`\`browsers\` target, \`${optionsTargets.browsers}\` will be ignored.`);
    console.log("");
  }

  const targets = getDefaultTargets(optionsTargets, {
    ignoreBrowserslistConfig,
    configPath,
    browserslistEnv
  });

  const include = transformIncludesAndExcludes(optionsInclude);
  const exclude = transformIncludesAndExcludes(optionsExclude);

  const transformTargets = forceAllTransforms || hasUglifyTarget ? {} : targets;

  const compatData = getPluginList(shippedProposals, bugfixes);

  const shouldSkipExportNamespaceFrom =
    (modules === "auto" && (api.caller == null ? void 0 : api.caller(supportsExportNamespaceFrom))) ||
    (modules === false &&
      !isRequired("proposal-export-namespace-from", transformTargets, { compatData, includes: include.plugins, excludes: exclude.plugins }));

  const modulesPluginNames = getModulesPluginNames({
    modules,
    transformations: moduleTransformations,
    shouldTransformESM: modules !== "auto" || !(api.caller == null ? void 0 : api.caller(supportsStaticESM)),
    shouldTransformDynamicImport: modules !== "auto" || !(api.caller == null ? void 0 : api.caller(supportsDynamicImport)),
    shouldTransformExportNamespaceFrom: !shouldSkipExportNamespaceFrom,
    shouldParseTopLevelAwait: !api.caller || api.caller(supportsTopLevelAwait)
  });

  const pluginNames = filterItemsUtil(
    compatData,
    include.plugins,
    exclude.plugins,
    transformTargets,
    modulesPluginNames,
    getOptionSpecificExcludes({ loose }),
    pluginSyntaxMap
  );

  filterItemsUtil.removeUnnecessaryItems(pluginNames, overlappingPlugins);

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
    if (
      pluginName === "proposal-class-properties" ||
      pluginName === "proposal-private-methods" ||
      pluginName === "proposal-private-property-in-object"
    ) {
      return [
        getPlugin(pluginName),
        {
          loose: loose ? "#__internal__@babel/preset-env__prefer-true-but-false-is-ok-if-it-prevents-an-error" : "#__internal__@babel/preset-env__prefer-false-but-true-is-ok-if-it-prevents-an-error"
        }
      ];
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
      debug.logPluginOrPolyfill(pluginName, targets, plugins);
    });
    if (!useBuiltIns) {
      console.log("\nUsing polyfills: No polyfills were added, since the `useBuiltIns` option was not set.");
    } else {
      console.log(`\nUsing polyfills with \`${useBuiltIns}\` option:`);
    }
  }

  return { plugins };
});
