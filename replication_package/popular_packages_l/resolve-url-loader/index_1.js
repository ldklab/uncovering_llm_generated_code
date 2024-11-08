const path = require('path');
const loaderUtils = require('loader-utils');
const validateOptions = require('schema-utils');
const SourceMapConsumer = require('source-map').SourceMapConsumer;
const SourceMapGenerator = require('source-map').SourceMapGenerator;

// Schema for validating options
const optionsSchema = {
    type: 'object',
    properties: {
        sourceMap: { type: 'boolean' },
        removeCR: { type: 'boolean' },
        debug: { type: 'boolean' },
        silent: { type: 'boolean' },
        root: { type: 'string' },
        join: { instanceof: 'Function' }
    },
    additionalProperties: false
};

// Main loader function
module.exports = function(source, inputSourceMap) {
    // Retrieve and validate loader options
    const options = loaderUtils.getOptions(this) || {};
    validateOptions(optionsSchema, options, { name: 'Resolve URL Loader' });

    // Asynchronous loader for Webpack
    const callback = this.async();
    const sourceMapConsumer = inputSourceMap ? new SourceMapConsumer(inputSourceMap) : null;

    if (options.debug) {
        console.log('Debug: Starting resolve-url-loader with options:', options);
    }

    // Process source to resolve URLs
    const resolvedContent = source.replace(/url\(\s*['"]?([^'"\)]+)['"]?\s*\)/g, (match, url) => {
        if (/^(http|data):/.test(url)) return match;

        const directoryPath = path.dirname(this.resourcePath);
        const fullPath = path.resolve(directoryPath, url);

        if (this.fs.existsSync(fullPath)) {
            const relativePath = path.relative(this.context, fullPath).replace(/\\/g, '/');
            if (options.debug) {
                console.log(`Debug: Resolved URL '${url}' to '${relativePath}'`);
            }
            return `url(${relativePath})`;
        } else {
            const errorMsg = `Warning: Could not resolve URL '${url}' in file '${this.resourcePath}'`;
            if (!options.silent) {
                this.emitWarning(new Error(errorMsg));
            }
            return match;
        }
    });

    // Handle source map if enabled
    if (options.sourceMap && sourceMapConsumer) {
        const mapGenerator = SourceMapGenerator.fromSourceMap(sourceMapConsumer);
        callback(null, resolvedContent, mapGenerator.toJSON());
    } else {
        callback(null, resolvedContent);
    }
};

// Webpack Configuration Example
module.exports = {
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: [
                    { loader: 'css-loader', options: { sourceMap: true } },
                    { loader: 'resolve-url-loader', options: { sourceMap: true, debug: true } },
                    { loader: 'sass-loader', options: { sourceMap: true } }
                ]
            }
        ]
    }
};
