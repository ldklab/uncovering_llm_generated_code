"use strict";

const util = require("util");
const memoize = require("./util/memoize");

const lazyFunction = (factory) => {
  const fac = memoize(factory);
  return (...args) => fac()(...args);
};

const mergeExports = (obj, exports) => {
  const descriptors = Object.getOwnPropertyDescriptors(exports);
  for (const name of Object.keys(descriptors)) {
    const descriptor = descriptors[name];
    if (descriptor.get) {
      Object.defineProperty(obj, name, {
        configurable: false,
        enumerable: true,
        get: memoize(descriptor.get),
      });
    } else if (typeof descriptor.value === "object") {
      Object.defineProperty(obj, name, {
        configurable: false,
        enumerable: true,
        writable: false,
        value: mergeExports({}, descriptor.value),
      });
    } else {
      throw new Error(
        "Exposed values must be either a getter or a nested object"
      );
    }
  }
  return Object.freeze(obj);
};

const fn = lazyFunction(() => require("./webpack"));
module.exports = mergeExports(fn, {
  get webpack() {
    return require("./webpack");
  },
  get validate() {
    const checkOptions = require("../schemas/WebpackOptions.check.js");
    const getRealValidate = memoize(() => {
      const validateSchema = require("./validateSchema");
      const webpackOptionsSchema = require("../schemas/WebpackOptions.json");
      return (options) => validateSchema(webpackOptionsSchema, options);
    });
    return (options) => {
      if (!checkOptions(options)) getRealValidate()(options);
    };
  },
  get validateSchema() {
    return require("./validateSchema");
  },
  get version() {
    return require("../package.json").version;
  },
  get cli() {
    return require("./cli");
  },
  get AutomaticPrefetchPlugin() {
    return require("./AutomaticPrefetchPlugin");
  },
  get AsyncDependenciesBlock() {
    return require("./AsyncDependenciesBlock");
  },
  get BannerPlugin() {
    return require("./BannerPlugin");
  },
  get Cache() {
    return require("./Cache");
  },
  get Chunk() {
    return require("./Chunk");
  },
  get ChunkGraph() {
    return require("./ChunkGraph");
  },
  get CleanPlugin() {
    return require("./CleanPlugin");
  },
  get Compilation() {
    return require("./Compilation");
  },
  get Compiler() {
    return require("./Compiler");
  },
  get ConcatenationScope() {
    return require("./ConcatenationScope");
  },
  get ContextExclusionPlugin() {
    return require("./ContextExclusionPlugin");
  },
  get ContextReplacementPlugin() {
    return require("./ContextReplacementPlugin");
  },
  get DefinePlugin() {
    return require("./DefinePlugin");
  },
  get DelegatedPlugin() {
    return require("./DelegatedPlugin");
  },
  get Dependency() {
    return require("./Dependency");
  },
  get DllPlugin() {
    return require("./DllPlugin");
  },
  get DllReferencePlugin() {
    return require("./DllReferencePlugin");
  },
  get DynamicEntryPlugin() {
    return require("./DynamicEntryPlugin");
  },
  get EntryOptionPlugin() {
    return require("./EntryOptionPlugin");
  },
  get EntryPlugin() {
    return require("./EntryPlugin");
  },
  get EnvironmentPlugin() {
    return require("./EnvironmentPlugin");
  },
  get EvalDevToolModulePlugin() {
    return require("./EvalDevToolModulePlugin");
  },
  get EvalSourceMapDevToolPlugin() {
    return require("./EvalSourceMapDevToolPlugin");
  },
  get ExternalModule() {
    return require("./ExternalModule");
  },
  get ExternalsPlugin() {
    return require("./ExternalsPlugin");
  },
  get Generator() {
    return require("./Generator");
  },
  get HotUpdateChunk() {
    return require("./HotUpdateChunk");
  },
  get HotModuleReplacementPlugin() {
    return require("./HotModuleReplacementPlugin");
  },
  get InitFragment() {
    return require("./InitFragment");
  },
  get IgnorePlugin() {
    return require("./IgnorePlugin");
  },
  get JavascriptModulesPlugin() {
    return util.deprecate(
      () => require("./javascript/JavascriptModulesPlugin"),
      "webpack.JavascriptModulesPlugin has moved to webpack.javascript.JavascriptModulesPlugin",
      "DEP_WEBPACK_JAVASCRIPT_MODULES_PLUGIN"
    )();
  },
  get LibManifestPlugin() {
    return require("./LibManifestPlugin");
  },
  get LibraryTemplatePlugin() {
    return util.deprecate(
      () => require("./LibraryTemplatePlugin"),
      "webpack.LibraryTemplatePlugin is deprecated and has been replaced by compilation.outputOptions.library or compilation.addEntry + passing a library option",
      "DEP_WEBPACK_LIBRARY_TEMPLATE_PLUGIN"
    )();
  },
  get LoaderOptionsPlugin() {
    return require("./LoaderOptionsPlugin");
  },
  get LoaderTargetPlugin() {
    return require("./LoaderTargetPlugin");
  },
  get Module() {
    return require("./Module");
  },
  get ModuleFilenameHelpers() {
    return require("./ModuleFilenameHelpers");
  },
  get ModuleGraph() {
    return require("./ModuleGraph");
  },
  get ModuleGraphConnection() {
    return require("./ModuleGraphConnection");
  },
  get NoEmitOnErrorsPlugin() {
    return require("./NoEmitOnErrorsPlugin");
  },
  get NormalModule() {
    return require("./NormalModule");
  },
  get NormalModuleReplacementPlugin() {
    return require("./NormalModuleReplacementPlugin");
  },
  get MultiCompiler() {
    return require("./MultiCompiler");
  },
  get OptimizationStages() {
    return require("./OptimizationStages");
  },
  get Parser() {
    return require("./Parser");
  },
  get PlatformPlugin() {
    return require("./PlatformPlugin");
  },
  get PrefetchPlugin() {
    return require("./PrefetchPlugin");
  },
  get ProgressPlugin() {
    return require("./ProgressPlugin");
  },
  get ProvidePlugin() {
    return require("./ProvidePlugin");
  },
  get RuntimeGlobals() {
    return require("./RuntimeGlobals");
  },
  get RuntimeModule() {
    return require("./RuntimeModule");
  },
  get SingleEntryPlugin() {
    return util.deprecate(
      () => require("./EntryPlugin"),
      "SingleEntryPlugin was renamed to EntryPlugin",
      "DEP_WEBPACK_SINGLE_ENTRY_PLUGIN"
    )();
  },
  get SourceMapDevToolPlugin() {
    return require("./SourceMapDevToolPlugin");
  },
  get Stats() {
    return require("./Stats");
  },
  get Template() {
    return require("./Template");
  },
  get UsageState() {
    return require("./ExportsInfo").UsageState;
  },
  get WatchIgnorePlugin() {
    return require("./WatchIgnorePlugin");
  },
  get WebpackError() {
    return require("./WebpackError");
  },
  get WebpackOptionsApply() {
    return require("./WebpackOptionsApply");
  },
  get WebpackOptionsDefaulter() {
    return util.deprecate(
      () => require("./WebpackOptionsDefaulter"),
      "webpack.WebpackOptionsDefaulter is deprecated and has been replaced by webpack.config.getNormalizedWebpackOptions and webpack.config.applyWebpackOptionsDefaults",
      "DEP_WEBPACK_OPTIONS_DEFAULTER"
    )();
  },
  get WebpackOptionsValidationError() {
    return require("schema-utils").ValidationError;
  },
  get ValidationError() {
    return require("schema-utils").ValidationError;
  },
  cache: {
    get MemoryCachePlugin() {
      return require("./cache/MemoryCachePlugin");
    }
  },
  config: {
    get getNormalizedWebpackOptions() {
      return require("./config/normalization").getNormalizedWebpackOptions;
    },
    get applyWebpackOptionsDefaults() {
      return require("./config/defaults").applyWebpackOptionsDefaults;
    }
  },
  dependencies: {
    get ModuleDependency() {
      return require("./dependencies/ModuleDependency");
    },
    get HarmonyImportDependency() {
      return require("./dependencies/HarmonyImportDependency");
    },
    get ConstDependency() {
      return require("./dependencies/ConstDependency");
    },
    get NullDependency() {
      return require("./dependencies/NullDependency");
    }
  },
  ids: {
    get ChunkModuleIdRangePlugin() {
      return require("./ids/ChunkModuleIdRangePlugin");
    },
    get NaturalModuleIdsPlugin() {
      return require("./ids/NaturalModuleIdsPlugin");
    },
    get OccurrenceModuleIdsPlugin() {
      return require("./ids/OccurrenceModuleIdsPlugin");
    },
    get NamedModuleIdsPlugin() {
      return require("./ids/NamedModuleIdsPlugin");
    },
    get DeterministicChunkIdsPlugin() {
      return require("./ids/DeterministicChunkIdsPlugin");
    },
    get DeterministicModuleIdsPlugin() {
      return require("./ids/DeterministicModuleIdsPlugin");
    },
    get NamedChunkIdsPlugin() {
      return require("./ids/NamedChunkIdsPlugin");
    },
    get OccurrenceChunkIdsPlugin() {
      return require("./ids/OccurrenceChunkIdsPlugin");
    },
    get HashedModuleIdsPlugin() {
      return require("./ids/HashedModuleIdsPlugin");
    }
  },
  javascript: {
    get EnableChunkLoadingPlugin() {
      return require("./javascript/EnableChunkLoadingPlugin");
    },
    get JavascriptModulesPlugin() {
      return require("./javascript/JavascriptModulesPlugin");
    },
    get JavascriptParser() {
      return require("./javascript/JavascriptParser");
    }
  },
  optimize: {
    get AggressiveMergingPlugin() {
      return require("./optimize/AggressiveMergingPlugin");
    },
    get AggressiveSplittingPlugin() {
      return util.deprecate(
        () => require("./optimize/AggressiveSplittingPlugin"),
        "AggressiveSplittingPlugin is deprecated in favor of SplitChunksPlugin",
        "DEP_WEBPACK_AGGRESSIVE_SPLITTING_PLUGIN"
      )();
    },
    get InnerGraph() {
      return require("./optimize/InnerGraph");
    },
    get LimitChunkCountPlugin() {
      return require("./optimize/LimitChunkCountPlugin");
    },
    get MinChunkSizePlugin() {
      return require("./optimize/MinChunkSizePlugin");
    },
    get ModuleConcatenationPlugin() {
      return require("./optimize/ModuleConcatenationPlugin");
    },
    get RealContentHashPlugin() {
      return require("./optimize/RealContentHashPlugin");
    },
    get RuntimeChunkPlugin() {
      return require("./optimize/RuntimeChunkPlugin");
    },
    get SideEffectsFlagPlugin() {
      return require("./optimize/SideEffectsFlagPlugin");
    },
    get SplitChunksPlugin() {
      return require("./optimize/SplitChunksPlugin");
    }
  },
  runtime: {
    get GetChunkFilenameRuntimeModule() {
      return require("./runtime/GetChunkFilenameRuntimeModule");
    },
    get LoadScriptRuntimeModule() {
      return require("./runtime/LoadScriptRuntimeModule");
    }
  },
  prefetch: {
    get ChunkPrefetchPreloadPlugin() {
      return require("./prefetch/ChunkPrefetchPreloadPlugin");
    }
  },
  web: {
    get FetchCompileAsyncWasmPlugin() {
      return require("./web/FetchCompileAsyncWasmPlugin");
    },
    get FetchCompileWasmPlugin() {
      return require("./web/FetchCompileWasmPlugin");
    },
    get JsonpChunkLoadingRuntimeModule() {
      return require("./web/JsonpChunkLoadingRuntimeModule");
    },
    get JsonpTemplatePlugin() {
      return require("./web/JsonpTemplatePlugin");
    }
  },
  webworker: {
    get WebWorkerTemplatePlugin() {
      return require("./webworker/WebWorkerTemplatePlugin");
    }
  },
  node: {
    get NodeEnvironmentPlugin() {
      return require("./node/NodeEnvironmentPlugin");
    },
    get NodeSourcePlugin() {
      return require("./node/NodeSourcePlugin");
    },
    get NodeTargetPlugin() {
      return require("./node/NodeTargetPlugin");
    },
    get NodeTemplatePlugin() {
      return require("./node/NodeTemplatePlugin");
    },
    get ReadFileCompileWasmPlugin() {
      return require("./node/ReadFileCompileWasmPlugin");
    }
  },
  electron: {
    get ElectronTargetPlugin() {
      return require("./electron/ElectronTargetPlugin");
    }
  },
  wasm: {
    get AsyncWebAssemblyModulesPlugin() {
      return require("./wasm-async/AsyncWebAssemblyModulesPlugin");
    },
    get EnableWasmLoadingPlugin() {
      return require("./wasm/EnableWasmLoadingPlugin");
    }
  },
  library: {
    get AbstractLibraryPlugin() {
      return require("./library/AbstractLibraryPlugin");
    },
    get EnableLibraryPlugin() {
      return require("./library/EnableLibraryPlugin");
    }
  },
  container: {
    get ContainerPlugin() {
      return require("./container/ContainerPlugin");
    },
    get ContainerReferencePlugin() {
      return require("./container/ContainerReferencePlugin");
    },
    get ModuleFederationPlugin() {
      return require("./container/ModuleFederationPlugin");
    },
    get scope() {
      return require("./container/options").scope;
    }
  },
  sharing: {
    get ConsumeSharedPlugin() {
      return require("./sharing/ConsumeSharedPlugin");
    },
    get ProvideSharedPlugin() {
      return require("./sharing/ProvideSharedPlugin");
    },
    get SharePlugin() {
      return require("./sharing/SharePlugin");
    },
    get scope() {
      return require("./container/options").scope;
    }
  },
  debug: {
    get ProfilingPlugin() {
      return require("./debug/ProfilingPlugin");
    }
  },
  util: {
    get createHash() {
      return require("./util/createHash");
    },
    get comparators() {
      return require("./util/comparators");
    },
    get runtime() {
      return require("./util/runtime");
    },
    get serialization() {
      return require("./util/serialization");
    },
    get cleverMerge() {
      return require("./util/cleverMerge").cachedCleverMerge;
    },
    get LazySet() {
      return require("./util/LazySet");
    },
    get compileBooleanMatcher() {
      return require("./util/compileBooleanMatcher");
    }
  },
  get sources() {
    return require("webpack-sources");
  },
  experiments: {
    schemes: {
      get HttpUriPlugin() {
        return require("./schemes/HttpUriPlugin");
      }
    },
    ids: {
      get SyncModuleIdsPlugin() {
        return require("./ids/SyncModuleIdsPlugin");
      }
    }
  }
});
