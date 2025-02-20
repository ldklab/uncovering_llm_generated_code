"use strict";

const { default: semver } = require("semver");
const debug = require("./debug.js");
const filterItems = require("./filter-items.js");
const moduleTransformations = require("./module-transformations.js");
const normalizeOptions = require("./normalize-options.js");
const shippedProposals = require("./shipped-proposals.js");
const pluginsCompatData = require("./plugins-compat-data.js");
const babelPluginPolyfillCorejs = require("babel-plugin-polyfill-corejs3");
const babel7Plugins = require("./polyfills/babel-7-plugins.cjs");
const { isRequired, declarePreset, prettifyTargets } = require("@babel/helper-compilation-targets");
const availablePlugins = require("./available-plugins.js");

const pluginCoreJS3 = babelPluginPolyfillCorejs.default || babelPluginPolyfillCorejs;

function isPluginRequired(targets, support) {
  return isRequired("fake-name", targets, {
    compatData: {
      "fake-name": support
    }
  });
}

function filterStageFromList(list, stageList) {
  return Object.keys(list).reduce((result, item) => {
    if (!stageList.has(item)) {
      result[item] = list[item];
    }
    return result;
  }, {});
}

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

function getPluginList(proposals, bugfixes) {
  if (proposals) {
    return bugfixes ? pluginLists.withProposals.withBugfixes : pluginLists.withProposals.withoutBugfixes;
  } else {
    return bugfixes ? pluginLists.withoutProposals.withBugfixes : pluginLists.withoutProposals.withoutBugfixes;
  }
}

const getPlugin = pluginName => {
  const plugin = availablePlugins.default[pluginName]();
  if (!plugin) {
    throw new Error(`Could not find plugin "${pluginName}". Ensure there is an entry in ./available-plugins.js for it.`);
  }
  return plugin;
};

const transformIncludesAndExcludes = opts => {
  return opts.reduce((result, opt) => {
    const target = /^(?:es|es6|es7|esnext|web)\./.test(opt) ? "builtIns" : "plugins";
    result[target].add(opt);
    return result;
  }, {
    all: opts,
    plugins: new Set(),
    builtIns: new Set()
  });
}

function getSpecialModulesPluginNames(modules, shouldTransformDynamicImport, babelVersion) {
  const modulesPluginNames = [];
  if (modules) {
    modulesPluginNames.push(moduleTransformations.default[modules]);
  }
  if (shouldTransformDynamicImport) {
    if (modules && modules !== "umd") {
      modulesPluginNames.push("transform-dynamic-import");
    } else {
      console.warn("Dynamic import can only be transformed when transforming ES modules to AMD, CommonJS or SystemJS.");
    }
  }
  if (babelVersion[0] !== "8") {
    if (!shouldTransformDynamicImport) {
      modulesPluginNames.push("syntax-dynamic-import");
    }
    modulesPluginNames.push("syntax-top-level-await");
    modulesPluginNames.push("syntax-import-meta");
  }
  return modulesPluginNames;
}

const getCoreJSOptions = ({ useBuiltIns, corejs, polyfillTargets, include, exclude, proposals, shippedProposals, debug }) => ({
  method: `${useBuiltIns}-global`,
  version: corejs ? corejs.toString() : undefined,
  targets: polyfillTargets,
  include,
  exclude,
  proposals,
  shippedProposals,
  debug,
  "#__secret_key__@babel/preset-env__compatibility": {
    noRuntimeName: true
  }
});

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
    const pluginOptions = getCoreJSOptions({
      useBuiltIns,
      corejs,
      polyfillTargets,
      include,
      exclude,
      proposals,
      shippedProposals,
      debug
    });
    if (corejs) {
      if (useBuiltIns === "usage") {
        if (corejs.major === 2) {
          polyfillPlugins.push([babel7Plugins.pluginCoreJS2, pluginOptions], [babel7Plugins.legacyBabelPolyfillPlugin, { usage: true }]);
        } else {
          polyfillPlugins.push([pluginCoreJS3, pluginOptions], [babel7Plugins.legacyBabelPolyfillPlugin, { usage: true, deprecated: true }]);
        }
        if (regenerator) {
          polyfillPlugins.push([babel7Plugins.pluginRegenerator, { method: "usage-global", debug }]);
        }
      } else {
        if (corejs.major === 2) {
          polyfillPlugins.push([babel7Plugins.legacyBabelPolyfillPlugin, { regenerator }], [babel7Plugins.pluginCoreJS2, pluginOptions]);
        } else {
          polyfillPlugins.push([pluginCoreJS3, pluginOptions], [babel7Plugins.legacyBabelPolyfillPlugin, { deprecated: true }]);
          if (!regenerator) {
            polyfillPlugins.push([babel7Plugins.removeRegeneratorEntryPlugin, pluginOptions]);
          }
        }
      }
    }
  }
  return polyfillPlugins;
};

function getLocalTargets(optionsTargets, ignoreBrowserslistConfig, configPath, browserslistEnv, api) {
  if (optionsTargets && optionsTargets.esmodules && optionsTargets.browsers) {
    console.warn(`
@babel/preset-env: esmodules and browsers targets have been specified together.
\`browsers\` target, \`${optionsTargets.browsers.toString()}\` will be ignored.
`);
  }
  return isRequired(optionsTargets, {
    ignoreBrowserslistConfig,
    configPath,
    browserslistEnv,
    onBrowserslistConfigFound(config) {
      api.addExternalDependency(config);
    }
  });
}

function supportsStaticESM(caller) {
  return !!(caller && caller.supportsStaticESM);
}

function supportsDynamicImport(caller) {
  return !!(caller && caller.supportsDynamicImport);
}

function supportsExportNamespaceFrom(caller) {
  return !!(caller && caller.supportsExportNamespaceFrom);
}

const presetEnv = declarePreset((api, opts) => {
  api.assertVersion(7);
  const { 
    bugfixes,
    configPath,
    debug,
    exclude: optionsExclude,
    forceAllTransforms,
    ignoreBrowserslistConfig,
    include: optionsInclude,
    modules: optionsModules,
    shippedProposals,
    targets: optionsTargets,
    useBuiltIns,
    corejs: { version: corejs, proposals },
    browserslistEnv
  } = normalizeOptions(opts);

  let { loose, spec = false } = opts;
  let targets = api.targets();

  if (semver.lt(api.version, "7.13.0") || opts.targets || opts.configPath || opts.browserslistEnv || opts.ignoreBrowserslistConfig) {
    let hasUglifyTarget = false;
    if (optionsTargets && optionsTargets.uglify) {
      hasUglifyTarget = true;
      delete optionsTargets.uglify;
      console.warn(`
The uglify target has been deprecated. Set the top-level option \`forceAllTransforms: true\` instead.
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

  if (!exclude.plugins.has("transform-export-namespace-from") && (optionsModules === "auto" ? !api.caller(supportsExportNamespaceFrom) : !!modules)) {
    include.plugins.add("transform-export-namespace-from");
  }

  const pluginNames = filterItems.filterItems(
    compatData,
    include.plugins,
    exclude.plugins,
    transformTargets,
    getSpecialModulesPluginNames(modules, shouldTransformDynamicImport, api.version),
    !loose ? undefined : ["transform-typeof-symbol"],
    shippedProposals.pluginSyntaxMap
  );

  if (shippedProposals) {
    filterItems.addProposalSyntaxPlugins(pluginNames, shippedProposals.proposalSyntaxPlugins);
  }

  filterItems.removeUnsupportedItems(pluginNames, api.version);
  filterItems.removeUnnecessaryItems(pluginNames, pluginsCompatData.overlappingPlugins);

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
    if (["transform-class-properties", "transform-private-methods", "transform-private-property-in-object"].includes(pluginName)) {
      return [getPlugin(pluginName), {
        loose: loose ? "#__internal__@babel/preset-env__prefer-true-but-false-is-ok-if-it-prevents-an-error" : "#__internal__@babel/preset-env__prefer-false-but-true-is-ok-if-it-prevents-an-error"
      }];
    }
    if (pluginName === "syntax-import-attributes") {
      return [getPlugin(pluginName), {
        deprecatedAssertSyntax: true
      }];
    }
    return [getPlugin(pluginName), {
      spec,
      loose,
      useBuiltIns: pluginUseBuiltIns
    }];
  }).concat(polyfillPlugins);

  if (debug) {
    console.log("@babel/preset-env: `DEBUG` option");
    console.log("\nUsing targets:");
    console.log(JSON.stringify(prettifyTargets(targets), null, 2));
    console.log(`\nUsing modules transform: ${optionsModules}`);
    console.log("\nUsing plugins:");
    pluginNames.forEach(pluginName => {
      debug.logPlugin(pluginName, targets, compatData);
    });
    if (!useBuiltIns) {
      console.log("\nUsing polyfills: No polyfills were added, since the `useBuiltIns` option was not set.");
    }
  }

  return {
    plugins
  };
});

exports.default = presetEnv;
