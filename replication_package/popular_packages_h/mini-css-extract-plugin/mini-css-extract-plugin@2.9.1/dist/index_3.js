"use strict";

const path = require("path");
const { validate } = require("schema-utils");
const { SyncWaterfallHook } = require("tapable");
const schema = require("./plugin-options.json");
const {
  trueFn,
  MODULE_TYPE,
  AUTO_PUBLIC_PATH,
  ABSOLUTE_PUBLIC_PATH,
  SINGLE_DOT_PATH_SEGMENT,
  compareModulesByIdentifier,
  getUndoPath,
  BASE_URI,
  compileBooleanMatcher
} = require("./utils");

const pluginName = "mini-css-extract-plugin";
const pluginSymbol = Symbol(pluginName);
const DEFAULT_FILENAME = "[name].css";
const TYPES = new Set([MODULE_TYPE]);
const CODE_GENERATION_RESULT = {
  sources: new Map(),
  runtimeRequirements: new Set()
};

const cssModuleCache = new WeakMap();
const cssDependencyCache = new WeakMap();
const registered = new WeakSet();
const compilationHooksMap = new WeakMap();

class MiniCssExtractPlugin {
  static getCssModule(webpack) {
    if (cssModuleCache.has(webpack)) {
      return cssModuleCache.get(webpack);
    }

    class CssModule extends webpack.Module {
      constructor({
        context,
        identifier,
        identifierIndex,
        content,
        layer,
        supports,
        media,
        sourceMap,
        assets,
        assetsInfo
      }) {
        super(MODULE_TYPE, context);
        this.id = "";
        this._context = context;
        this._identifier = identifier;
        this._identifierIndex = identifierIndex;
        this.content = content;
        this.layer = layer;
        this.supports = supports;
        this.media = media;
        this.sourceMap = sourceMap;
        this.assets = assets;
        this.assetsInfo = assetsInfo;
        this._needBuild = true;
      }

      size() {
        return this.content.length;
      }

      identifier() {
        return `css|${this._identifier}|${this._identifierIndex}|${this.layer || ""}|${this.supports || ""}|${this.media}}}`;
      }

      readableIdentifier(requestShortener) {
        return `css ${requestShortener.shorten(this._identifier)}${this._identifierIndex ? ` (${this._identifierIndex})` : ""}${this.layer ? ` (layer ${this.layer})` : ""}${this.supports ? ` (supports ${this.supports})` : ""}${this.media ? ` (media ${this.media})` : ""}`;
      }

      getSourceTypes() {
        return TYPES;
      }

      codeGeneration() {
        return CODE_GENERATION_RESULT;
      }

      nameForCondition() {
        const resource = this._identifier.split("!").pop();
        const idx = resource.indexOf("?");
        return idx >= 0 ? resource.substring(0, idx) : resource;
      }

      updateCacheModule(module) {
        if (!this.content.equals(module.content) || this.layer !== module.layer || this.supports !== module.supports || this.media !== module.media ||
            (this.sourceMap ? !this.sourceMap.equals(module.sourceMap) : false) ||
            this.assets !== module.assets || this.assetsInfo !== module.assetsInfo) {
          this._needBuild = true;
          this.content = module.content;
          this.layer = module.layer;
          this.supports = module.supports;
          this.media = module.media;
          this.sourceMap = module.sourceMap;
          this.assets = module.assets;
          this.assetsInfo = module.assetsInfo;
        }
      }

      needRebuild() {
        return this._needBuild;
      }

      needBuild(context, callback) {
        callback(undefined, this._needBuild);
      }

      build(options, compilation, resolver, fileSystem, callback) {
        this.buildInfo = {
          assets: this.assets,
          assetsInfo: this.assetsInfo,
          cacheable: true,
          hash: this._computeHash(compilation.outputOptions.hashFunction)
        };
        this.buildMeta = {};
        this._needBuild = false;
        callback();
      }

      _computeHash(hashFunction) {
        const hash = webpack.util.createHash(hashFunction);
        hash.update(this.content);
        if (this.layer) hash.update(this.layer);
        hash.update(this.supports || "");
        hash.update(this.media || "");
        hash.update(this.sourceMap || "");
        return hash.digest("hex");
      }

      updateHash(hash, context) {
        super.updateHash(hash, context);
        hash.update(this.buildInfo.hash);
      }

      serialize(context) {
        const { write } = context;
        write(this._context);
        write(this._identifier);
        write(this._identifierIndex);
        write(this.content);
        write(this.layer);
        write(this.supports);
        write(this.media);
        write(this.sourceMap);
        write(this.assets);
        write(this.assetsInfo);
        write(this._needBuild);
        super.serialize(context);
      }

      deserialize(context) {
        super.deserialize(context);
      }
    }

    cssModuleCache.set(webpack, CssModule);
    return CssModule;
  }

  static getCssDependency(webpack) {
    if (cssDependencyCache.has(webpack)) {
      return cssDependencyCache.get(webpack);
    }

    class CssDependency extends webpack.Dependency {
      constructor({ identifier, content, layer, supports, media, sourceMap }, context, identifierIndex) {
        super();
        this.identifier = identifier;
        this.identifierIndex = identifierIndex;
        this.content = content;
        this.layer = layer;
        this.supports = supports;
        this.media = media;
        this.sourceMap = sourceMap;
        this.context = context;
        this.assets = undefined;
        this.assetsInfo = undefined;
      }

      getResourceIdentifier() {
        return `css-module-${this.identifier}-${this.identifierIndex}`;
      }

      getModuleEvaluationSideEffectsState() {
        return webpack.ModuleGraphConnection.TRANSITIVE_ONLY;
      }

      serialize(context) {
        const { write } = context;
        write(this.identifier);
        write(this.content);
        write(this.layer);
        write(this.supports);
        write(this.media);
        write(this.sourceMap);
        write(this.context);
        write(this.identifierIndex);
        write(this.assets);
        write(this.assetsInfo);
        super.serialize(context);
      }

      deserialize(context) {
        super.deserialize(context);
      }
    }

    cssDependencyCache.set(webpack, CssDependency);
    return CssDependency;
  }

  static getCompilationHooks(compilation) {
    let hooks = compilationHooksMap.get(compilation);
    if (!hooks) {
      hooks = {
        beforeTagInsert: new SyncWaterfallHook(["source", "varNames"], "string"),
        linkPreload: new SyncWaterfallHook(["source", "chunk"]),
        linkPrefetch: new SyncWaterfallHook(["source", "chunk"])
      };
      compilationHooksMap.set(compilation, hooks);
    }
    return hooks;
  }

  constructor(options = {}) {
    validate(schema, options, {
      baseDataPath: "options"
    });

    this._sortedModulesCache = new WeakMap();
    this.options = Object.assign({
      filename: DEFAULT_FILENAME,
      ignoreOrder: false,
      runtime: true
    }, options);

    this.runtimeOptions = {
      insert: options.insert,
      linkType: typeof options.linkType === "boolean" && options.linkType === true || typeof options.linkType === "undefined" ? "text/css" : options.linkType,
      attributes: options.attributes
    };

    if (!this.options.chunkFilename) {
      const { filename } = this.options;
      if (typeof filename !== "function") {
        const hasName = filename.includes("[name]");
        const hasId = filename.includes("[id]");
        const hasChunkHash = filename.includes("[chunkhash]");
        const hasContentHash = filename.includes("[contenthash]");
        if (hasChunkHash || hasContentHash || hasName || hasId) {
          this.options.chunkFilename = filename;
        } else {
          this.options.chunkFilename = filename.replace(/(^|\/)([^/]*(?:\?|$))/, "$1[id].$2");
        }
      } else {
        this.options.chunkFilename = "[id].css";
      }
    }
  }

  apply(compiler) {
    const { webpack } = compiler;
    if (this.options.experimentalUseImportModule) {
      if (typeof compiler.options.experiments.executeModule === "undefined") {
        compiler.options.experiments.executeModule = true;
      }
    }

    if (!registered.has(webpack)) {
      registered.add(webpack);
      webpack.util.serialization.registerLoader(/^mini-css-extract-plugin\//, trueFn);
    }

    const { splitChunks } = compiler.options.optimization;
    if (splitChunks && splitChunks.defaultSizeTypes.includes("...")) {
      splitChunks.defaultSizeTypes.push(MODULE_TYPE);
    }

    const CssModule = MiniCssExtractPlugin.getCssModule(webpack);
    const CssDependency = MiniCssExtractPlugin.getCssDependency(webpack);
    const { NormalModule } = compiler.webpack;

    compiler.hooks.compilation.tap(pluginName, compilation => {
      const { loader: normalModuleHook } = NormalModule.getCompilationHooks(compilation);
      normalModuleHook.tap(pluginName, loaderContext => {
        loaderContext[pluginSymbol] = { experimentalUseImportModule: this.options.experimentalUseImportModule };
      });
    });

    compiler.hooks.thisCompilation.tap(pluginName, compilation => {
      class CssModuleFactory {
        create({ dependencies: [dependency] }, callback) {
          callback(undefined, new CssModule(dependency));
        }
      }

      compilation.dependencyFactories.set(CssDependency, new CssModuleFactory());

      class CssDependencyTemplate {
        apply() {}
      }

      compilation.dependencyTemplates.set(CssDependency, new CssDependencyTemplate());

      compilation.hooks.renderManifest.tap(pluginName, (result, { chunk }) => {
        const { chunkGraph } = compilation;
        const { HotUpdateChunk } = webpack;

        if (!(chunk instanceof HotUpdateChunk)) {
          const renderedModules = Array.from(this.getChunkModules(chunk, chunkGraph))
            .filter(module => module.type === MODULE_TYPE);

          const filenameTemplate = chunk.canBeInitial() ? this.options.filename : this.options.chunkFilename;
          if (renderedModules.length > 0) {
            result.push({
              render: () => this.renderContentAsset(compiler, compilation, chunk, renderedModules, 
                compilation.runtimeTemplate.requestShortener, filenameTemplate, { contentHashType: MODULE_TYPE, chunk }),
              filenameTemplate,
              pathOptions: { chunk, contentHashType: MODULE_TYPE },
              identifier: `${pluginName}.${chunk.id}`,
              hash: chunk.contentHash[MODULE_TYPE]
            });
          }
        }
      });

      compilation.hooks.contentHash.tap(pluginName, chunk => {
        const { outputOptions, chunkGraph } = compilation;
        const modules = this.sortModules(compilation, chunk, 
          chunkGraph.getChunkModulesIterableBySourceType(chunk, MODULE_TYPE), compilation.runtimeTemplate.requestShortener);
        
        if (modules) {
          const { hashFunction, hashDigest, hashDigestLength } = outputOptions;
          const { createHash } = compiler.webpack.util;
          const hash = createHash(hashFunction);
          for (const m of modules) {
            hash.update(chunkGraph.getModuleHash(m, chunk.runtime));
          }
          chunk.contentHash[MODULE_TYPE] = hash.digest(hashDigest).substring(0, hashDigestLength);
        }
      });

      if (this.options.runtime) {
        const { Template, RuntimeGlobals, RuntimeModule, runtime } = webpack;
        const getCssChunkObject = (mainChunk, compilation) => {
          const obj = {};
          const { chunkGraph } = compilation;
          for (const chunk of mainChunk.getAllAsyncChunks()) {
            const modules = chunkGraph.getOrderedChunkModulesIterable(chunk, compareModulesByIdentifier);
            for (const module of modules) {
              if (module.type === MODULE_TYPE) {
                obj[chunk.id] = 1;
                break;
              }
            }
          }
          return obj;
        };

        function chunkHasCss(chunk, chunkGraph) {
          return !!chunkGraph.getChunkModulesIterableBySourceType(chunk, "css/mini-extract");
        }

        class CssLoadingRuntimeModule extends RuntimeModule {
          constructor(runtimeRequirements, runtimeOptions) {
            super("css loading", 10);
            this.runtimeRequirements = runtimeRequirements;
            this.runtimeOptions = runtimeOptions;
          }

          generate() {
            const { chunkGraph, chunk, runtimeRequirements } = this;
            const { runtimeTemplate, outputOptions: { crossOriginLoading } } = this.compilation;
            const chunkMap = getCssChunkObject(chunk, this.compilation);
            const withLoading = runtimeRequirements.has(RuntimeGlobals.ensureChunkHandlers) && Object.keys(chunkMap).length > 0;
            const withHmr = runtimeRequirements.has(RuntimeGlobals.hmrDownloadUpdateHandlers);
            if (!withLoading && !withHmr) {
              return "";
            }
            const conditionMap = chunkGraph.getChunkConditionMap(chunk, chunkHasCss);
            const hasCssMatcher = compileBooleanMatcher(conditionMap);
            const withPrefetch = runtimeRequirements.has(RuntimeGlobals.prefetchChunkHandlers);
            const withPreload = runtimeRequirements.has(RuntimeGlobals.preloadChunkHandlers);
            const { linkPreload, linkPrefetch } = MiniCssExtractPlugin.getCompilationHooks(this.compilation);

            return Template.asString([
              'if (typeof document === "undefined") return;',
              `var createStylesheet = ${runtimeTemplate.basicFunction("chunkId, fullhref, oldTag, resolve, reject", [
                'var linkTag = document.createElement("link");',
                this.runtimeOptions.attributes ? Template.asString(Object.entries(this.runtimeOptions.attributes).map(([key, value]) =>
                  `linkTag.setAttribute(${JSON.stringify(key)}, ${JSON.stringify(value)});`)) : "",
                'linkTag.rel = "stylesheet";',
                this.runtimeOptions.linkType ? `linkTag.type = ${JSON.stringify(this.runtimeOptions.linkType)};` : "",
                `if (${RuntimeGlobals.scriptNonce}) {`, Template.indent(`linkTag.nonce = ${RuntimeGlobals.scriptNonce};`), "}",
                `var onLinkComplete = ${runtimeTemplate.basicFunction("event", [
                  "// avoid mem leaks.",
                  "linkTag.onerror = linkTag.onload = null;",
                  "if (event.type === 'load') {", Template.indent(["resolve();"]), "} else {", Template.indent([
                    "var errorType = event && event.type;",
                    "var realHref = event && event.target && event.target.href || fullhref;",
                    'var err = new Error("Loading CSS chunk " + chunkId + " failed.\\n(" + errorType + ": " + realHref + ")");',
                    'err.name = "ChunkLoadError";',
                    'err.code = "CSS_CHUNK_LOAD_FAILED";',
                    "err.type = errorType;",
                    "err.request = realHref;",
                    "if (linkTag.parentNode) linkTag.parentNode.removeChild(linkTag)",
                    "reject(err);"
                  ]), "}"])}`,
                "linkTag.onerror = linkTag.onload = onLinkComplete;",
                "linkTag.href = fullhref;",
                crossOriginLoading ? Template.asString([
                  `if (linkTag.href.indexOf(window.location.origin + '/') !== 0) {`,
                  Template.indent(`linkTag.crossOrigin = ${JSON.stringify(crossOriginLoading)};`), "}"
                ]) : "",
                MiniCssExtractPlugin.getCompilationHooks(this.compilation).beforeTagInsert.call("", { tag: "linkTag", chunkId: "chunkId", href: "fullhref", resolve: "resolve", reject: "reject" }) || "",
                typeof this.runtimeOptions.insert !== "undefined" ?
                  typeof this.runtimeOptions.insert === "function" ?
                    `(${this.runtimeOptions.insert.toString()})(linkTag)` :
                    Template.asString([
                      `var target = document.querySelector("${this.runtimeOptions.insert}");`,
                      `target.parentNode.insertBefore(linkTag, target.nextSibling);`
                    ]) :
                  Template.asString([
                    "if (oldTag) {", Template.indent(["oldTag.parentNode.insertBefore(linkTag, oldTag.nextSibling);"]), "} else {", Template.indent(["document.head.appendChild(linkTag);"]), "}"
                  ]),
                "return linkTag;"
              ])};`,
              `var findStylesheet = ${runtimeTemplate.basicFunction("href, fullhref", [
                'var existingLinkTags = document.getElementsByTagName("link");',
                "for(var i = 0; i < existingLinkTags.length; i++) {", Template.indent([
                  "var tag = existingLinkTags[i];",
                  'var dataHref = tag.getAttribute("data-href") || tag.getAttribute("href");',
                  'if(tag.rel === "stylesheet" && (dataHref === href || dataHref === fullhref)) return tag;'
                ]), "}",
                'var existingStyleTags = document.getElementsByTagName("style");',
                "for(var i = 0; i < existingStyleTags.length; i++) {", Template.indent([
                  "var tag = existingStyleTags[i];",
                  'var dataHref = tag.getAttribute("data-href");',
                  "if(dataHref === href || dataHref === fullhref) return tag;"
                ]), "}"
              ])};`,
              `var loadStylesheet = ${runtimeTemplate.basicFunction("chunkId", `return new Promise(${runtimeTemplate.basicFunction("resolve, reject", [
                `var href = ${RuntimeGlobals.require}.miniCssF(chunkId);`,
                `var fullhref = ${RuntimeGlobals.publicPath} + href;`,
                "if(findStylesheet(href, fullhref)) return resolve();",
                "createStylesheet(chunkId, fullhref, null, resolve, reject);"
              ])});`)}`,
              withLoading ? Template.asString([
                "// object to store loaded CSS chunks",
                "var installedCssChunks = {", Template.indent(chunk.ids.map(id => `${JSON.stringify(id)}: 0`).join(",\n")), "};",
                "",
                `${RuntimeGlobals.ensureChunkHandlers}.miniCss = ${runtimeTemplate.basicFunction("chunkId, promises", [
                  `var cssChunks = ${JSON.stringify(chunkMap)};`,
                  "if(installedCssChunks[chunkId]) promises.push(installedCssChunks[chunkId]);",
                  "else if(installedCssChunks[chunkId] !== 0 && cssChunks[chunkId]) {", Template.indent([
                    `promises.push(installedCssChunks[chunkId] = loadStylesheet(chunkId).then(${runtimeTemplate.basicFunction("", "installedCssChunks[chunkId] = 0;")}, ${runtimeTemplate.basicFunction("e", [
                      "delete installedCssChunks[chunkId];",
                      "throw e;"
                    ])}));`
                  ]), "}"
                ])};`
              ]) : "// no chunk loading",
              "",
              withHmr ? Template.asString([
                "var oldTags = [];",
                "var newTags = [];",
                `var applyHandler = ${runtimeTemplate.basicFunction("options", [
                  `return { dispose: ${runtimeTemplate.basicFunction("", [
                    "for(var i = 0; i < oldTags.length; i++) {", Template.indent(["var oldTag = oldTags[i];", "if(oldTag.parentNode) oldTag.parentNode.removeChild(oldTag);"]), "}",
                    "oldTags.length = 0;"
                  ])}, apply: ${runtimeTemplate.basicFunction("", [
                    'for(var i = 0; i < newTags.length; i++) newTags[i].rel = "stylesheet";',
                    "newTags.length = 0;"
                  ])} };`
                ])}`,
                `${RuntimeGlobals.hmrDownloadUpdateHandlers}.miniCss = ${runtimeTemplate.basicFunction("chunkIds, removedChunks, removedModules, promises, applyHandlers, updatedModulesList", [
                  "applyHandlers.push(applyHandler);",
                  `chunkIds.forEach(${runtimeTemplate.basicFunction("chunkId", [
                    `var href = ${RuntimeGlobals.require}.miniCssF(chunkId);`,
                    `var fullhref = ${RuntimeGlobals.publicPath} + href;`,
                    "var oldTag = findStylesheet(href, fullhref);",
                    "if(!oldTag) return;",
                    `promises.push(new Promise(${runtimeTemplate.basicFunction("resolve, reject", [
                      `var tag = createStylesheet(chunkId, fullhref, oldTag, ${runtimeTemplate.basicFunction("", [
                        'tag.as = "style";',
                        'tag.rel = "preload";',
                        "resolve();"
                      ])}, reject);`,
                      "oldTags.push(oldTag);",
                      "newTags.push(tag);"
                    ])}));`
                  ])});`
                ])}`
              ]) : "// no hmr",
              "",
              withPrefetch && hasCssMatcher !== false ? `${RuntimeGlobals.prefetchChunkHandlers}.miniCss = ${runtimeTemplate.basicFunction("chunkId", [
                `if((!${RuntimeGlobals.hasOwnProperty}(installedCssChunks, chunkId) || installedCssChunks[chunkId] === undefined) && ${
                  hasCssMatcher === true ? "true" : hasCssMatcher("chunkId")}) {`,
                Template.indent([
                  "installedCssChunks[chunkId] = null;",
                  linkPrefetch.call(Template.asString([
                    "var link = document.createElement('link');",
                    crossOriginLoading ? `link.crossOrigin = ${JSON.stringify(crossOriginLoading)};` : "",
                    "if (" + RuntimeGlobals.scriptNonce + ") {",
                    Template.indent(`link.setAttribute("nonce", ${RuntimeGlobals.scriptNonce});`),
                    "}",
                    'link.rel = "prefetch";',
                    'link.as = "style";',
                    `link.href = ${RuntimeGlobals.publicPath} + ${RuntimeGlobals.require}.miniCssF(chunkId);`
                  ]), chunk),
                  "document.head.appendChild(link);"
                ]),
                "}"
              ])};` : "// no prefetching",
              "",
              withPreload && hasCssMatcher !== false ? `${RuntimeGlobals.preloadChunkHandlers}.miniCss = ${runtimeTemplate.basicFunction("chunkId", [
                `if((!${RuntimeGlobals.hasOwnProperty}(installedCssChunks, chunkId) || installedCssChunks[chunkId] === undefined) && ${
                  hasCssMatcher === true ? "true" : hasCssMatcher("chunkId")}) {`,
                Template.indent([
                  "installedCssChunks[chunkId] = null;",
                  linkPreload.call(Template.asString([
                    "var link = document.createElement('link');",
                    "link.charset = 'utf-8';",
                    "if (" + RuntimeGlobals.scriptNonce + ") {",
                    Template.indent(`link.setAttribute("nonce", ${RuntimeGlobals.scriptNonce});`),
                    "}",
                    'link.rel = "preload";',
                    'link.as = "style";',
                    `link.href = ${RuntimeGlobals.publicPath} + ${RuntimeGlobals.require}.miniCssF(chunkId);`,
                    crossOriginLoading ? crossOriginLoading === "use-credentials" ?
                      'link.crossOrigin = "use-credentials";' :
                      Template.asString([
                        "if (link.href.indexOf(window.location.origin + '/') !== 0) {",
                        Template.indent(`link.crossOrigin = ${JSON.stringify(crossOriginLoading)};`),
                        "}"
                      ]) : ""
                  ]), chunk),
                  "document.head.appendChild(link);"
                ]),
                "}"
              ])};` : "// no preloaded"
            ]);
          }
        }

        const enabledChunks = new WeakSet();

        const handler = (chunk, set) => {
          if (enabledChunks.has(chunk)) {
            return;
          }
          enabledChunks.add(chunk);
          if (typeof this.options.chunkFilename === "string" && /\[(full)?hash(:\d+)?\]/.test(this.options.chunkFilename)) {
            set.add(RuntimeGlobals.getFullHash);
          }
          set.add(RuntimeGlobals.publicPath);
          compilation.addRuntimeModule(chunk, new runtime.GetChunkFilenameRuntimeModule(MODULE_TYPE, "mini-css", `${RuntimeGlobals.require}.miniCssF`,
            referencedChunk => {
              if (!referencedChunk.contentHash[MODULE_TYPE]) {
                return false;
              }
              return referencedChunk.canBeInitial() ? this.options.filename : this.options.chunkFilename;
            }, false));
          compilation.addRuntimeModule(chunk, new CssLoadingRuntimeModule(set, this.runtimeOptions));
        };

        compilation.hooks.runtimeRequirementInTree.for(RuntimeGlobals.ensureChunkHandlers).tap(pluginName, handler);
        compilation.hooks.runtimeRequirementInTree.for(RuntimeGlobals.hmrDownloadUpdateHandlers).tap(pluginName, handler);
        compilation.hooks.runtimeRequirementInTree.for(RuntimeGlobals.prefetchChunkHandlers).tap(pluginName, handler);
        compilation.hooks.runtimeRequirementInTree.for(RuntimeGlobals.preloadChunkHandlers).tap(pluginName, handler);
      }
    });
  }

  getChunkModules(chunk, chunkGraph) {
    return typeof chunkGraph !== "undefined" ? chunkGraph.getOrderedChunkModulesIterable(chunk, compareModulesByIdentifier) : chunk.modulesIterable;
  }

  sortModules(compilation, chunk, modules, requestShortener) {
    let usedModules = this._sortedModulesCache.get(chunk);
    if (usedModules || !modules) {
      return usedModules;
    }

    const modulesList = [...modules];
    const moduleDependencies = new Map(modulesList.map(m => [m, new Set()]));
    const moduleDependenciesReasons = new Map(modulesList.map(m => [m, new Map()]));

    const modulesByChunkGroup = Array.from(chunk.groupsIterable, chunkGroup => {
      const sortedModules = modulesList.map(module => {
        return {
          module,
          index: chunkGroup.getModulePostOrderIndex(module)
        };
      }).filter(item => item.index !== undefined).sort((a, b) => b.index - a.index).map(item => item.module);

      for (let i = 0; i < sortedModules.length; i++) {
        const set = moduleDependencies.get(sortedModules[i]);
        const reasons = moduleDependenciesReasons.get(sortedModules[i]);

        for (let j = i + 1; j < sortedModules.length; j++) {
          const module = sortedModules[j];
          set.add(module);
          const reason = reasons.get(module) || new Set();
          reason.add(chunkGroup);
          reasons.set(module, reason);
        }
      }
      return sortedModules;
    });

    usedModules = new Set();
    const unusedModulesFilter = m => !usedModules.has(m);

    while (usedModules.size < modulesList.length) {
      let success = false;
      let bestMatch;
      let bestMatchDeps;

      for (const list of modulesByChunkGroup) {
        while (list.length > 0 && usedModules.has(list[list.length - 1])) {
          list.pop();
        }

        if (list.length !== 0) {
          const module = list[list.length - 1];
          const deps = moduleDependencies.get(module);
          const failedDeps = Array.from(deps).filter(unusedModulesFilter);

          if (!bestMatchDeps || bestMatchDeps.length > failedDeps.length) {
            bestMatch = list;
            bestMatchDeps = failedDeps;
          }

          if (failedDeps.length === 0) {
            usedModules.add(list.pop());
            success = true;
            break;
          }
        }
      }

      if (!success) {
        const fallbackModule = bestMatch.pop();
        if (!this.options.ignoreOrder) {
          const reasons = moduleDependenciesReasons.get(fallbackModule);
          compilation.warnings.push(new Error([
            `chunk ${chunk.name || chunk.id} [${pluginName}]`,
            "Conflicting order. Following module has been added:",
            ` * ${fallbackModule.readableIdentifier(requestShortener)}`,
            "despite it was not able to fulfill desired ordering with these modules:",
            ...bestMatchDeps.map(m => {
              const goodReasonsMap = moduleDependenciesReasons.get(m);
              const goodReasons = goodReasonsMap && goodReasonsMap.get(fallbackModule);
              const failedChunkGroups = Array.from(reasons.get(m), cg => cg.name).join(", ");
              const goodChunkGroups = goodReasons && Array.from(goodReasons, cg => cg.name).join(", ");
              return [
                ` * ${m.readableIdentifier(requestShortener)}`,
                `   - couldn't fulfill desired order of chunk group(s) ${failedChunkGroups}`,
                goodChunkGroups && `   - while fulfilling desired order of chunk group(s) ${goodChunkGroups}`
              ].filter(Boolean).join("\n");
            })
          ].join("\n")));
        }
        usedModules.add(fallbackModule);
      }
    }

    this._sortedModulesCache.set(chunk, usedModules);
    return usedModules;
  }

  renderContentAsset(compiler, compilation, chunk, modules, requestShortener, filenameTemplate, pathData) {
    const usedModules = this.sortModules(compilation, chunk, modules, requestShortener);
    const { ConcatSource, SourceMapSource, RawSource } = compiler.webpack.sources;
    const source = new ConcatSource();
    const externalsSource = new ConcatSource();

    for (const module of usedModules) {
      let content = module.content.toString();
      const readableIdentifier = module.readableIdentifier(requestShortener);
      const startsWithAtRuleImport = /^@import url/.test(content);
      let header;

      if (compilation.outputOptions.pathinfo) {
        const reqStr = readableIdentifier.replace(/\*\//g, "*_/");
        const reqStrStar = "*".repeat(reqStr.length);
        const headerStr = `/*!****${reqStrStar}****!*\\\n  !*** ${reqStr} ***!\n  \\****${reqStrStar}****/\n`;
        header = new RawSource(headerStr);
      }

      if (startsWithAtRuleImport) {
        if (typeof header !== "undefined") {
          externalsSource.add(header);
        }

        if (module.media || module.supports || typeof module.layer !== "undefined") {
          let atImportExtra = "";
          const needLayer = typeof module.layer !== "undefined";
          if (needLayer) atImportExtra += module.layer.length > 0 ? ` layer(${module.layer})` : " layer";
          if (module.supports) atImportExtra += ` supports(${module.supports})`;
          if (module.media) atImportExtra += ` ${module.media}`;
          content = content.replace(/;|\s*$/, `${atImportExtra};`);
        }
        externalsSource.add(content);
        externalsSource.add("\n");
      } else {
        if (typeof header !== "undefined") {
          source.add(header);
        }
        if (module.supports) {
          source.add(`@supports (${module.supports}) {\n`);
        }
        if (module.media) {
          source.add(`@media ${module.media} {\n`);
        }
        const needLayer = typeof module.layer !== "undefined";
        if (needLayer) {
          source.add(`@layer${module.layer.length > 0 ? ` ${module.layer}` : ""} {\n`);
        }
        const { path: filename } = compilation.getPathWithInfo(filenameTemplate, pathData);
        const undoPath = getUndoPath(filename, compiler.outputPath, false);
        content = content.replace(new RegExp(ABSOLUTE_PUBLIC_PATH, "g"), "");
        content = content.replace(new RegExp(SINGLE_DOT_PATH_SEGMENT, "g"), ".");
        content = content.replace(new RegExp(AUTO_PUBLIC_PATH, "g"), undoPath);
        const entryOptions = chunk.getEntryOptions();
        const baseUriReplacement = entryOptions && entryOptions.baseUri || undoPath;
        content = content.replace(new RegExp(BASE_URI, "g"), baseUriReplacement);

        if (module.sourceMap) {
          source.add(new SourceMapSource(content, readableIdentifier, module.sourceMap.toString()));
        } else {
          source.add(new RawSource(content));
        }
        source.add("\n");
        if (needLayer) {
          source.add("}\n");
        }
        if (module.media) {
          source.add("}\n");
        }
        if (module.supports) {
          source.add("}\n");
        }
      }
    }
    return new ConcatSource(externalsSource, source);
  }
}

MiniCssExtractPlugin.pluginName = pluginName;
MiniCssExtractPlugin.pluginSymbol = pluginSymbol;
MiniCssExtractPlugin.loader = require.resolve("./loader");

module.exports = MiniCssExtractPlugin;
