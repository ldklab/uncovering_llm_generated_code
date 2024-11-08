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
const { getHtmlWebpackPluginHooks } = require('./lib/hooks.js');

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
  constructor(options = {}) {
    this.userOptions = options;
    this.version = HtmlWebpackPlugin.version;

    this.options = Object.assign({
      template: 'auto',
      templateContent: false,
      templateParameters: templateParametersGenerator,
      filename: 'index.html',
      publicPath: options.publicPath === undefined ? 'auto' : options.publicPath,
      hash: false,
      inject: options.scriptLoading === 'blocking' ? 'body' : 'head',
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
    }, options);
  }

  apply(compiler) {
    this.logger = compiler.getInfrastructureLogger('HtmlWebpackPlugin');
    compiler.hooks.initialize.tap('HtmlWebpackPlugin', () => {
      const options = this.options;
      options.template = this.getTemplatePath(this.options.template, compiler.context);

      this.validateOptions();

      options.meta = !this.userOptions.template && options.templateContent === false && options.meta
        ? Object.assign({}, options.meta, { viewport: 'width=device-width, initial-scale=1' }, this.userOptions.meta)
        : options.meta;
      
      this.createOutput(compiler);
    });
  }

  validateOptions() {
    const options = this.options;
    const { logger } = this;

    if (!['defer', 'blocking', 'module', 'systemjs-module'].includes(options.scriptLoading)) {
      logger.error('Invalid scriptLoading option. Choose "defer", "blocking", "module", or "systemjs-module".');
    }

    if (![true, false, 'head', 'body'].includes(options.inject)) {
      logger.error('Invalid inject option. Choose true, false, "head", or "body".');
    }

    if (typeof options.templateParameters !== 'function' && typeof options.templateParameters !== 'object' && options.templateParameters !== false) {
      logger.error('templateParameters needs to be a function, object, or false.');
    }
  }

  createOutput(compiler) {
    const options = this.options;
    const entryNames = Object.keys(compiler.options.entry).length ? Object.keys(compiler.options.entry) : ['main'];
    const fileNameFunction = typeof options.filename === 'function' ? options.filename : entryName => options.filename.replace(/\[name\]/g, entryName);
    const outputFileNames = new Set(entryNames.map(fileNameFunction));

    outputFileNames.forEach(outputFileName => {
      const assetJson = { value: void 0 };
      const previousEmittedAssets = [];

      const childCompilerPlugin = new CachedChildCompilation(compiler);
      if (!options.templateContent) childCompilerPlugin.addEntry(options.template);

      let filename = path.isAbsolute(outputFileName) ? path.relative(compiler.options.output.path, outputFileName) : outputFileName;

      compiler.hooks.thisCompilation.tap('HtmlWebpackPlugin', compilation => {
        compilation.hooks.processAssets.tapAsync({
          name: 'HtmlWebpackPlugin',
          stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_INLINE
        }, (_, callback) => {
          this.generateHTML(compiler, compilation, filename, childCompilerPlugin, previousEmittedAssets, assetJson, callback);
        });
      });
    });
  }

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
      (match, prefix, filepath, postfix) => prefix + path.resolve(filepath) + postfix
    );
  }

  generateHTML(compiler, compilation, outputName, childCompilerPlugin, previousEmittedAssets, assetJson, callback) {
    const entryNames = Array.from(compilation.entrypoints.keys());
    const filteredEntryNames = this.filterEntryChunks(entryNames, this.options.chunks, this.options.excludeChunks);
    const sortedEntryNames = this.sortEntryChunks(filteredEntryNames, this.options.chunksSortMode, compilation);
    const templateResult = this.options.templateContent
      ? { mainCompilationHash: compilation.hash }
      : childCompilerPlugin.getCompilationEntryResult(this.options.template);

    if (templateResult.error) {
      compilation.errors.push(prettyError(templateResult.error, compiler.context).toString());
    }

    const isCompilationCached = templateResult.mainCompilationHash !== compilation.hash;
    const assetsInformationByGroups = this.getAssetsInformationByGroups(compilation, outputName, sortedEntryNames);
    const newAssetJson = JSON.stringify(this.getAssetFiles(assetsInformationByGroups));

    if (isCompilationCached && this.options.cache && assetJson.value === newAssetJson) {
      previousEmittedAssets.forEach(({ name, source, info }) => compilation.emitAsset(name, source, info));
      return callback();
    }

    previousEmittedAssets.length = 0;
    assetJson.value = newAssetJson;

    this.generateAssetsAndEmit(compiler, compilation, outputName, assetsInformationByGroups, childCompilerPlugin, previousEmittedAssets)
      .then(() => callback())
      .catch(err => {
        compilation.errors.push(prettyError(err, compiler.context).toString());
        if (this.options.showErrors) callback();
      });
  }

  async generateAssetsAndEmit(compiler, compilation, outputName, assetsInformationByGroups, childCompilerPlugin, previousEmittedAssets) {
    const assetsPromise = this.generateFavicon(compiler, this.options.favicon, compilation, assetsInformationByGroups.publicPath, previousEmittedAssets)
      .then(faviconPath => {
        assetsInformationByGroups.favicon = faviconPath;
        return getHtmlWebpackPluginHooks(compilation).beforeAssetTagGeneration.promise({ assets: assetsInformationByGroups, outputName, plugin: this });
      });

    const assetTagGroupsPromise = assetsPromise
      .then(({ assets }) => getHtmlWebpackPluginHooks(compilation).alterAssetTags.promise({ assetTags: this.createAssetTags(assets), outputName, plugin: this }))
      .then(({ assetTags }) => {
        const scriptTarget = this.shouldInjectScriptInHead() ? 'head' : 'body';
        return this.groupAssetsByElements(assetTags, scriptTarget);
      })
      .then(assetGroups => getHtmlWebpackPluginHooks(compilation).alterAssetTagGroups.promise({ headTags: assetGroups.headTags, bodyTags: assetGroups.bodyTags, outputName, plugin: this }));

    const templateEvaluationPromise = this.evaluateTemplate(content => {
      if (templateResult && templateResult.error) {
        return this.options.showErrors ? prettyError(templateResult.error, compiler.context).toHtml() : 'ERROR';
      }

      return this.options.templateContent ? this.options.templateContent : this.runChildCompiler(content);
    });

    const injectedHtmlPromise = Promise.all([assetTagGroupsPromise, templateEvaluationPromise])
      .then(([assetTags, html]) => this.injectAssetsIntoHtml(assetTags, html))
      .then(html => this.minifyHtmlAndEmit(html, compiler, compilation, outputName, previousEmittedAssets));

    return injectedHtmlPromise;
  }

  createAssetTags(assets) {
    return {
      scripts: this.generatedScriptTags(assets.js),
      styles: this.generateStyleTags(assets.css),
      meta: [
        ...(this.options.base !== false ? this.generateBaseTag(this.options.base) : []),
        ...this.generatedMetaTags(this.options.meta),
        ...(assets.favicon ? this.generateFaviconTag(assets.favicon) : [])
      ]
    };
  }

  shouldInjectScriptInHead() {
    return this.options.inject === 'head' || (this.options.inject !== 'body' && this.options.scriptLoading !== 'blocking');
  }

  async evaluateTemplate(evaluateTemplateFunction) {
    if (typeof evaluateTemplateFunction === 'function') {
      return await evaluateTemplateFunction();
    }
    return Promise.reject(new Error('Invalid template function'));
  }

  async runChildCompiler(content) {
    const { compiledEntry } = templateResult;
    const { assets } = compiledEntry;

    for (const name in assets) {
      previousEmittedAssets.push({ name, source: assets[name].source, info: assets[name].info });
    }

    return this.evaluateCompilationResult(compiledEntry.content, assetsInformationByGroups.publicPath, this.options.template);
  }

  async injectAssetsIntoHtml(assetTags, html) {
    const pluginArgs = { html, headTags: assetTags.headTags, bodyTags: assetTags.bodyTags, plugin: this, outputName };
    return getHtmlWebpackPluginHooks(compilation).afterTemplateExecution.promise(pluginArgs);
  }

  async minifyHtmlAndEmit(html, compiler, compilation, outputName, previousEmittedAssets) {
    const processHtml = await this.postProcessHtml(compiler, html, assetsInformationByGroups, { headTags, bodyTags });

    const filename = outputName.replace(/\[templatehash([^\]]*)\]/g, require('util').deprecate(
      (match, options) => `[contenthash${options}]`,
      '[templatehash] is now [contenthash]')
    );

    const replacedFilename = this.replacePlaceholdersInFilename(compiler, filename, processHtml, compilation);
    const source = new compiler.webpack.sources.RawSource(processHtml, false);

    compilation.emitAsset(replacedFilename.path, source, replacedFilename.info);
    previousEmittedAssets.push({ name: replacedFilename.path, source });

    return getHtmlWebpackPluginHooks(compilation).afterEmit.promise({ outputName: replacedFilename.path, plugin: this }).then(() => null);
  }

  filterEntryChunks(chunks, includedChunks, excludedChunks) {
    return chunks.filter(chunkName => {
      if (Array.isArray(includedChunks) && includedChunks.indexOf(chunkName) === -1) return false;
      if (Array.isArray(excludedChunks) && excludedChunks.includes(chunkName)) return false;
      return true;
    });
  }

  sortEntryChunks(entryNames, sortMode, compilation) {
    if (typeof sortMode === 'function') return entryNames.sort(sortMode);
    if (chunkSorter[sortMode]) return chunkSorter[sortMode](entryNames, compilation, this.options);
    throw new Error(`"${sortMode}" is not a valid chunk sort mode`);
  }

  getAssetsInformationByGroups(compilation, outputName, entryNames) {
    const publicPath = this.getPublicPath(compilation, outputName, this.options.publicPath);
    const assets = {
      publicPath,
      js: [],
      css: [],
      manifest: Object.keys(compilation.assets).find(file => path.extname(file) === '.appcache'),
      favicon: undefined
    };

    if (this.options.hash && assets.manifest) {
      assets.manifest = this.appendHash(assets.manifest, compilation.hash);
    }

    const entryPointPublicPathMap = {};
    const extensionRegexp = /\.(css|js|mjs)(\?|$)/;

    entryNames.forEach(entryName => {
      const entryPointFiles = compilation.entrypoints.get(entryName).getFiles().filter(file => {
        const asset = compilation.getAsset(file);
        return !asset || !(asset.info.hotModuleReplacement || asset.info.development);
      });

      const entryPointPublicPaths = entryPointFiles.map(file => {
        const publicPathWithUrlEncode = publicPath + this.urlencodePath(file);
        return this.options.hash ? this.appendHash(publicPathWithUrlEncode, compilation.hash) : publicPathWithUrlEncode;
      });

      entryPointPublicPaths.forEach(publicPathWithFile => {
        const extMatch = extensionRegexp.exec(publicPathWithFile);
        if (!extMatch || entryPointPublicPathMap[publicPathWithFile]) return;

        entryPointPublicPathMap[publicPathWithFile] = true;
        const ext = extMatch[1] === 'mjs' ? 'js' : extMatch[1];
        assets[ext].push(publicPathWithFile);
      });
    });

    return assets;
  }

  getPublicPath(compilation, filename, customPublicPath) {
    const webpackPublicPath = compilation.getAssetPath(compilation.outputOptions.publicPath, { hash: compilation.hash });
    const isPublicPathDefined = webpackPublicPath !== 'auto';
    let publicPath = customPublicPath !== 'auto'
      ? customPublicPath
      : (isPublicPathDefined ? webpackPublicPath : path.relative(path.resolve(compilation.options.output.path, path.dirname(filename)), compilation.options.output.path).split(path.sep).join('/'));

    if (publicPath.length && publicPath.slice(-1) !== '/') {
      publicPath += '/';
    }

    return publicPath;
  }

  urlencodePath(filePath) {
    const queryStringStart = filePath.indexOf('?');
    const urlPath = queryStringStart === -1 ? filePath : filePath.slice(0, queryStringStart);
    const queryString = filePath.slice(urlPath.length);

    const encodedUrlPath = urlPath.split('/').map(encodeURIComponent).join('/');
    return encodedUrlPath + queryString;
  }

  appendHash(url, hash) {
    if (!url) return url;
    return url + (url.includes('?') ? '&' : '?') + hash;
  }

  replacePlaceholdersInFilename(compiler, filename, fileContent, compilation) {
    if (!(/\[\\*([\w:]+)\\*\]/i).test(filename)) return { path: filename, info: {} };

    const hash = compiler.webpack.util.createHash(compilation.outputOptions.hashFunction);
    hash.update(fileContent);
    if (compilation.outputOptions.hashSalt) hash.update(compilation.outputOptions.hashSalt);

    const contentHash = hash.digest(compilation.outputOptions.hashDigest).slice(0, compilation.outputOptions.hashDigestLength);
    return compilation.getPathWithInfo(filename, { contentHash, chunk: { hash: contentHash, contentHash } });
  }

  async generateFavicon(compiler, favicon, compilation, publicPath, previousEmittedAssets) {
    if (!favicon) return Promise.resolve(undefined);

    const filename = path.resolve(compilation.compiler.context, favicon);
    try {
      const buf = await promisify(compilation.inputFileSystem.readFile)(filename);
      const source = new compiler.webpack.sources.RawSource(buf, false);
      const name = path.basename(filename);

      compilation.fileDependencies.add(filename);
      compilation.emitAsset(name, source);
      previousEmittedAssets.push({ name, source });

      return this.options.hash ? this.appendHash(publicPath + name, compilation.hash) : publicPath + name;
    } catch (err) {
      return Promise.reject(new Error(`HtmlWebpackPlugin: could not load file ${filename}`));
    }
  }

  generatedScriptTags(jsAssets) {
    return jsAssets.map(src => {
      const attributes = {};
      if (this.options.scriptLoading === 'defer') attributes.defer = true;
      else if (this.options.scriptLoading === 'module') attributes.type = 'module';
      else if (this.options.scriptLoading === 'systemjs-module') attributes.type = 'systemjs-module';

      attributes.src = src;
      return { tagName: 'script', voidTag: false, meta: { plugin: 'html-webpack-plugin' }, attributes };
    });
  }

  generateStyleTags(cssAssets) {
    return cssAssets.map(styleAsset => ({
      tagName: 'link',
      voidTag: true,
      meta: { plugin: 'html-webpack-plugin' },
      attributes: { href: styleAsset, rel: 'stylesheet' }
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
    if (metaOptions === false) return [];

    const metaTagAttributeObjects = Object.keys(metaOptions)
      .map(metaName => typeof metaOptions[metaName] === 'string'
        ? { name: metaName, content: metaOptions[metaName] }
        : metaOptions[metaName])
      .filter(attribute => attribute !== false);

    return metaTagAttributeObjects.map(metaTagAttributes => {
      if (metaTagAttributes === false) throw new Error('Invalid meta tag');
      return { tagName: 'meta', voidTag: true, meta: { plugin: 'html-webpack-plugin' }, attributes: metaTagAttributes };
    });
  }

  generateFaviconTag(favicon) {
    return [{
      tagName: 'link',
      voidTag: true,
      meta: { plugin: 'html-webpack-plugin' },
      attributes: { rel: 'icon', href: favicon }
    }];
  }

  groupAssetsByElements(assetTags, scriptTarget) {
    const result = { headTags: [...assetTags.meta, ...assetTags.styles], bodyTags: [] };

    if (scriptTarget === 'body') result.bodyTags.push(...assetTags.scripts);
    else {
      const insertPosition = this.options.scriptLoading === 'blocking' ? result.headTags.length : assetTags.meta.length;
      result.headTags.splice(insertPosition, 0, ...assetTags.scripts);
    }

    return result;
  }

  postProcessHtml(compiler, originalHtml, assetsInformationByGroups, assetTags) {
    let html = originalHtml;
    if (typeof html !== 'string') return Promise.reject(new Error(`Expected html to be a string but got ${JSON.stringify(html)}`));

    if (this.options.inject) {
      html = this.injectIntoHtml(html, assetTags, assetsInformationByGroups);
    }

    const isProductionLikeMode = compiler.options.mode === 'production' || !compiler.options.mode;
    const needMinify = this.options.minify === true || typeof this.options.minify === 'object' || (this.options.minify === 'auto' && isProductionLikeMode);

    if (!needMinify) return Promise.resolve(html);

    const minifyOptions = typeof this.options.minify === 'object' ? this.options.minify : {
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
    } catch (err) {
      if (String(err.message).startsWith('Parse Error')) {
        err.message = `html-webpack-plugin could not minify the generated output.\nIn production mode, HTML minification is enabled by default.\nTo disable, set minify: false in your HtmlWebpackPlugin config.\nSee https://github.com/jantimon/html-webpack-plugin#options for details.\n\nFor parser errors, report issues here:\nhttps://danielruf.github.io/html-minifier-terser/\n${err.message}`;
      }
      return Promise.reject(err);
    }

    return Promise.resolve(html);
  }

  injectIntoHtml(html, assetTags, assetsInformationByGroups) {
    const htmlRegExp = /(<html[^>]*>)/i;
    const headRegExp = /(<\/head\s*>)/i;
    const bodyRegExp = /(<\/body\s*>)/i;
    const metaViewportRegExp = /<meta[^>]+name=["']viewport["'][^>]*>/i;

    const body = assetTags.bodyTags.map(assetTagObject => htmlTagObjectToString(assetTagObject, this.options.xhtml));
    const head = assetTags.headTags.filter(item => !(item.tagName === 'meta' && item.attributes.name === 'viewport' && metaViewportRegExp.test(html)))
      .map(assetTagObject => htmlTagObjectToString(assetTagObject, this.options.xhtml));

    if (body.length) {
      html = bodyRegExp.test(html) ? html.replace(bodyRegExp, match => body.join('') + match) : html + body.join('');
    }

    if (head.length) {
      // Ensure head tag exists
      if (!headRegExp.test(html)) {
        html = !htmlRegExp.test(html) ? '<head></head>' + html : html.replace(htmlRegExp, match => match + '<head></head>');
      }

      // Append to head element
      html = html.replace(headRegExp, match => head.join('') + match);
    }

    // Inject manifest into opening html tag
    if (assetsInformationByGroups.manifest) {
      html = html.replace(/(<html[^>]*)(>)/i, (match, start, end) => /\smanifest\s*=/.test(match) ? match : start + ` manifest="${assetsInformationByGroups.manifest}"` + end);
    }

    return html;
  }
}

function templateParametersGenerator(compilation, assets, assetTags, options) {
  return {
    compilation,
    webpackConfig: compilation.options,
    htmlWebpackPlugin: {
      tags: assetTags,
      files: assets,
      options
    }
  };
}

HtmlWebpackPlugin.version = 5;
HtmlWebpackPlugin.getHooks = getHtmlWebpackPluginHooks;
HtmlWebpackPlugin.createHtmlTagObject = createHtmlTagObject;

module.exports = HtmlWebpackPlugin;
