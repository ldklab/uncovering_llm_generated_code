'use strict';

const mdurl = require('mdurl');
const ucmicro = require('uc.micro');
const entities = require('entities');
const LinkifyIt = require('linkify-it');
const punycode = require('punycode.js');

function MarkdownItConfig(presetName, options) {
    if (!(this instanceof MarkdownItConfig)) {
        return new MarkdownItConfig(presetName, options);
    }
    
    if (!options) {
        if (typeof presetName !== 'string') {
            options = presetName || {};
            presetName = 'default';
        }
    }

    // Initialize parser components
    this.inline = new ParserInline();
    this.block = new ParserBlock();
    this.core = new Core();
    this.renderer = new Renderer();
    this.linkify = new LinkifyIt();

    // Link validation and normalization functions
    this.validateLink = validateLink;
    this.normalizeLink = normalizeLink;
    this.normalizeLinkText = normalizeLinkText;

    // Utilities and helpers exposure
    this.utils = utils;
    this.helpers = assign({}, helpers);
    
    // Apply preset configuration
    this.options = {};
    this.configure(presetName);
    if (options) {
        this.set(options);
    }
}

// ... Additional utility and helper functions to support core features

MarkdownItConfig.prototype.set = function (options) {
    assign(this.options, options);
    return this;
};

MarkdownItConfig.prototype.configure = function (presets) {
    // Configure according to specified presets
    // ... Implementation specific details
};

MarkdownItConfig.prototype.enable = function (list, ignoreInvalid) {
    // Enable specific parsing rules
    // ... Implementation specific details
};

MarkdownItConfig.prototype.disable = function (list, ignoreInvalid) {
    // Disable specific parsing rules
    // ... Implementation specific details
};

MarkdownItConfig.prototype.use = function (plugin, ...params) {
    // Apply plugins for extension
    plugin(this, ...params);
    return this;
};

MarkdownItConfig.prototype.parse = function (src, env) {
    if (typeof src !== 'string') {
        throw new Error('Input data should be a String');
    }

    const state = new this.core.State(src, this, env || {});
    this.core.process(state);
    return state.tokens;
};

MarkdownItConfig.prototype.render = function (src, env) {
    const tokens = this.parse(src, env || {});
    return this.renderer.render(tokens, this.options, env);
};

MarkdownItConfig.prototype.parseInline = function (src, env) {
    const state = new this.core.State(src, this, env || {});
    state.inlineMode = true;
    this.core.process(state);
    return state.tokens;
};

MarkdownItConfig.prototype.renderInline = function (src, env) {
    const tokens = this.parseInline(src, env || {});
    return this.renderer.render(tokens, this.options, env);
};

module.exports = MarkdownItConfig;
