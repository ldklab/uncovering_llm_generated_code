"use strict";

const path = require("path");
const { validate } = require("schema-utils");
const { SyncWaterfallHook } = require("tapable");
const schema = require("./plugin-options.json");
const utils = require("./utils");

const pluginName = "mini-css-extract-plugin";
const pluginSymbol = Symbol(pluginName);
const DEFAULT_FILENAME = "[name].css";

class MiniCssExtractPlugin {
  constructor(options = {}) {
    validate(schema, options, { baseDataPath: "options" });
    this.options = {
      filename: DEFAULT_FILENAME,
      ignoreOrder: false,
      runtime: true,
      ...options
    };
    this.runtimeOptions = {
      insert: options.insert,
      linkType:
        typeof options.linkType === "boolean"
          ? options.linkType ? "text/css" : false
          : options.linkType || "text/css",
      attributes: options.attributes
    };
    this._sortedModulesCache = new WeakMap();
  }

  apply(compiler) {
    compiler.hooks.compilation.tap(pluginName, (compilation) => {
      // Setup for modules and dependencies
      this.defineCompilationHooks(compilation);
      compilation.hooks.renderManifest.tap(pluginName, (result, { chunk }) =>
        this.renderManifestHandler(result, chunk, compilation, compiler)
      );
      compilation.hooks.contentHash.tap(pluginName, (chunk) =>
        this.contentHashHandler(chunk, compilation, compiler)
      );

      // Setup inline and runtime settings
      if (this.options.runtime) {
        this.setupRuntime(compilation, compiler);
      }
    });
  }

  defineCompilationHooks(compilation) {
    class CssModuleFactory {
      create({ dependencies: [dependency] }, callback) {
        callback(undefined, new CssModule(dependency));
      }
    }
    class CssDependencyTemplate {
      apply() {}
    }
    compilation.dependencyFactories.set(CssDependency, new CssModuleFactory());
    compilation.dependencyTemplates.set(CssDependency, new CssDependencyTemplate());
  }

  renderManifestHandler(result, chunk, compilation, compiler) {
    const { chunkGraph } = compilation;
    const renderedModules = Array.from(this.getChunkModules(chunk, chunkGraph)).filter(
      (module) => module.type === utils.MODULE_TYPE
    );
    const filenameTemplate = chunk.canBeInitial() ? this.options.filename : this.options.chunkFilename;
    if (renderedModules.length > 0) {
      result.push({
        render: () =>
          this.renderContentAsset(compiler, compilation, chunk, renderedModules),
        filenameTemplate,
        pathOptions: { chunk, contentHashType: utils.MODULE_TYPE },
        identifier: `${pluginName}.${chunk.id}`,
        hash: chunk.contentHash[utils.MODULE_TYPE]
      });
    }
  }

  contentHashHandler(chunk, compilation, compiler) {
    const modules = this.sortModules(compilation, chunk, chunkGraph.getChunkModulesIterableBySourceType(chunk, utils.MODULE_TYPE));
    if (modules) {
      const hash = webpack.util.createHash(outputOptions.hashFunction);
      for (const m of modules) {
        hash.update(chunkGraph.getModuleHash(m, chunk.runtime));
      }
      chunk.contentHash[utils.MODULE_TYPE] = hash.digest(hashDigest).substring(0, hashDigestLength);
    }
  }

  setupRuntime(compilation, compiler) {
    const { RuntimeGlobals, runtime, Template } = webpack;
    const handler = (chunk, set) => {
      if (typeof this.options.chunkFilename === "string" && /\[(full)?hash(:\d+)?\]/.test(this.options.chunkFilename)) {
        set.add(RuntimeGlobals.getFullHash);
      }
      set.add(RuntimeGlobals.publicPath);
      compilation.addRuntimeModule(chunk, new runtime.GetChunkFilenameRuntimeModule(
        utils.MODULE_TYPE,
        "mini-css",
        `${RuntimeGlobals.require}.miniCssF`,
        (referencedChunk) => {
          if (!referencedChunk.contentHash[utils.MODULE_TYPE]) {
            return false;
          }
          return referencedChunk.canBeInitial()
            ? this.options.filename
            : this.options.chunkFilename;
        },
        false
      ));
      compilation.addRuntimeModule(chunk, new CssLoadingRuntimeModule(set, this.runtimeOptions));
    };

    compilation.hooks.runtimeRequirementInTree.for(RuntimeGlobals.ensureChunkHandlers).tap(pluginName, handler);
    compilation.hooks.runtimeRequirementInTree.for(RuntimeGlobals.hmrDownloadUpdateHandlers).tap(pluginName, handler);
    compilation.hooks.runtimeRequirementInTree.for(RuntimeGlobals.prefetchChunkHandlers).tap(pluginName, handler);
    compilation.hooks.runtimeRequirementInTree.for(RuntimeGlobals.preloadChunkHandlers).tap(pluginName, handler);
  }

  getChunkModules(chunk, chunkGraph) {
    return chunkGraph.getOrderedChunkModulesIterable(chunk, utils.compareModulesByIdentifier);
  }

  sortModules(compilation, chunk, modules) {
    let usedModules = this._sortedModulesCache.get(chunk);
    if (usedModules || !modules) {
      return usedModules;
    }

    usedModules = new Set();
    const moduleDependencies = new Map();
    const modulesByChunkGroup = Array.from(chunk.groupsIterable, (chunkGroup) => {
      const sortedModules = modules
        .map((module) => ({
          module,
          index: chunkGroup.getModulePostOrderIndex(module),
        }))
        .filter((item) => item.index !== undefined)
        .sort((a, b) => b.index - a.index)
        .map((item) => item.module);

      for (let i = 0; i < sortedModules.length; i++) {
        const set = moduleDependencies.get(sortedModules[i]) || new Set();
        moduleDependencies.set(sortedModules[i], set);
        for (let j = i + 1; j < sortedModules.length; j++) {
          set.add(sortedModules[j]);
        }
      }
      return sortedModules;
    });

    while (usedModules.size < modules.length) {
      let success = false;
      for (const list of modulesByChunkGroup) {
        while (list.length > 0 && usedModules.has(list[list.length - 1])) {
          list.pop();
        }
        if (list.length !== 0) {
          const module = list[list.length - 1];
          const deps = moduleDependencies.get(module);
          if (Array.from(deps).every((m) => usedModules.has(m))) {
            usedModules.add(list.pop());
            success = true;
            break;
          }
        }
      }
      if (!success) {
        if (!this.options.ignoreOrder) {
          compilation.warnings.push(new Error("Conflicting order."));
        }
        usedModules.add(list.pop());
      }
    }
    this._sortedModulesCache.set(chunk, usedModules);
    return usedModules;
  }

  renderContentAsset(compiler, compilation, chunk, modules) {
    const usedModules = this.sortModules(compilation, chunk, modules);
    const { ConcatSource, SourceMapSource, RawSource } = compiler.webpack.sources;
    const source = new ConcatSource();
    const externalsSource = new ConcatSource();

    for (const module of usedModules) {
      let content = module.content.toString();
      const readableIdentifier = module.readableIdentifier(requestShortener);
      const startsWithAtRuleImport = /^@import url/.test(content);

      if (startsWithAtRuleImport) {
        externalsSource.add(content);
        externalsSource.add("\n");
      } else {
        source.add(content);
        source.add("\n");
      }
    }
    return new ConcatSource(externalsSource, source);
  }
}

MiniCssExtractPlugin.pluginName = pluginName;
module.exports = MiniCssExtractPlugin;
