// @ts-check
'use strict';

const { promisify } = require('util');
const vm = require('vm');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const { CachedChildCompilation } = require('./lib/cached-child-compiler');
const { createHtmlTagObject, htmlTagObjectToString, HtmlTagArray } = require('./lib/html-tags');
const prettyError = require('./lib/errors.js');
const chunkSorter = require('./lib/chunksorter.js');
const getHtmlWebpackPluginHooks = require('./lib/hooks.js').getHtmlWebpackPluginHooks;

/** @typedef {import("./typings").HtmlTagObject} HtmlTagObject */
/** @typedef {import("./typings").Options} HtmlWebpackOptions */
/** @typedef {import("./typings").ProcessedOptions} ProcessedHtmlWebpackOptions */
/** @typedef {import("./typings").TemplateParameter} TemplateParameter */
/** @typedef {import("webpack").Compiler} Compiler */
/** @typedef {ReturnType<Compiler["getInfrastructureLogger"]>} Logger */
/** @typedef {import("webpack/lib/Compilation.js")} Compilation */
/** @typedef {Array<{ name: string, source: import('webpack').sources.Source, info?: import('webpack').AssetInfo }>} PreviousEmittedAssets */
/** @typedef {{ publicPath: string, js: Array<string>, css: Array<string>, manifest?: string, favicon?: string }} AssetsInformationByGroups */

class HtmlWebpackPlugin {
  /**
   * @param {HtmlWebpackOptions} [options]
   */
  constructor(options) {
    this.userOptions = options || {};
    this.version = HtmlWebpackPlugin.version;

    const defaultOptions = {
      template: 'auto',
      templateContent: false,
      templateParameters: templateParametersGenerator,
      filename: 'index.html',
      publicPath: this.userOptions.publicPath === undefined ? 'auto' : this.userOptions.publicPath,
      hash: false,
      inject: this.userOptions.scriptLoading === 'blocking' ? 'body' : 'head',
      scriptLoading: 'defer',
      compile: true,
      favicon: false,
      minify: 'auto',
      cache: true,
      showErrors: true,
      chunks: 'all',
      excludeChunks: [],
      chunksSortMode: 'auto',
      meta: {},
      base: false,
      title: 'Webpack App',
      xhtml: false
    };
    this.options = Object.assign(defaultOptions, this.userOptions);
  }

  /**
   * @param {Compiler} compiler
   * @returns {void}
   */
  apply(compiler) {
    this.logger = compiler.getInfrastructureLogger('HtmlWebpackPlugin');

    compiler.hooks.initialize.tap('HtmlWebpackPlugin', () => {
      this.options.template = this.getTemplatePath(this.options.template, compiler.context);
      this.validateOptions();

      const filenames = this.getOutputFilenames(compiler);

      filenames.forEach((outputFileName) => {
        const previousEmittedAssets = [];
        const childCompilerPlugin = new CachedChildCompilation(compiler);

        if (!this.options.templateContent) {
          childCompilerPlugin.addEntry(this.options.template);
        }
        const filename = this.getRelativeOutputPath(outputFileName, compiler);

        compiler.hooks.thisCompilation.tap('HtmlWebpackPlugin', (compilation) => {
          compilation.hooks.processAssets.tapAsync(
            { name: 'HtmlWebpackPlugin', stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_INLINE },
            (_, callback) => {
              this.generateHTML(compiler, compilation, filename, childCompilerPlugin, previousEmittedAssets, callback);
            });
        });
      });
    });
  }

  validateOptions() {
    const options = this.options;
    if (['defer', 'blocking', 'module', 'systemjs-module'].indexOf(options.scriptLoading) === -1) {
      this.logger.error('Invalid "scriptLoading" option.');
    }
    if ([true, false, 'head', 'body'].indexOf(options.inject) === -1) {
      this.logger.error('Invalid "inject" option.');
    }
    if (options.templateParameters !== false &&
      typeof options.templateParameters !== 'function' &&
      typeof options.templateParameters !== 'object') {
      this.logger.error('Invalid `templateParameters` option.');
    }
    if (!this.userOptions.template && options.templateContent === false && options.meta) {
      options.meta = Object.assign({}, options.meta, {
        viewport: 'width=device-width, initial-scale=1'
      }, this.userOptions.meta);
    }
  }

  getOutputFilenames(compiler) {
    const userOptionFilename = this.userOptions.filename || this.options.filename;
    const filenameFunction = typeof userOptionFilename === 'function'
      ? userOptionFilename
      : (entryName) => userOptionFilename.replace(/\[name\]/g, entryName);

    const entryNames = Object.keys(compiler.options.entry);
    return new Set((entryNames.length ? entryNames : ['main']).map(filenameFunction));
  }

  /**
   * @private
   * @param {string} template The path to the template e.g. './index.html'
   * @param {string} context The webpack base resolution path for relative paths e.g. process.cwd()
   */
  getTemplatePath(template, context) {
    if (template === 'auto') {
      template = path.resolve(context, 'src/index.ejs');
      if (!fs.existsSync(template)) {
        template = path.join(__dirname, 'default_index.ejs');
      }
    }
    if (template.indexOf('!') === -1) {
      template = require.resolve('./lib/loader.js') + '!' + path.resolve(context, template);
    }
    return template.replace(
      /([!])([^/\\][^!?]+|[^/\\!?])($|\?[^!?\n]+$)/,
      (match, prefix, filepath, postfix) => prefix + path.resolve(filepath) + postfix);
  }

  getRelativeOutputPath(filename, compiler) {
    const outputPath = compiler.options.output.path;
    return path.resolve(filename) === path.normalize(filename) ? path.relative(outputPath, filename) : filename;
  }

  filterEntryChunks(chunks, includedChunks, excludedChunks) {
    return chunks.filter(chunkName => {
      if (Array.isArray(includedChunks) && includedChunks.indexOf(chunkName) === -1) return false;
      if (Array.isArray(excludedChunks) && excludedChunks.indexOf(chunkName) !== -1) return false;
      return true;
    });
  }

  sortEntryChunks(entryNames, sortMode, compilation) {
    if (typeof sortMode === 'function') {
      return entryNames.sort(sortMode);
    }
    if (chunkSorter.hasOwnProperty(sortMode)) {
      return chunkSorter[sortMode](entryNames, compilation, this.options);
    }
    throw new Error(`"${sortMode}" is not a valid chunk sort mode`);
  }

  /**
   * @private
   * @param {Compilation} compilation
   * @param {string} filename
   * @param {string | 'auto'} customPublicPath
   * @returns {string}
   */
  getPublicPath(compilation, filename, customPublicPath) {
    const webpackPublicPath = compilation.getAssetPath(compilation.outputOptions.publicPath, { hash: compilation.hash });
    const isPublicPathDefined = webpackPublicPath !== 'auto';
    let publicPath = customPublicPath !== 'auto'
      ? customPublicPath
      : isPublicPathDefined
        ? webpackPublicPath
        : path.relative(path.resolve(compilation.options.output.path, path.dirname(filename)), compilation.options.output.path)
          .split(path.sep).join('/');

    if (publicPath.length && publicPath.substr(-1, 1) !== '/') {
      publicPath += '/';
    }
    return publicPath;
  }

  getAssetsInformationByGroups(compilation, outputName, entryNames) {
    const publicPath = this.getPublicPath(compilation, outputName, this.options.publicPath);
    const assets = {
      publicPath,
      js: [],
      css: [],
      manifest: Object.keys(compilation.assets).find(assetFile => path.extname(assetFile) === '.appcache'),
      favicon: undefined
    };
    if (this.options.hash && assets.manifest) {
      assets.manifest = this.appendHash(assets.manifest, compilation.hash);
    }
    const entryPointPublicPathMap = {};
    const extensionRegexp = /\.(css|js|mjs)(\?|$)/;

    for (const entryName of entryNames) {
      const entryPointUnfilteredFiles = compilation.entrypoints.get(entryName).getFiles();
      const entryPointFiles = entryPointUnfilteredFiles.filter((chunkFile) => {
        const asset = compilation.getAsset(chunkFile);
        if (!asset) {
          return true;
        }
        const assetMetaInformation = asset.info || {};
        return !(assetMetaInformation.hotModuleReplacement || assetMetaInformation.development);
      });
      const entryPointPublicPaths = entryPointFiles
        .map(chunkFile => {
          const entryPointPublicPath = publicPath + this.urlencodePath(chunkFile);
          return this.options.hash
            ? this.appendHash(entryPointPublicPath, compilation.hash)
            : entryPointPublicPath;
        });

      entryPointPublicPaths.forEach((entryPointPublicPath) => {
        const extMatch = extensionRegexp.exec(entryPointPublicPath);
        if (!extMatch) {
          return;
        }
        if (entryPointPublicPathMap[entryPointPublicPath]) {
          return;
        }
        entryPointPublicPathMap[entryPointPublicPath] = true;
        const ext = extMatch[1] === 'mjs' ? 'js' : extMatch[1];
        assets[ext].push(entryPointPublicPath);
      });
    }

    return assets;
  }

  evaluateCompilationResult(source, publicPath, templateFilename) {
    if (!source) {
      return Promise.reject(new Error('The child compilation didn\'t provide a result'));
    }
    if (source.indexOf('HTML_WEBPACK_PLUGIN_RESULT') >= 0) {
      source += ';\nHTML_WEBPACK_PLUGIN_RESULT';
    }
    const templateWithoutLoaders = templateFilename.replace(/^.+!/, '').replace(/\?.+$/, '');
    const vmContext = vm.createContext({
      ...global,
      HTML_WEBPACK_PLUGIN: true,
      require: require,
      htmlWebpackPluginPublicPath: publicPath,
      __filename: templateWithoutLoaders,
      __dirname: path.dirname(templateWithoutLoaders),
      AbortController: global.AbortController,
      AbortSignal: global.AbortSignal,
      Blob: global.Blob,
      Buffer: global.Buffer,
      ByteLengthQueuingStrategy: global.ByteLengthQueuingStrategy,
      BroadcastChannel: global.BroadcastChannel,
      CompressionStream: global.CompressionStream,
      CountQueuingStrategy: global.CountQueuingStrategy,
      Crypto: global.Crypto,
      CryptoKey: global.CryptoKey,
      CustomEvent: global.CustomEvent,
      DecompressionStream: global.DecompressionStream,
      Event: global.Event,
      EventTarget: global.EventTarget,
      File: global.File,
      FormData: global.FormData,
      Headers: global.Headers,
      MessageChannel: global.MessageChannel,
      MessageEvent: global.MessageEvent,
      MessagePort: global.MessagePort,
      PerformanceEntry: global.PerformanceEntry,
      PerformanceMark: global.PerformanceMark,
      PerformanceMeasure: global.PerformanceMeasure,
      PerformanceObserver: global.PerformanceObserver,
      PerformanceObserverEntryList: global.PerformanceObserverEntryList,
      PerformanceResourceTiming: global.PerformanceResourceTiming,
      ReadableByteStreamController: global.ReadableByteStreamController,
      ReadableStream: global.ReadableStream,
      ReadableStreamBYOBReader: global.ReadableStreamBYOBReader,
      ReadableStreamBYOBRequest: global.ReadableStreamBYOBRequest,
      ReadableStreamDefaultController: global.ReadableStreamDefaultController,
      ReadableStreamDefaultReader: global.ReadableStreamDefaultReader,
      Response: global.Response,
      Request: global.Request,
      SubtleCrypto: global.SubtleCrypto,
      DOMException: global.DOMException,
      TextDecoder: global.TextDecoder,
      TextDecoderStream: global.TextDecoderStream,
      TextEncoder: global.TextEncoder,
      TextEncoderStream: global.TextEncoderStream,
      TransformStream: global.TransformStream,
      TransformStreamDefaultController: global.TransformStreamDefaultController,
      URL: global.URL,
      URLSearchParams: global.URLSearchParams,
      WebAssembly: global.WebAssembly,
      WritableStream: global.WritableStream,
      WritableStreamDefaultController: global.WritableStreamDefaultController,
      WritableStreamDefaultWriter: global.WritableStreamDefaultWriter
    });

    const vmScript = new vm.Script(source, { filename: templateWithoutLoaders });
    try {
      let newSource = vmScript.runInContext(vmContext);
      if (typeof newSource === 'object' && newSource.__esModule && newSource.default) {
        newSource = newSource.default;
      }
      return typeof newSource === 'string' || typeof newSource === 'function'
        ? Promise.resolve(newSource)
        : Promise.reject(new Error('Invalid HTML output.'));
    } catch (e) {
      return Promise.reject(e);
    }
  }

  prepareAssetTagGroupForRendering(assetTagGroup) {
    const xhtml = this.options.xhtml;
    return HtmlTagArray.from(assetTagGroup.map((assetTag) => {
      const copiedAssetTag = Object.assign({}, assetTag);
      copiedAssetTag.toString = function () {
        return htmlTagObjectToString(this, xhtml);
      };
      return copiedAssetTag;
    }));
  }

  getTemplateParameters(compilation, assetsInformationByGroups, assetTags) {
    const templateParameters = this.options.templateParameters;
    if (templateParameters === false) {
      return Promise.resolve({});
    }
    if (typeof templateParameters !== 'function' && typeof templateParameters !== 'object') {
      throw new Error('templateParameters has to be either a function or an object');
    }
    const templateParameterFunction = typeof templateParameters === 'function'
      ? templateParameters
      : (compilation, assetsInformationByGroups, assetTags, options) => Object.assign({},
        templateParametersGenerator(compilation, assetsInformationByGroups, assetTags, options),
        templateParameters
      );
    const preparedAssetTags = {
      headTags: this.prepareAssetTagGroupForRendering(assetTags.headTags),
      bodyTags: this.prepareAssetTagGroupForRendering(assetTags.bodyTags)
    };
    return Promise.resolve()
      .then(() => templateParameterFunction(compilation, assetsInformationByGroups, preparedAssetTags, this.options));
  }

  executeTemplate(templateFunction, assetsInformationByGroups, assetTags, compilation) {
    const templateParamsPromise = this.getTemplateParameters(compilation, assetsInformationByGroups, assetTags);
    return templateParamsPromise.then((templateParams) => {
      try {
        return templateFunction(templateParams);
      } catch (e) {
        compilation.errors.push(new Error('Template execution failed: ' + e));
        return Promise.reject(e);
      }
    });
  }

  postProcessHtml(compiler, originalHtml, assetsInformationByGroups, assetTags) {
    let html = originalHtml;
    if (typeof html !== 'string') {
      return Promise.reject(new Error('Expected html to be a string but got ' + JSON.stringify(html)));
    }
    if (this.options.inject) {
      const htmlRegExp = /(<html[^>]*>)/i;
      const headRegExp = /(<\/head\s*>)/i;
      const bodyRegExp = /(<\/body\s*>)/i;
      const metaViewportRegExp = /<meta[^>]+name=["']viewport["'][^>]*>/i;
      const body = assetTags.bodyTags.map((assetTagObject) => htmlTagObjectToString(assetTagObject, this.options.xhtml));
      const head = assetTags.headTags.filter((item) => {
        if (item.tagName === 'meta' && item.attributes && item.attributes.name === 'viewport' && metaViewportRegExp.test(html)) {
          return false;
        }
        return true;
      }).map((assetTagObject) => htmlTagObjectToString(assetTagObject, this.options.xhtml));

      if (body.length) {
        if (bodyRegExp.test(html)) {
          html = html.replace(bodyRegExp, match => body.join('') + match);
        } else {
          html += body.join('');
        }
      }

      if (head.length) {
        if (!headRegExp.test(html)) {
          if (!htmlRegExp.test(html)) {
            html = '<head></head>' + html;
          } else {
            html = html.replace(htmlRegExp, match => match + '<head></head>');
          }
        }
        html = html.replace(headRegExp, match => head.join('') + match);
      }
      if (assetsInformationByGroups.manifest) {
        html = html.replace(/(<html[^>]*)(>)/i, (match, start, end) => {
          if (/\smanifest\s*=/.test(match)) {
            return match;
          }
          return start + ' manifest="' + assetsInformationByGroups.manifest + '"' + end;
        });
      }
    }

    const isProductionLikeMode = compiler.options.mode === 'production' || !compiler.options.mode;
    const needMinify = this.options.minify === true || typeof this.options.minify === 'object' || (this.options.minify === 'auto' && isProductionLikeMode);

    if (!needMinify) {
      return Promise.resolve(html);
    }

    const minifyOptions = typeof this.options.minify === 'object'
      ? this.options.minify
      : {
        collapseWhitespace: true,
        keepClosingSlash: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true
      };

    try {
      html = require('html-minifier-terser').minify(html, minifyOptions);
    } catch (e) {
      const isParseError = String(e.message).indexOf('Parse Error') === 0;
      if (isParseError) {
        e.message = `Html-webpack-plugin could not minify the generated output.
        In production mode the html minifcation is enabled by default.
        If you are not generating a valid html output please disable it manually.
        You can do so by adding the following setting to your HtmlWebpackPlugin config:
        minify: false
        See https://github.com/jantimon/html-webpack-plugin#options for details.`;
      }
      return Promise.reject(e);
    }

    return Promise.resolve(html);
  }

  getAssetFiles(assets) {
    const files = _.uniq(Object.keys(assets).filter(assetType => assetType !== 'chunks' && assets[assetType]).reduce((files, assetType) => files.concat(assets[assetType]), []));
    files.sort();
    return files;
  }

  generateFavicon(compiler, favicon, compilation, publicPath, previousEmittedAssets) {
    if (!favicon) {
      return Promise.resolve(undefined);
    }
    const filename = path.resolve(compilation.compiler.context, favicon);
    return promisify(compilation.inputFileSystem.readFile)(filename)
      .then((buf) => {
        const source = new compiler.webpack.sources.RawSource(buf, false);
        const name = path.basename(filename);
        compilation.fileDependencies.add(filename);
        compilation.emitAsset(name, source);
        previousEmittedAssets.push({ name, source });
        const faviconPath = publicPath + name;
        return this.options.hash ? this.appendHash(faviconPath, compilation.hash) : faviconPath;
      })
      .catch(() => Promise.reject(new Error('HtmlWebpackPlugin: could not load file ' + filename)));
  }

  generatedScriptTags(jsAssets) {
    return jsAssets.map(src => {
      const attributes = {};
      if (this.options.scriptLoading === 'defer') {
        attributes.defer = true;
      } else if (this.options.scriptLoading === 'module') {
        attributes.type = 'module';
      } else if (this.options.scriptLoading === 'systemjs-module') {
        attributes.type = 'systemjs-module';
      }
      attributes.src = src;
      return {
        tagName: 'script',
        voidTag: false,
        meta: { plugin: 'html-webpack-plugin' },
        attributes
      };
    });
  }

  generateStyleTags(cssAssets) {
    return cssAssets.map(styleAsset => ({
      tagName: 'link',
      voidTag: true,
      meta: { plugin: 'html-webpack-plugin' },
      attributes: {
        href: styleAsset,
        rel: 'stylesheet'
      }
    }));
  }

  generateBaseTag(base) {
    return [{
      tagName: 'base',
      voidTag: true,
      meta: { plugin: 'html-webpack-plugin' },
      attributes: typeof base === 'string' ? { href: base } : base
    }];
  }

  generatedMetaTags(metaOptions) {
    if (metaOptions === false) {
      return [];
    }
    const metaTagAttributeObjects = Object.keys(metaOptions)
      .map((metaName) => {
        const metaTagContent = metaOptions[metaName];
        return (typeof metaTagContent === 'string') ? {
          name: metaName,
          content: metaTagContent
        } : metaTagContent;
      })
      .filter((attribute) => attribute !== false);
    return metaTagAttributeObjects.map((metaTagAttributes) => ({
      tagName: 'meta',
      voidTag: true,
      meta: { plugin: 'html-webpack-plugin' },
      attributes: metaTagAttributes
    }));
  }

  generateFaviconTag(favicon) {
    return [{
      tagName: 'link',
      voidTag: true,
      meta: { plugin: 'html-webpack-plugin' },
      attributes: {
        rel: 'icon',
        href: favicon
      }
    }];
  }

  groupAssetsByElements(assetTags, scriptTarget) {
    const result = {
      headTags: [...assetTags.meta, ...assetTags.styles],
      bodyTags: []
    };
    if (scriptTarget === 'body') {
      result.bodyTags.push(...assetTags.scripts);
    } else {
      const insertPosition = this.options.scriptLoading === 'blocking' ? result.headTags.length : assetTags.meta.length;
      result.headTags.splice(insertPosition, 0, ...assetTags.scripts);
    }
    return result;
  }

  replacePlaceholdersInFilename(compiler, filename, fileContent, compilation) {
    if (/\[\\*([\w:]+)\\*\]/i.test(filename) === false) {
      return { path: filename, info: {} };
    }
    const hash = compiler.webpack.util.createHash(compilation.outputOptions.hashFunction);
    hash.update(fileContent);
    if (compilation.outputOptions.hashSalt) {
      hash.update(compilation.outputOptions.hashSalt);
    }
    const contentHash = hash.digest(compilation.outputOptions.hashDigest).slice(0, compilation.outputOptions.hashDigestLength);
    return compilation.getPathWithInfo(
      filename,
      {
        contentHash,
        chunk: {
          hash: contentHash,
          contentHash
        }
      }
    );
  }

  generateHTML(
    compiler,
    compilation,
    outputName,
    childCompilerPlugin,
    previousEmittedAssets,
    callback
  ) {
    const entryNames = Array.from(compilation.entrypoints.keys());
    const filteredEntryNames = this.filterEntryChunks(entryNames, this.options.chunks, this.options.excludeChunks);
    const sortedEntryNames = this.sortEntryChunks(filteredEntryNames, this.options.chunksSortMode, compilation);
    const templateResult = this.options.templateContent
      ? { mainCompilationHash: compilation.hash }
      : childCompilerPlugin.getCompilationEntryResult(this.options.template);

    if ('error' in templateResult) {
      compilation.errors.push(prettyError(templateResult.error, compiler.context).toString());
    }

    const isCompilationCached = templateResult.mainCompilationHash !== compilation.hash;
    const assetsInformationByGroups = this.getAssetsInformationByGroups(compilation, outputName, sortedEntryNames);
    const newAssetJson = JSON.stringify(this.getAssetFiles(assetsInformationByGroups));

    if (isCompilationCached && this.options.cache && assetJson.value === newAssetJson) {
      previousEmittedAssets.forEach(({ name, source, info }) => {
        compilation.emitAsset(name, source, info);
      });
      return callback();
    } else {
      previousEmittedAssets.length = 0;
      assetJson.value = newAssetJson;
    }

    const assetsPromise = this.generateFavicon(compiler, this.options.favicon, compilation, assetsInformationByGroups.publicPath, previousEmittedAssets)
      .then((faviconPath) => {
        assetsInformationByGroups.favicon = faviconPath;
        return getHtmlWebpackPluginHooks(compilation).beforeAssetTagGeneration.promise({
          assets: assetsInformationByGroups,
          outputName,
          plugin: this
        });
      });

    const assetTagGroupsPromise = assetsPromise
      .then(({ assets }) => getHtmlWebpackPluginHooks(compilation).alterAssetTags.promise({
        assetTags: {
          scripts: this.generatedScriptTags(assets.js),
          styles: this.generateStyleTags(assets.css),
          meta: [
            ...(this.options.base !== false ? this.generateBaseTag(this.options.base) : []),
            ...this.generatedMetaTags(this.options.meta),
            ...(assets.favicon ? this.generateFaviconTag(assets.favicon) : [])
          ]
        },
        outputName,
        publicPath: assetsInformationByGroups.publicPath,
        plugin: this
      }))
      .then(({ assetTags }) => {
        const scriptTarget = this.options.inject === 'head' ||
          (this.options.inject !== 'body' && this.options.scriptLoading !== 'blocking') ? 'head' : 'body';
        const assetGroups = this.groupAssetsByElements(assetTags, scriptTarget);
        return getHtmlWebpackPluginHooks(compilation).alterAssetTagGroups.promise({
          headTags: assetGroups.headTags,
          bodyTags: assetGroups.bodyTags,
          outputName,
          publicPath: assetsInformationByGroups.publicPath,
          plugin: this
        });
      });

    const templateEvaluationPromise = Promise.resolve()
      .then(() => {
        if ('error' in templateResult) {
          return this.options.showErrors ? prettyError(templateResult.error, compiler.context).toHtml() : 'ERROR';
        }
        if (this.options.templateContent !== false) {
          return this.options.templateContent;
        }
        if ('compiledEntry' in templateResult) {
          const compiledEntry = templateResult.compiledEntry;
          const assets = compiledEntry.assets;
          for (const name in assets) {
            previousEmittedAssets.push({ name, source: assets[name].source, info: assets[name].info });
          }
          return this.evaluateCompilationResult(compiledEntry.content, assetsInformationByGroups.publicPath, this.options.template);
        }
        return Promise.reject(new Error('Child compilation contained no compiledEntry'));
      });

    const templateExectutionPromise = Promise.all([assetsPromise, assetTagGroupsPromise, templateEvaluationPromise])
      .then(([assetsHookResult, assetTags, compilationResult]) => typeof compilationResult !== 'function'
        ? compilationResult
        : this.executeTemplate(compilationResult, assetsHookResult.assets, { headTags: assetTags.headTags, bodyTags: assetTags.bodyTags }, compilation));

    const injectedHtmlPromise = Promise.all([assetTagGroupsPromise, templateExectutionPromise])
      .then(([assetTags, html]) => {
        const pluginArgs = { html, headTags: assetTags.headTags, bodyTags: assetTags.bodyTags, plugin: this, outputName };
        return getHtmlWebpackPluginHooks(compilation).afterTemplateExecution.promise(pluginArgs);
      })
      .then(({ html, headTags, bodyTags }) => {
        return this.postProcessHtml(compiler, html, assetsInformationByGroups, { headTags, bodyTags });
      });

    const emitHtmlPromise = injectedHtmlPromise
      .then((html) => {
        const pluginArgs = { html, plugin: this, outputName };
        return getHtmlWebpackPluginHooks(compilation).beforeEmit.promise(pluginArgs)
          .then(result => result.html);
      })
      .catch(err => {
        compilation.errors.push(prettyError(err, compiler.context).toString());
        return this.options.showErrors ? prettyError(err, compiler.context).toHtml() : 'ERROR';
      })
      .then(html => {
        const filename = outputName.replace(/\[templatehash([^\]]*)\]/g, require('util').deprecate(
          (match, options) => `[contenthash${options}]`,
          '[templatehash] is now [contenthash]')
        );
        const replacedFilename = this.replacePlaceholdersInFilename(compiler, filename, html, compilation);
        const source = new compiler.webpack.sources.RawSource(html, false);
        compilation.emitAsset(replacedFilename.path, source, replacedFilename.info);
        previousEmittedAssets.push({ name: replacedFilename.path, source });
        return replacedFilename.path;
      })
      .then((finalOutputName) => getHtmlWebpackPluginHooks(compilation).afterEmit.promise({
        outputName: finalOutputName,
        plugin: this
      }).catch(err => {
        this.logger.error(err);
        return null;
      }).then(() => null));

    emitHtmlPromise.then(() => {
      callback();
    });
  }
}

function templateParametersGenerator(compilation, assets, assetTags, options) {
  return {
    compilation: compilation,
    webpackConfig: compilation.options,
    htmlWebpackPlugin: {
      tags: assetTags,
      files: assets,
      options: options
    }
  };
}

HtmlWebpackPlugin.version = 5;
HtmlWebpackPlugin.getHooks = getHtmlWebpackPluginHooks;
HtmlWebpackPlugin.createHtmlTagObject = createHtmlTagObject;

module.exports = HtmlWebpackPlugin;
