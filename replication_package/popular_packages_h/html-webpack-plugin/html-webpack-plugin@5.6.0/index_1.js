// @ts-check
'use strict';

const { promisify } = require('util');
const vm = require('vm');
const fs = require('fs');
const _ = require('lodash');
const path = require('path');
const { CachedChildCompilation } = require('./lib/cached-child-compiler');
const { createHtmlTagObject, htmlTagObjectToString, HtmlTagArray } = require('./lib/html-tags');
const prettyError = require('./lib/errors.js');
const chunkSorter = require('./lib/chunksorter.js');
const getHtmlWebpackPluginHooks = require('./lib/hooks.js').getHtmlWebpackPluginHooks;

/** HTML Webpack Plugin Class */
class HtmlWebpackPlugin {
  /**
   * @param {HtmlWebpackOptions} [options]
   */
  constructor(options) {
    this.userOptions = options || {};
    this.version = HtmlWebpackPlugin.version;
    this.options = {
      template: 'auto',
      templateContent: false,
      filename: 'index.html',
      publicPath: this.userOptions.publicPath === undefined ? 'auto' : this.userOptions.publicPath,
      inject: this.userOptions.scriptLoading === 'blocking' ? 'body' : 'head',
      scriptLoading: 'defer',
      minify: 'auto',
      cache: true,
      showErrors: true,
      chunks: 'all',
      excludeChunks: [],
      meta: {},
      title: 'Webpack App',
      ...this.userOptions,
    };
  }

  /**
   * Apply the plugin
   * @param {Compiler} compiler 
   */
  apply(compiler) {
    this.logger = compiler.getInfrastructureLogger('HtmlWebpackPlugin');
    compiler.hooks.initialize.tap('HtmlWebpackPlugin', () => {
      const options = this.options;

      options.template = this.getTemplatePath(this.options.template, compiler.context);

      if (!['defer', 'blocking', 'module', 'systemjs-module'].includes(options.scriptLoading)) {
        this.logger.error('Invalid "scriptLoading" specified.');
      }

      if (![true, false, 'head', 'body'].includes(options.inject)) {
        this.logger.error('Invalid `inject` option specified.');
      }
    });

    compiler.hooks.thisCompilation.tap('HtmlWebpackPlugin', (compilation) => {
      compilation.hooks.processAssets.tapAsync({
        name: 'HtmlWebpackPlugin',
        stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_INLINE
      }, (_, callback) => {
        this.generateHTML(compiler, compilation, this.options.filename, callback);
      });
    });
  }

  /**
   * Get the path of the template
   * @param {string} template 
   * @param {string} context 
   * @returns {string} Resolved template path
   */
  getTemplatePath(template, context) {
    if (template === 'auto') {
      template = fs.existsSync(path.resolve(context, 'src/index.ejs')) 
        ? path.resolve(context, 'src/index.ejs') 
        : path.join(__dirname, 'default_index.ejs');
    }
    if (!template.includes('!')) {
      template = `${require.resolve('./lib/loader.js')}!${path.resolve(context, template)}`;
    }
    return template.replace(/([!])([^/\\][^!?]+|[^/\\!?])($|\?[^!?\n]+$)/, (match, prefix, filepath, postfix) => `${prefix}${path.resolve(filepath)}${postfix}`);
  }

  /**
   * Generate HTML
   * @param {Compiler} compiler
   * @param {Compilation} compilation
   * @param {string} outputName
   * @param {Function} callback
   */
  generateHTML(compiler, compilation, outputName, callback) {
    // Implementation logic for generating HTML
    // This would entail fetching the template, injecting scripts/styles, minifying output
    // and then ensuring everything is properly emitted in the Webpack output
    callback();
  }
}

// Template parameter generator
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

// Statics:
HtmlWebpackPlugin.version = 5;
HtmlWebpackPlugin.getHooks = getHtmlWebpackPluginHooks;
HtmlWebpackPlugin.createHtmlTagObject = createHtmlTagObject;

module.exports = HtmlWebpackPlugin;
