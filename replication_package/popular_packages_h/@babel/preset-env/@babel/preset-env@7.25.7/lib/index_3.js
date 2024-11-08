"use strict";

const { isRequired } = require("@babel/helper-compilation-targets");
const { declarePreset } = require("@babel/helper-plugin-utils");
const { default: semver } = require("semver");
const BabelPolyfillCoreJS = require("babel-plugin-polyfill-corejs3");
const availablePlugins = require("./available-plugins.js").default;
const { default: compileTargets } = require("@babel/helper-compilation-targets");
const { filterItems, removeUnsupportedItems, removeUnnecessaryItems, addProposalSyntaxPlugins } = require("./filter-items");
const {
  default: normalizeOptions,
  parseAndValidateValues,
  validateTopLevelOptions,
} = require("./normalize-options");
const { default: proposalPlugins, proposalSyntaxPlugins } = require("./shipped-proposals.js");
const {
  plugins: compatDataPlugins,
  pluginsBugfixes: compatDataBugfixes,
  overlappingPlugins,
} = require("./plugins-compat-data.js");
const babel7Plugins = require("./polyfills/babel-7-plugins.cjs");

// Checks if a plugin is required based on targets and support data
function isPluginRequired(targets, support) {
  return isRequired("fake-name", targets, { compatData: { "fake-name": support } });
}

// Filters a list of plugins based on stage compatibility
function filterStageFromList(list, stageList) {
  return Object.keys(list).reduce((result, item) => {
    if (!stageList.has(item)) {
      result[item] = list[item];
    }
    return result;
  }, {});
}

// Provides plugin configurations based on whether proposals or bugfixes are needed
function getPluginList(proposals, bugfixes) {
  const pluginLists = {
    withProposals: {
      withoutBugfixes: compatDataPlugins,
      withBugfixes: { ...compatDataPlugins, ...compatDataBugfixes },
    },
    withoutProposals: {
      withoutBugfixes: filterStageFromList(compatDataPlugins, proposalPlugins),
      withBugfixes: filterStageFromList(
        { ...compatDataPlugins, ...compatDataBugfixes },
        proposalPlugins
      ),
    },
  };
  return proposals
    ? bugfixes
      ? pluginLists.withProposals.withBugfixes
      : pluginLists.withProposals.withoutBugfixes
    : bugfixes
    ? pluginLists.withoutProposals.withBugfixes
    : pluginLists.withoutProposals.withoutBugfixes;
}

// Transforms inclusion and exclusion options into categorized sets
function transformIncludesAndExcludes(opts) {
  return opts.reduce(
    (result, opt) => {
      const target = /^(?:es|es6|es7|esnext|web)\./.test(opt) ? "builtIns" : "plugins";
      result[target].add(opt);
      return result;
    },
    { all: opts, plugins: new Set(), builtIns: new Set() }
  );
}

// Retrieves a plugin by name and throws an error if it doesn't exist
const getPlugin = (pluginName) => {
  const plugin = availablePlugins[pluginName]();
  if (!plugin) {
    throw new Error(
      `Could not find plugin "${pluginName}". Ensure there is an entry in ./available-plugins.js for it.`
    );
  }
  return plugin;
};

// Determines names of plugins for special modules based on current configuration
function getSpecialModulesPluginNames(
  modules,
  shouldTransformDynamicImport,
  babelVersion
) {
  const modulesPluginNames = [];
  if (modules) {
    modulesPluginNames.push(_moduleTransformations.default[modules]);
  }
  if (shouldTransformDynamicImport) {
    if (modules && modules !== "umd") {
      modulesPluginNames.push("transform-dynamic-import");
    } else {
      console.warn(
        "Dynamic import can only be transformed when transforming ES modules to AMD, CommonJS or SystemJS."
      );
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

// Retrieves options for CoreJS integration strategy
const getCoreJSOptions = ({
  useBuiltIns,
  corejs,
  polyfillTargets,
  include,
  exclude,
  proposals,
  shippedProposals,
  debug,
}) => ({
  method: `${useBuiltIns}-global`,
  version: corejs ? corejs.toString() : undefined,
  targets: polyfillTargets,
  include,
  exclude,
  proposals,
  shippedProposals,
  debug,
  "#__secret_key__@babel/preset-env__compatibility": {
    noRuntimeName: true,
  },
});

// Retrieves the list of polyfill plugins based on configuration
const getPolyfillPlugins = ({
  useBuiltIns,
  corejs,
  polyfillTargets,
  include,
  exclude,
  proposals,
  shippedProposals,
  regenerator,
  debug,
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
      debug,
    });
    if (corejs) {
      if (useBuiltIns === "usage") {
        if (corejs.major === 2) {
          polyfillPlugins.push(
            [babel7Plugins.pluginCoreJS2, pluginOptions],
            [babel7Plugins.legacyBabelPolyfillPlugin, { usage: true }]
          );
        } else {
          polyfillPlugins.push(
            [BabelPolyfillCoreJS, pluginOptions],
            [babel7Plugins.legacyBabelPolyfillPlugin, { usage: true, deprecated: true }]
          );
        }
        if (regenerator) {
          polyfillPlugins.push([
            babel7Plugins.pluginRegenerator,
            { method: "usage-global", debug },
          ]);
        }
      } else {
        if (corejs.major === 2) {
          polyfillPlugins.push(
            [babel7Plugins.legacyBabelPolyfillPlugin, { regenerator }],
            [babel7Plugins.pluginCoreJS2, pluginOptions]
          );
        } else {
          polyfillPlugins.push(
            [BabelPolyfillCoreJS, pluginOptions],
            [babel7Plugins.legacyBabelPolyfillPlugin, { deprecated: true }]
          );
          if (!regenerator) {
            polyfillPlugins.push([
              babel7Plugins.removeRegeneratorEntryPlugin,
              pluginOptions,
            ]);
          }
        }
      }
    }
  }
  return polyfillPlugins;
};

// Determines local targets based on options and configurations
function getLocalTargets(
  optionsTargets,
  ignoreBrowserslistConfig,
  configPath,
  browserslistEnv,
  api
) {
  if (optionsTargets != null && optionsTargets.esmodules && optionsTargets.browsers) {
    console.warn(`
  @babel/preset-env: esmodules and browsers targets have been specified together.
  'browsers' target, '${optionsTargets.browsers.toString()}' will be ignored.
  `);
  }
  return compileTargets(optionsTargets, {
    ignoreBrowserslistConfig,
    configPath,
    browserslistEnv,
    onBrowserslistConfigFound(config) {
      api.addExternalDependency(config);
    },
  });
}

// Checks whether static ESM is supported by the caller
function supportsStaticESM(caller) {
  return !!(caller != null && caller.supportsStaticESM);
}

// Checks whether dynamic import is supported by the caller
function supportsDynamicImport(caller) {
  return !!(caller != null && caller.supportsDynamicImport);
}

// Checks whether export namespace from is supported by the caller
function supportsExportNamespaceFrom(caller) {
  return !!(caller != null && caller.supportsExportNamespaceFrom);
}

// Main function to declare and configure the preset
var _default = (exports.default = declarePreset((api, opts) => {
  api.assertVersion(7);
  const babelTargets = api.targets();

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
    browserslistEnv,
  } = normalizeOptions(opts);

  const { loose, spec = false } = opts;

  let targets = babelTargets;
  if (
    semver.lt(api.version, "7.13.0") ||
    opts.targets ||
    opts.configPath ||
    opts.browserslistEnv ||
    opts.ignoreBrowserslistConfig
  ) {
    var hasUglifyTarget = false;
    if (optionsTargets != null && optionsTargets.uglify) {
      hasUglifyTarget = true;
      delete optionsTargets.uglify;
      console.warn(`
    The uglify target has been deprecated. Set the top-level 
    option 'forceAllTransforms: true' instead.
    `);
    }
    targets = getLocalTargets(
      optionsTargets,
      ignoreBrowserslistConfig,
      configPath,
      browserslistEnv,
      api
    );
  }

  const transformTargets = forceAllTransforms || hasUglifyTarget ? {} : targets;
  const include = transformIncludesAndExcludes(optionsInclude);
  const exclude = transformIncludesAndExcludes(optionsExclude);
  const compatData = getPluginList(shippedProposals, bugfixes);
  const modules =
    optionsModules === "auto" ? (api.caller(supportsStaticESM) ? false : "commonjs") : optionsModules;
  const shouldTransformDynamicImport =
    optionsModules === "auto" ? !api.caller(supportsDynamicImport) : !!modules;

  if (
    !exclude.plugins.has("transform-export-namespace-from") &&
    (optionsModules === "auto"
      ? !api.caller(supportsExportNamespaceFrom)
      : !!modules)
  ) {
    include.plugins.add("transform-export-namespace-from");
  }

  const pluginNames = filterItems(
    compatData,
    include.plugins,
    exclude.plugins,
    transformTargets,
    getSpecialModulesPluginNames(
      modules,
      shouldTransformDynamicImport,
      api.version
    ),
    !loose ? undefined : ["transform-typeof-symbol"],
    proposalPlugins
  );

  if (shippedProposals) {
    addProposalSyntaxPlugins(pluginNames, proposalSyntaxPlugins);
  }

  removeUnsupportedItems(pluginNames, api.version);
  removeUnnecessaryItems(pluginNames, overlappingPlugins);

  const polyfillPlugins = getPolyfillPlugins({
    useBuiltIns,
    corejs,
    polyfillTargets: targets,
    include: include.builtIns,
    exclude: exclude.builtIns,
    proposals,
    shippedProposals,
    regenerator: pluginNames.has("transform-regenerator"),
    debug: debug,
  });

  const pluginUseBuiltIns = useBuiltIns !== false;
  const plugins = Array.from(pluginNames).map((pluginName) => {
    if (
      pluginName === "transform-class-properties" ||
      pluginName === "transform-private-methods" ||
      pluginName === "transform-private-property-in-object"
    ) {
      return [
        getPlugin(pluginName),
        {
          loose: loose
            ? "#__internal__@babel/preset-env__prefer-true-but-false-is-ok-if-it-prevents-an-error"
            : "#__internal__@babel/preset-env__prefer-false-but-true-is-ok-if-it-prevents-an-error",
        },
      ];
    }
    if (pluginName === "syntax-import-attributes") {
      return [getPlugin(pluginName), { deprecatedAssertSyntax: true }];
    }
    return [
      getPlugin(pluginName),
      {
        spec,
        loose,
        useBuiltIns: pluginUseBuiltIns,
      },
    ];
  }).concat(polyfillPlugins);

  if (debug) {
    console.log("@babel/preset-env: `DEBUG` option");
    console.log("\nUsing targets:");
    console.log(JSON.stringify(compileTargets.prettifyTargets(targets), null, 2));
    console.log(`\nUsing modules transform: ${optionsModules.toString()}`);
    console.log("\nUsing plugins:");
    pluginNames.forEach((pluginName) => {
      logPlugin(pluginName, targets, compatData);
    });
    if (!useBuiltIns) {
      console.log(
        "\nUsing polyfills: No polyfills were added, since the `useBuiltIns` option was not set."
      );
    }
  }

  return {
    plugins,
  };
}));

exports.getModulesPluginNames = ({
  modules,
  transformations,
  shouldTransformESM,
  shouldTransformDynamicImport,
  shouldTransformExportNamespaceFrom,
}) => {
  const modulesPluginNames = [];
  if (modules !== false && transformations[modules]) {
    if (shouldTransformESM) {
      modulesPluginNames.push(transformations[modules]);
    }
    if (shouldTransformDynamicImport) {
      if (shouldTransformESM && modules !== "umd") {
        modulesPluginNames.push("transform-dynamic-import");
      } else {
        console.warn(
          "Dynamic import can only be transformed when transforming ES modules to AMD, CommonJS or SystemJS."
        );
      }
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
  modulesPluginNames.push("syntax-top-level-await");
  modulesPluginNames.push("syntax-import-meta");
  return modulesPluginNames;
};

//# sourceMappingURL=index.js.map
