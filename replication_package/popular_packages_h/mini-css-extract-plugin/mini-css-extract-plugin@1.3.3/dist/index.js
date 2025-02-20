"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _webpack = _interopRequireDefault(require("webpack"));

var _schemaUtils = require("schema-utils");

var _CssModuleFactory = _interopRequireDefault(require("./CssModuleFactory"));

var _CssDependencyTemplate = _interopRequireDefault(require("./CssDependencyTemplate"));

var _CssDependency = _interopRequireDefault(require("./CssDependency"));

var _pluginOptions = _interopRequireDefault(require("./plugin-options.json"));

var _utils = require("./utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable class-methods-use-this */
// webpack 5 exposes the sources property to ensure the right version of webpack-sources is used
const {
  ConcatSource,
  SourceMapSource,
  RawSource
} = // eslint-disable-next-line global-require
_webpack.default.sources || require('webpack-sources');

const {
  Template,
  util: {
    createHash
  }
} = _webpack.default;
const pluginName = 'mini-css-extract-plugin';
const REGEXP_CHUNKHASH = /\[chunkhash(?::(\d+))?\]/i;
const REGEXP_CONTENTHASH = /\[contenthash(?::(\d+))?\]/i;
const REGEXP_NAME = /\[name\]/i;
const DEFAULT_FILENAME = '[name].css';

class MiniCssExtractPlugin {
  constructor(options = {}) {
    (0, _schemaUtils.validate)(_pluginOptions.default, options, {
      name: 'Mini CSS Extract Plugin',
      baseDataPath: 'options'
    });
    const insert = typeof options.insert !== 'undefined' ? typeof options.insert === 'function' ? `(${options.insert.toString()})(linkTag)` : Template.asString([`var target = document.querySelector("${options.insert}");`, `target.parentNode.insertBefore(linkTag, target.nextSibling);`]) : Template.asString(['document.head.appendChild(linkTag);']);
    const attributes = typeof options.attributes === 'object' ? options.attributes : {}; // Todo in next major release set default to "false"

    const linkType = options.linkType === true || typeof options.linkType === 'undefined' ? 'text/css' : options.linkType;
    this.options = Object.assign({
      filename: DEFAULT_FILENAME,
      ignoreOrder: false
    }, options);
    this.runtimeOptions = {
      insert,
      linkType
    };
    this.runtimeOptions.attributes = Template.asString(Object.entries(attributes).map(entry => {
      const [key, value] = entry;
      return `linkTag.setAttribute(${JSON.stringify(key)}, ${JSON.stringify(value)});`;
    }));

    if (!this.options.chunkFilename) {
      const {
        filename
      } = this.options;

      if (typeof filename !== 'function') {
        const hasName = filename.includes('[name]');
        const hasId = filename.includes('[id]');
        const hasChunkHash = filename.includes('[chunkhash]');
        const hasContentHash = filename.includes('[contenthash]'); // Anything changing depending on chunk is fine

        if (hasChunkHash || hasContentHash || hasName || hasId) {
          this.options.chunkFilename = filename;
        } else {
          // Otherwise prefix "[id]." in front of the basename to make it changing
          this.options.chunkFilename = filename.replace(/(^|\/)([^/]*(?:\?|$))/, '$1[id].$2');
        }
      } else {
        this.options.chunkFilename = '[id].css';
      }
    }
  }
  /** @param {import("webpack").Compiler} compiler */


  apply(compiler) {
    const isWebpack4 = compiler.webpack ? false : typeof compiler.resolvers !== 'undefined';

    if (!isWebpack4) {
      const {
        splitChunks
      } = compiler.options.optimization;

      if (splitChunks) {
        if (splitChunks.defaultSizeTypes.includes('...')) {
          splitChunks.defaultSizeTypes.push(_utils.MODULE_TYPE);
        }
      }
    }

    compiler.hooks.thisCompilation.tap(pluginName, compilation => {
      compilation.dependencyFactories.set(_CssDependency.default, new _CssModuleFactory.default());
      compilation.dependencyTemplates.set(_CssDependency.default, new _CssDependencyTemplate.default());

      if (isWebpack4) {
        compilation.mainTemplate.hooks.renderManifest.tap(pluginName, (result, {
          chunk
        }) => {
          const {
            chunkGraph
          } = compilation;
          const renderedModules = Array.from(this.getChunkModules(chunk, chunkGraph)).filter(module => module.type === _utils.MODULE_TYPE);
          const filenameTemplate = chunk.filenameTemplate || this.options.filename;

          if (renderedModules.length > 0) {
            result.push({
              render: () => this.renderContentAsset(compilation, chunk, renderedModules, compilation.runtimeTemplate.requestShortener),
              filenameTemplate,
              pathOptions: {
                chunk,
                contentHashType: _utils.MODULE_TYPE
              },
              identifier: `${pluginName}.${chunk.id}`,
              hash: chunk.contentHash[_utils.MODULE_TYPE]
            });
          }
        });
        compilation.chunkTemplate.hooks.renderManifest.tap(pluginName, (result, {
          chunk
        }) => {
          const {
            chunkGraph
          } = compilation;
          const renderedModules = Array.from(this.getChunkModules(chunk, chunkGraph)).filter(module => module.type === _utils.MODULE_TYPE);
          const filenameTemplate = chunk.filenameTemplate || this.options.chunkFilename;

          if (renderedModules.length > 0) {
            result.push({
              render: () => this.renderContentAsset(compilation, chunk, renderedModules, compilation.runtimeTemplate.requestShortener),
              filenameTemplate,
              pathOptions: {
                chunk,
                contentHashType: _utils.MODULE_TYPE
              },
              identifier: `${pluginName}.${chunk.id}`,
              hash: chunk.contentHash[_utils.MODULE_TYPE]
            });
          }
        });
      } else {
        compilation.hooks.renderManifest.tap(pluginName, (result, {
          chunk
        }) => {
          const {
            chunkGraph
          } = compilation; // We don't need hot update chunks for css
          // We will use the real asset instead to update

          if (chunk instanceof _webpack.default.HotUpdateChunk) {
            return;
          }

          const renderedModules = Array.from(this.getChunkModules(chunk, chunkGraph)).filter(module => module.type === _utils.MODULE_TYPE);
          const filenameTemplate = chunk.canBeInitial() ? this.options.filename : this.options.chunkFilename;

          if (renderedModules.length > 0) {
            result.push({
              render: () => this.renderContentAsset(compilation, chunk, renderedModules, compilation.runtimeTemplate.requestShortener),
              filenameTemplate,
              pathOptions: {
                chunk,
                contentHashType: _utils.MODULE_TYPE
              },
              identifier: `${pluginName}.${chunk.id}`,
              hash: chunk.contentHash[_utils.MODULE_TYPE]
            });
          }
        });
      }
      /*
       * For webpack 5 this will be unneeded once the logic uses a RuntimeModule
       * as the content of runtime modules is hashed and added to the chunk hash automatically
       * */


      if (isWebpack4) {
        compilation.mainTemplate.hooks.hashForChunk.tap(pluginName, (hash, chunk) => {
          const {
            chunkFilename
          } = this.options;

          if (REGEXP_CHUNKHASH.test(chunkFilename)) {
            hash.update(JSON.stringify(chunk.getChunkMaps(true).hash));
          }

          if (REGEXP_CONTENTHASH.test(chunkFilename)) {
            hash.update(JSON.stringify(chunk.getChunkMaps(true).contentHash[_utils.MODULE_TYPE] || {}));
          }

          if (REGEXP_NAME.test(chunkFilename)) {
            hash.update(JSON.stringify(chunk.getChunkMaps(true).name));
          }
        });
      }

      compilation.hooks.contentHash.tap(pluginName, chunk => {
        const {
          outputOptions,
          chunkGraph
        } = compilation;
        const {
          hashFunction,
          hashDigest,
          hashDigestLength
        } = outputOptions;
        const hash = createHash(hashFunction);

        for (const m of this.getChunkModules(chunk, chunkGraph)) {
          if (m.type === _utils.MODULE_TYPE) {
            m.updateHash(hash, {
              chunkGraph
            });
          }
        }

        const {
          contentHash
        } = chunk;
        contentHash[_utils.MODULE_TYPE] = hash.digest(hashDigest).substring(0, hashDigestLength);
      });
      const {
        mainTemplate
      } = compilation;

      if (isWebpack4) {
        mainTemplate.hooks.localVars.tap(pluginName, (source, chunk) => {
          const chunkMap = this.getCssChunkObject(chunk, compilation);

          if (Object.keys(chunkMap).length > 0) {
            return Template.asString([source, '', '// object to store loaded CSS chunks', 'var installedCssChunks = {', Template.indent(chunk.ids.map(id => `${JSON.stringify(id)}: 0`).join(',\n')), '};']);
          }

          return source;
        });
        mainTemplate.hooks.requireEnsure.tap(pluginName, (source, chunk, hash) => {
          const chunkMap = this.getCssChunkObject(chunk, compilation);

          if (Object.keys(chunkMap).length > 0) {
            const chunkMaps = chunk.getChunkMaps();
            const {
              crossOriginLoading
            } = mainTemplate.outputOptions;
            const linkHrefPath = mainTemplate.getAssetPath(JSON.stringify(this.options.chunkFilename), {
              hash: `" + ${mainTemplate.renderCurrentHashCode(hash)} + "`,
              hashWithLength: length => `" + ${mainTemplate.renderCurrentHashCode(hash, length)} + "`,
              chunk: {
                id: '" + chunkId + "',
                hash: `" + ${JSON.stringify(chunkMaps.hash)}[chunkId] + "`,

                hashWithLength(length) {
                  const shortChunkHashMap = Object.create(null);

                  for (const chunkId of Object.keys(chunkMaps.hash)) {
                    if (typeof chunkMaps.hash[chunkId] === 'string') {
                      shortChunkHashMap[chunkId] = chunkMaps.hash[chunkId].substring(0, length);
                    }
                  }

                  return `" + ${JSON.stringify(shortChunkHashMap)}[chunkId] + "`;
                },

                contentHash: {
                  [_utils.MODULE_TYPE]: `" + ${JSON.stringify(chunkMaps.contentHash[_utils.MODULE_TYPE])}[chunkId] + "`
                },
                contentHashWithLength: {
                  [_utils.MODULE_TYPE]: length => {
                    const shortContentHashMap = {};
                    const contentHash = chunkMaps.contentHash[_utils.MODULE_TYPE];

                    for (const chunkId of Object.keys(contentHash)) {
                      if (typeof contentHash[chunkId] === 'string') {
                        shortContentHashMap[chunkId] = contentHash[chunkId].substring(0, length);
                      }
                    }

                    return `" + ${JSON.stringify(shortContentHashMap)}[chunkId] + "`;
                  }
                },
                name: `" + (${JSON.stringify(chunkMaps.name)}[chunkId]||chunkId) + "`
              },
              contentHashType: _utils.MODULE_TYPE
            });
            return Template.asString([source, '', `// ${pluginName} CSS loading`, `var cssChunks = ${JSON.stringify(chunkMap)};`, 'if(installedCssChunks[chunkId]) promises.push(installedCssChunks[chunkId]);', 'else if(installedCssChunks[chunkId] !== 0 && cssChunks[chunkId]) {', Template.indent(['promises.push(installedCssChunks[chunkId] = new Promise(function(resolve, reject) {', Template.indent([`var href = ${linkHrefPath};`, `var fullhref = ${mainTemplate.requireFn}.p + href;`, 'var existingLinkTags = document.getElementsByTagName("link");', 'for(var i = 0; i < existingLinkTags.length; i++) {', Template.indent(['var tag = existingLinkTags[i];', 'var dataHref = tag.getAttribute("data-href") || tag.getAttribute("href");', 'if(tag.rel === "stylesheet" && (dataHref === href || dataHref === fullhref)) return resolve();']), '}', 'var existingStyleTags = document.getElementsByTagName("style");', 'for(var i = 0; i < existingStyleTags.length; i++) {', Template.indent(['var tag = existingStyleTags[i];', 'var dataHref = tag.getAttribute("data-href");', 'if(dataHref === href || dataHref === fullhref) return resolve();']), '}', 'var linkTag = document.createElement("link");', this.runtimeOptions.attributes, 'linkTag.rel = "stylesheet";', this.runtimeOptions.linkType ? `linkTag.type = ${JSON.stringify(this.runtimeOptions.linkType)};` : '', 'var onLinkComplete = function (event) {', Template.indent(['// avoid mem leaks.', 'linkTag.onerror = linkTag.onload = null;', "if (event.type === 'load') {", Template.indent(['resolve();']), '} else {', Template.indent(["var errorType = event && (event.type === 'load' ? 'missing' : event.type);", 'var realHref = event && event.target && event.target.href || fullhref;', 'var err = new Error("Loading CSS chunk " + chunkId + " failed.\\n(" + realHref + ")");', 'err.code = "CSS_CHUNK_LOAD_FAILED";', 'err.type = errorType;', 'err.request = realHref;', 'delete installedCssChunks[chunkId]', 'linkTag.parentNode.removeChild(linkTag)', 'reject(err);']), '}']), '};', 'linkTag.onerror = linkTag.onload = onLinkComplete;', 'linkTag.href = fullhref;', crossOriginLoading ? Template.asString([`if (linkTag.href.indexOf(window.location.origin + '/') !== 0) {`, Template.indent(`linkTag.crossOrigin = ${JSON.stringify(crossOriginLoading)};`), '}']) : '', this.runtimeOptions.insert]), '}).then(function() {', Template.indent(['installedCssChunks[chunkId] = 0;']), '}));']), '}']);
          }

          return source;
        });
      } else {
        const enabledChunks = new WeakSet();

        const handler = (chunk, set) => {
          if (enabledChunks.has(chunk)) {
            return;
          }

          enabledChunks.add(chunk); // eslint-disable-next-line global-require

          const CssLoadingRuntimeModule = require('./CssLoadingRuntimeModule');

          set.add(_webpack.default.RuntimeGlobals.publicPath);
          compilation.addRuntimeModule(chunk, new _webpack.default.runtime.GetChunkFilenameRuntimeModule(_utils.MODULE_TYPE, 'mini-css', `${_webpack.default.RuntimeGlobals.require}.miniCssF`, referencedChunk => referencedChunk.canBeInitial() ? this.options.filename : this.options.chunkFilename, true));
          compilation.addRuntimeModule(chunk, new CssLoadingRuntimeModule(set, this.runtimeOptions));
        };

        compilation.hooks.runtimeRequirementInTree.for(_webpack.default.RuntimeGlobals.ensureChunkHandlers).tap(pluginName, handler);
        compilation.hooks.runtimeRequirementInTree.for(_webpack.default.RuntimeGlobals.hmrDownloadUpdateHandlers).tap(pluginName, handler);
      }
    });
  }

  getChunkModules(chunk, chunkGraph) {
    return typeof chunkGraph !== 'undefined' ? chunkGraph.getOrderedChunkModulesIterable(chunk, _utils.compareModulesByIdentifier) : chunk.modulesIterable;
  }

  getCssChunkObject(mainChunk, compilation) {
    const obj = {};
    const {
      chunkGraph
    } = compilation;

    for (const chunk of mainChunk.getAllAsyncChunks()) {
      for (const module of this.getChunkModules(chunk, chunkGraph)) {
        if (module.type === _utils.MODULE_TYPE) {
          obj[chunk.id] = 1;
          break;
        }
      }
    }

    return obj;
  }

  renderContentAsset(compilation, chunk, modules, requestShortener) {
    let usedModules;
    const [chunkGroup] = chunk.groupsIterable;
    const moduleIndexFunctionName = typeof compilation.chunkGraph !== 'undefined' ? 'getModulePostOrderIndex' : 'getModuleIndex2';

    if (typeof chunkGroup[moduleIndexFunctionName] === 'function') {
      // Store dependencies for modules
      const moduleDependencies = new Map(modules.map(m => [m, new Set()]));
      const moduleDependenciesReasons = new Map(modules.map(m => [m, new Map()])); // Get ordered list of modules per chunk group
      // This loop also gathers dependencies from the ordered lists
      // Lists are in reverse order to allow to use Array.pop()

      const modulesByChunkGroup = Array.from(chunk.groupsIterable, cg => {
        const sortedModules = modules.map(m => {
          return {
            module: m,
            index: cg[moduleIndexFunctionName](m)
          };
        }) // eslint-disable-next-line no-undefined
        .filter(item => item.index !== undefined).sort((a, b) => b.index - a.index).map(item => item.module);

        for (let i = 0; i < sortedModules.length; i++) {
          const set = moduleDependencies.get(sortedModules[i]);
          const reasons = moduleDependenciesReasons.get(sortedModules[i]);

          for (let j = i + 1; j < sortedModules.length; j++) {
            const module = sortedModules[j];
            set.add(module);
            const reason = reasons.get(module) || new Set();
            reason.add(cg);
            reasons.set(module, reason);
          }
        }

        return sortedModules;
      }); // set with already included modules in correct order

      usedModules = new Set();

      const unusedModulesFilter = m => !usedModules.has(m);

      while (usedModules.size < modules.length) {
        let success = false;
        let bestMatch;
        let bestMatchDeps; // get first module where dependencies are fulfilled

        for (const list of modulesByChunkGroup) {
          // skip and remove already added modules
          while (list.length > 0 && usedModules.has(list[list.length - 1])) {
            list.pop();
          } // skip empty lists


          if (list.length !== 0) {
            const module = list[list.length - 1];
            const deps = moduleDependencies.get(module); // determine dependencies that are not yet included

            const failedDeps = Array.from(deps).filter(unusedModulesFilter); // store best match for fallback behavior

            if (!bestMatchDeps || bestMatchDeps.length > failedDeps.length) {
              bestMatch = list;
              bestMatchDeps = failedDeps;
            }

            if (failedDeps.length === 0) {
              // use this module and remove it from list
              usedModules.add(list.pop());
              success = true;
              break;
            }
          }
        }

        if (!success) {
          // no module found => there is a conflict
          // use list with fewest failed deps
          // and emit a warning
          const fallbackModule = bestMatch.pop();

          if (!this.options.ignoreOrder) {
            const reasons = moduleDependenciesReasons.get(fallbackModule);
            compilation.warnings.push(new Error([`chunk ${chunk.name || chunk.id} [${pluginName}]`, 'Conflicting order. Following module has been added:', ` * ${fallbackModule.readableIdentifier(requestShortener)}`, 'despite it was not able to fulfill desired ordering with these modules:', ...bestMatchDeps.map(m => {
              const goodReasonsMap = moduleDependenciesReasons.get(m);
              const goodReasons = goodReasonsMap && goodReasonsMap.get(fallbackModule);
              const failedChunkGroups = Array.from(reasons.get(m), cg => cg.name).join(', ');
              const goodChunkGroups = goodReasons && Array.from(goodReasons, cg => cg.name).join(', ');
              return [` * ${m.readableIdentifier(requestShortener)}`, `   - couldn't fulfill desired order of chunk group(s) ${failedChunkGroups}`, goodChunkGroups && `   - while fulfilling desired order of chunk group(s) ${goodChunkGroups}`].filter(Boolean).join('\n');
            })].join('\n')));
          }

          usedModules.add(fallbackModule);
        }
      }
    } else {
      // fallback for older webpack versions
      // (to avoid a breaking change)
      // TODO remove this in next major version
      // and increase minimum webpack version to 4.12.0
      modules.sort((a, b) => a.index2 - b.index2);
      usedModules = modules;
    }

    const source = new ConcatSource();
    const externalsSource = new ConcatSource();

    for (const m of usedModules) {
      let content = m.content.toString();

      if (/^@import url/.test(content)) {
        // HACK for IE
        // http://stackoverflow.com/a/14676665/1458162
        if (m.media) {
          // insert media into the @import
          // this is rar
          // TODO improve this and parse the CSS to support multiple medias
          content = content.replace(/;|\s*$/, m.media);
        }

        externalsSource.add(content);
        externalsSource.add('\n');
      } else {
        if (m.media) {
          source.add(`@media ${m.media} {\n`);
        }

        if (m.sourceMap) {
          source.add(new SourceMapSource(content, m.readableIdentifier(requestShortener), m.sourceMap.toString()));
        } else {
          source.add(new RawSource(content, m.readableIdentifier(requestShortener)));
        }

        source.add('\n');

        if (m.media) {
          source.add('}\n');
        }
      }
    }

    return new ConcatSource(externalsSource, source);
  }

}

MiniCssExtractPlugin.loader = require.resolve('./loader');
var _default = MiniCssExtractPlugin;
exports.default = _default;