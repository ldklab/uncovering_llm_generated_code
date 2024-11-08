const fs = require('fs');
const path = require('path');
const vm = require('vm');
const loaderUtils = require('loader-utils');
const { promisify } = require('util');
const _ = require('lodash');
const { CachedChildCompilation } = require('./lib/cached-child-compiler');
const { createHtmlTagObject, htmlTagObjectToString, HtmlTagArray } = require('./lib/html-tags');
const prettyError = require('./lib/errors.js');
const chunkSorter = require('./lib/chunksorter.js');
const getHtmlWebpackPluginHooks = require('./lib/hooks.js').getHtmlWebpackPluginHooks;

const fsReadFileAsync = promisify(fs.readFile);

class HtmlWebpackPlugin {
  constructor(options) {
    this.userOptions = options || {};
    this.version = HtmlWebpackPlugin.version;
  }

  apply(compiler) {
    compiler.hooks.initialize.tap('HtmlWebpackPlugin', () => {
      const userOptions = this.userOptions;

      const defaultOptions = {
        template: 'auto',
        templateContent: false,
        templateParameters: templateParametersGenerator,
        filename: 'index.html',
        publicPath: userOptions.publicPath === undefined ? 'auto' : userOptions.publicPath,
        hash: false,
        inject: userOptions.scriptLoading === 'blocking' ? 'body' : 'head',
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

      const options = Object.assign(defaultOptions, userOptions);
      this.options = options;

      if (!userOptions.template && options.templateContent === false && options.meta) {
        const defaultMeta = {
          viewport: 'width=device-width, initial-scale=1'
        };
        options.meta = Object.assign({}, options.meta, defaultMeta, userOptions.meta);
      }

      const userOptionFilename = userOptions.filename || defaultOptions.filename;
      const filenameFunction = typeof userOptionFilename === 'function'
        ? userOptionFilename
        : (entryName) => userOptionFilename.replace(/\[name\]/g, entryName);

      const outputFileNames = new Set(Object.keys(compiler.options.entry).map(filenameFunction));

      const entryOptions = Array.from(outputFileNames).map(filename => ({
        ...options,
        filename
      }));

      entryOptions.forEach(instanceOptions => {
        hookIntoCompiler(compiler, instanceOptions, this);
      });
    });
  }

  evaluateCompilationResult(source, publicPath, templateFilename) {
    if (!source) {
      return Promise.reject(new Error('The child compilation didn\'t provide a result'));
    }
    if (source.indexOf('HTML_WEBPACK_PLUGIN_RESULT') >= 0) {
      source += ';\nHTML_WEBPACK_PLUGIN_RESULT';
    }
    const vmContext = vm.createContext({ HTML_WEBPACK_PLUGIN: true, require: require, htmlWebpackPluginPublicPath: publicPath, ...global });
    const vmScript = new vm.Script(source, { filename: templateFilename.replace(/^.+!/, '').replace(/\?.+$/, '') });
    let newSource;
    try {
      newSource = vmScript.runInContext(vmContext);
    } catch (e) {
      return Promise.reject(e);
    }
    if (typeof newSource === 'object' && newSource.__esModule && newSource.default) {
      newSource = newSource.default;
    }
    return typeof newSource === 'string' || typeof newSource === 'function'
      ? Promise.resolve(newSource)
      : Promise.reject(new Error('The loader didn\'t return html.'));
  }
}

function hookIntoCompiler(compiler, options, plugin) {
  const webpack = compiler.webpack;
  let assetJson;
  let previousEmittedAssets = [];

  options.template = getFullTemplatePath(options.template, compiler.context);

  const childCompilerPlugin = new CachedChildCompilation(compiler);
  if (!options.templateContent) {
    childCompilerPlugin.addEntry(options.template);
  }

  const filename = options.filename;
  if (path.resolve(filename) === path.normalize(filename)) {
    options.filename = path.relative(compiler.options.output.path, filename);
  }

  options.filename = options.filename.replace(/\[(?:(\w+):)?contenthash(?::([a-z]+\d*))?(?::(\d+))?\]/ig, match => {
    return match.replace('contenthash', 'templatehash');
  });

  const isProductionLikeMode = compiler.options.mode === 'production' || !compiler.options.mode;
  const minify = options.minify;
  if (minify === true || (minify === 'auto' && isProductionLikeMode)) {
    options.minify = {
      collapseWhitespace: true,
      keepClosingSlash: true,
      removeComments: true,
      removeRedundantAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
      useShortDoctype: true
    };
  }

  compiler.hooks.thisCompilation.tap('HtmlWebpackPlugin', (compilation) => {
    compilation.hooks.processAssets.tapAsync(
      {
        name: 'HtmlWebpackPlugin',
        stage: webpack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_INLINE
      },
      (compilationAssets, callback) => {
        const entryNames = Array.from(compilation.entrypoints.keys());
        const filteredEntryNames = filterChunks(entryNames, options.chunks, options.excludeChunks);
        const sortedEntryNames = sortEntryChunks(filteredEntryNames, options.chunksSortMode, compilation);

        const templateResult = options.templateContent
          ? { mainCompilationHash: compilation.hash }
          : childCompilerPlugin.getCompilationEntryResult(options.template);

        if ('error' in templateResult) {
          compilation.errors.push(prettyError(templateResult.error, compiler.context).toString());
        }

        const compiledEntries = 'compiledEntry' in templateResult ? {
          hash: templateResult.compiledEntry.hash,
          chunk: templateResult.compiledEntry.entry
        } : {
          hash: templateResult.mainCompilationHash
        };

        const childCompilationOutputName = compilation.getAssetPath(options.filename, compiledEntries);

        const isCompilationCached = templateResult.mainCompilationHash !== compilation.hash;

        const htmlPublicPath = getPublicPath(compilation, childCompilationOutputName, options.publicPath);

        const assets = htmlWebpackPluginAssets(compilation, sortedEntryNames, htmlPublicPath);

        const newAssetJson = JSON.stringify(getAssetFiles(assets));
        if (isCompilationCached && options.cache && assetJson === newAssetJson) {
          previousEmittedAssets.forEach(({ name, html }) => {
            compilation.emitAsset(name, new webpack.sources.RawSource(html, false));
          });
          return callback();
        } else {
          previousEmittedAssets = [];
          assetJson = newAssetJson;
        }

        const assetsPromise = getFaviconPublicPath(options.favicon, compilation, assets.publicPath)
          .then((faviconPath) => {
            assets.favicon = faviconPath;
            return getHtmlWebpackPluginHooks(compilation).beforeAssetTagGeneration.promise({
              assets: assets,
              outputName: childCompilationOutputName,
              plugin: plugin
            });
          });

        const assetTagGroupsPromise = assetsPromise.then(({ assets }) => getHtmlWebpackPluginHooks(compilation).alterAssetTags.promise({
          assetTags: {
            scripts: generatedScriptTags(assets.js),
            styles: generateStyleTags(assets.css),
            meta: [
              ...generateBaseTag(options.base),
              ...generatedMetaTags(options.meta),
              ...generateFaviconTags(assets.favicon)
            ]
          },
          outputName: childCompilationOutputName,
          plugin: plugin
        })).then(({ assetTags }) => {
          const scriptTarget = options.inject === 'head' ||
            (options.inject === false && options.scriptLoading !== 'blocking') ? 'head' : 'body';
          const assetGroups = generateAssetGroups(assetTags, scriptTarget);
          return getHtmlWebpackPluginHooks(compilation).alterAssetTagGroups.promise({
            headTags: assetGroups.headTags,
            bodyTags: assetGroups.bodyTags,
            outputName: childCompilationOutputName,
            plugin: plugin
          });
        });

        const templateEvaluationPromise = Promise.resolve()
          .then(() => {
            if ('error' in templateResult) {
              return options.showErrors ? prettyError(templateResult.error, compiler.context).toHtml() : 'ERROR';
            }
            if (options.templateContent !== false) {
              return options.templateContent;
            }
            return ('compiledEntry' in templateResult)
              ? plugin.evaluateCompilationResult(templateResult.compiledEntry.content, htmlPublicPath, options.template)
              : Promise.reject(new Error('Child compilation contained no compiledEntry'));
          });
        const templateExectutionPromise = Promise.all([assetsPromise, assetTagGroupsPromise, templateEvaluationPromise])
          .then(([assetsHookResult, assetTags, compilationResult]) => typeof compilationResult !== 'function'
            ? compilationResult
            : executeTemplate(compilationResult, assetsHookResult.assets, { headTags: assetTags.headTags, bodyTags: assetTags.bodyTags }, compilation));

        const injectedHtmlPromise = Promise.all([assetTagGroupsPromise, templateExectutionPromise])
          .then(([assetTags, html]) => {
            const pluginArgs = { html, headTags: assetTags.headTags, bodyTags: assetTags.bodyTags, plugin: plugin, outputName: childCompilationOutputName };
            return getHtmlWebpackPluginHooks(compilation).afterTemplateExecution.promise(pluginArgs);
          })
          .then(({ html, headTags, bodyTags }) => {
            return postProcessHtml(html, assets, { headTags, bodyTags });
          });

        const emitHtmlPromise = injectedHtmlPromise
          .then((html) => {
            const finalOutputName = childCompilationOutputName.replace(/\[(?:(\w+):)?templatehash(?::([a-z]+\d*))?(?::(\d+))?\]/ig, (_, hashType, digestType, maxLength) => {
              return loaderUtils.getHashDigest(Buffer.from(html, 'utf8'), hashType, digestType, parseInt(maxLength, 10));
            });
            compilation.emitAsset(finalOutputName, new webpack.sources.RawSource(html, false));
            previousEmittedAssets.push({ name: finalOutputName, html });
            return finalOutputName;
          })
          .then((finalOutputName) => getHtmlWebpackPluginHooks(compilation).afterEmit.promise({
            outputName: finalOutputName,
            plugin: plugin
          }).catch(err => {
            console.error(err);
            return null;
          }).then(() => null));

        emitHtmlPromise.then(() => {
          callback();
        });
      });
  });

  function getTemplateParameters(compilation, assets, assetTags) {
    const templateParameters = options.templateParameters;
    if (templateParameters === false) {
      return Promise.resolve({});
    }
    if (typeof templateParameters !== 'function' && typeof templateParameters !== 'object') {
      throw new Error('templateParameters has to be either a function or an object');
    }
    const templateParameterFunction = typeof templateParameters === 'function'
      ? templateParameters
      : (compilation, assets, assetTags, options) => Object.assign({},
        templateParametersGenerator(compilation, assets, assetTags, options),
        templateParameters
      );
    const preparedAssetTags = {
      headTags: prepareAssetTagGroupForRendering(assetTags.headTags),
      bodyTags: prepareAssetTagGroupForRendering(assetTags.bodyTags)
    };
    return Promise.resolve().then(() => templateParameterFunction(compilation, assets, preparedAssetTags, options));
  }

  function executeTemplate(templateFunction, assets, assetTags, compilation) {
    const templateParamsPromise = getTemplateParameters(compilation, assets, assetTags);
    return templateParamsPromise.then((templateParams) => {
      try {
        return templateFunction(templateParams);
      } catch (e) {
        compilation.errors.push(new Error('Template execution failed: ' + e));
        return Promise.reject(e);
      }
    });
  }

  function postProcessHtml(html, assets, assetTags) {
    if (typeof html !== 'string') {
      return Promise.reject(new Error('Expected html to be a string but got ' + JSON.stringify(html)));
    }
    const htmlAfterInjection = options.inject ? injectAssetsIntoHtml(html, assets, assetTags) : html;
    const htmlAfterMinification = minifyHtml(htmlAfterInjection);
    return Promise.resolve(htmlAfterMinification);
  }

  function addFileToAssets(filename, compilation) {
    filename = path.resolve(compilation.compiler.context, filename);
    return fsReadFileAsync(filename)
      .then(source => new webpack.sources.RawSource(source, false))
      .catch(() => Promise.reject(new Error('HtmlWebpackPlugin: could not load file ' + filename)))
      .then(rawSource => {
        const basename = path.basename(filename);
        compilation.fileDependencies.add(filename);
        compilation.emitAsset(basename, rawSource);
        return basename;
      });
  }

  function sortEntryChunks(entryNames, sortMode, compilation) {
    if (typeof sortMode === 'function') {
      return entryNames.sort(sortMode);
    }
    if (typeof chunkSorter[sortMode] !== 'undefined') {
      return chunkSorter[sortMode](entryNames, compilation, options);
    }
    throw new Error('"' + sortMode + '" is not a valid chunk sort mode');
  }

  function filterChunks(chunks, includedChunks, excludedChunks) {
    return chunks.filter(chunkName => {
      if (Array.isArray(includedChunks) && includedChunks.indexOf(chunkName) === -1) {
        return false;
      }
      if (Array.isArray(excludedChunks) && excludedChunks.indexOf(chunkName) !== -1) {
        return false;
      }
      return true;
    });
  }

  function getPublicPath(compilation, childCompilationOutputName, customPublicPath) {
    const compilationHash = compilation.hash;
    const webpackPublicPath = compilation.getAssetPath(compilation.outputOptions.publicPath, { hash: compilationHash });
    const isPublicPathDefined = webpackPublicPath.trim() !== '' && webpackPublicPath !== 'auto';

    let publicPath =
      customPublicPath !== 'auto'
        ? customPublicPath
        : (isPublicPathDefined
          ? webpackPublicPath
          : path.relative(path.resolve(compilation.options.output.path, path.dirname(childCompilationOutputName)), compilation.options.output.path)
            .split(path.sep).join('/'));

    if (publicPath.length && publicPath.substr(-1, 1) !== '/') {
      publicPath += '/';
    }

    return publicPath;
  }

  function htmlWebpackPluginAssets(compilation, entryNames, publicPath) {
    const compilationHash = compilation.hash;
    const assets = {
      publicPath,
      js: [],
      css: [],
      manifest: Object.keys(compilation.assets).find(assetFile => path.extname(assetFile) === '.appcache'),
      favicon: undefined
    };

    if (options.hash && assets.manifest) {
      assets.manifest = appendHash(assets.manifest, compilationHash);
    }

    const entryPointPublicPathMap = {};
    const extensionRegexp = /\.(css|js|mjs)(\?|$)/;
    for (let i = 0; i < entryNames.length; i++) {
      const entryName = entryNames[i];
      const entryPointUnfilteredFiles = compilation.entrypoints.get(entryName).getFiles();
      const entryPointFiles = entryPointUnfilteredFiles.filter((chunkFile) => {
        const asset = compilation.getAsset && compilation.getAsset(chunkFile);
        if (!asset) {
          return true;
        }
        const assetMetaInformation = asset.info || {};
        return !(assetMetaInformation.hotModuleReplacement || assetMetaInformation.development);
      });

      const entryPointPublicPaths = entryPointFiles.map(chunkFile => {
        const entryPointPublicPath = publicPath + urlencodePath(chunkFile);
        return options.hash ? appendHash(entryPointPublicPath, compilationHash) : entryPointPublicPath;
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

  function getFaviconPublicPath(faviconFilePath, compilation, publicPath) {
    if (!faviconFilePath) {
      return Promise.resolve(undefined);
    }
    return addFileToAssets(faviconFilePath, compilation)
      .then((faviconName) => {
        const faviconPath = publicPath + faviconName;
        if (options.hash) {
          return appendHash(faviconPath, compilation.hash);
        }
        return faviconPath;
      });
  }

  function generatedScriptTags(jsAssets) {
    return jsAssets.map(scriptAsset => ({
      tagName: 'script',
      voidTag: false,
      attributes: {
        defer: options.scriptLoading !== 'blocking',
        src: scriptAsset
      }
    }));
  }

  function generateStyleTags(cssAssets) {
    return cssAssets.map(styleAsset => ({
      tagName: 'link',
      voidTag: true,
      attributes: {
        href: styleAsset,
        rel: 'stylesheet'
      }
    }));
  }

  function generateBaseTag(baseOption) {
    if (baseOption === false) {
      return [];
    } else {
      return [{
        tagName: 'base',
        voidTag: true,
        attributes: (typeof baseOption === 'string') ? {
          href: baseOption
        } : baseOption
      }];
    }
  }

  function generatedMetaTags(metaOptions) {
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

    return metaTagAttributeObjects.map((metaTagAttributes) => {
      if (metaTagAttributes === false) {
        throw new Error('Invalid meta tag');
      }
      return {
        tagName: 'meta',
        voidTag: true,
        attributes: metaTagAttributes
      };
    });
  }

  function generateFaviconTags(faviconPath) {
    if (!faviconPath) {
      return [];
    }
    return [{
      tagName: 'link',
      voidTag: true,
      attributes: {
        rel: 'icon',
        href: faviconPath
      }
    }];
  }

  function generateAssetGroups(assetTags, scriptTarget) {
    const result = {
      headTags: [
        ...assetTags.meta,
        ...assetTags.styles
      ],
      bodyTags: []
    };
    if (scriptTarget === 'body') {
      result.bodyTags.push(...assetTags.scripts);
    } else {
      const insertPosition = options.scriptLoading === 'blocking' ? result.headTags.length : assetTags.meta.length;
      result.headTags.splice(insertPosition, 0, ...assetTags.scripts);
    }
    return result;
  }

  function prepareAssetTagGroupForRendering(assetTagGroup) {
    const xhtml = options.xhtml;
    return HtmlTagArray.from(assetTagGroup.map((assetTag) => {
      const copiedAssetTag = Object.assign({}, assetTag);
      copiedAssetTag.toString = function () {
        return htmlTagObjectToString(this, xhtml);
      };
      return copiedAssetTag;
    }));
  }

  function injectAssetsIntoHtml(html, assets, assetTags) {
    const htmlRegExp = /(<html[^>]*>)/i;
    const headRegExp = /(<\/head\s*>)/i;
    const bodyRegExp = /(<\/body\s*>)/i;
    const body = assetTags.bodyTags.map((assetTagObject) => htmlTagObjectToString(assetTagObject, options.xhtml));
    const head = assetTags.headTags.map((assetTagObject) => htmlTagObjectToString(assetTagObject, options.xhtml));

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

    if (assets.manifest) {
      html = html.replace(/(<html[^>]*)(>)/i, (match, start, end) => {
        if (/\smanifest\s*=/.test(match)) {
          return match;
        }
        return start + ' manifest="' + assets.manifest + '"' + end;
      });
    }
    return html;
  }

  function appendHash(url, hash) {
    if (!url) {
      return url;
    }
    return url + (url.indexOf('?') === -1 ? '?' : '&') + hash;
  }

  function urlencodePath(filePath) {
    const queryStringStart = filePath.indexOf('?');
    const urlPath = queryStringStart === -1 ? filePath : filePath.substr(0, queryStringStart);
    const queryString = filePath.substr(urlPath.length);
    const encodedUrlPath = urlPath.split('/').map(encodeURIComponent).join('/');
    return encodedUrlPath + queryString;
  }

  function getFullTemplatePath(template, context) {
    if (template === 'auto') {
      template = path.resolve(context, 'src/index.ejs');
      if (!fs.existsSync(template)) {
        template = path.join(__dirname, 'default_index.ejs');
      }
    }
    if (template.indexOf('!') === -1) {
      template = require.resolve('./lib/loader.js') + '!' + path.resolve(context, template);
    }
    return template.replace(/([!])([^/\\][^!?]+|[^/\\!?])($|\?[^!?\n]+$)/, (match, prefix, filepath, postfix) => prefix + path.resolve(filepath) + postfix);
  }

  function minifyHtml(html) {
    if (typeof options.minify !== 'object') {
      return html;
    }
    try {
      return require('html-minifier-terser').minify(html, options.minify);
    } catch (e) {
      const isParseError = String(e.message).indexOf('Parse Error') === 0;
      if (isParseError) {
        e.message = 'html-webpack-plugin could not minify the generated output.\n' +
          'In production mode the html minifcation is enabled by default.\n' +
          'If you are not generating a valid html output please disable it manually.\n' +
          'You can do so by adding the following setting to your HtmlWebpackPlugin config:\n|\n|' +
          '    minify: false\n|\n' +
          'See https://github.com/jantimon/html-webpack-plugin#options for details.\n\n' +
          'For parser dedicated bugs please create an issue here:\n' +
          'https://danielruf.github.io/html-minifier-terser/' +
          '\n' + e.message;
      }
      throw e;
    }
  }

  function getAssetFiles(assets) {
    const files = _.uniq(Object.keys(assets).filter(assetType => assetType !== 'chunks' && assets[assetType]).reduce((files, assetType) => files.concat(assets[assetType]), []));
    files.sort();
    return files;
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
