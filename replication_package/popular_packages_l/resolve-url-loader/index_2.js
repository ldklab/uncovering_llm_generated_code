// resolve-url-loader/index.js

const path = require('path');
const { getOptions } = require('loader-utils');
const validate = require('schema-utils');
const { SourceMapConsumer, SourceMapGenerator } = require('source-map');

const schema = {
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

// Loader function
module.exports = function (source, inputSourceMap) {
    // Get and validate options
    const options = getOptions(this) || {};
    validate(schema, options, { name: 'Resolve URL Loader' });

    const callback = this.async();
    const sourceMapConsumer = inputSourceMap ? new SourceMapConsumer(inputSourceMap) : null;

    if (options.debug) {
        console.info('Starting resolve-url-loader with options:', options);
    }

    // Replace URLs and try to resolve them
    const resolvedSource = source.replace(/url\(\s*['"]?([^'"\)]*)['"]?\s*\)/g, (match, url) => {
        if (url.startsWith('http') || url.startsWith('data:')) {
            return match;
        }
        
        const dir = path.dirname(this.resourcePath);
        const resolvedPath = path.resolve(dir, url);

        if (this.fs.existsSync(resolvedPath)) {
            const correctedUrl = path.relative(this.context, resolvedPath).replace(/\\/g, '/');
            if (options.debug) {
                console.info(`Resolved: ${url} -> ${correctedUrl}`);
            }
            return `url(${correctedUrl})`;
        } else {
            const warning = `Cannot resolve '${url}' in '${this.resourcePath}'`;
            if (!options.silent) {
                this.emitWarning(new Error(warning));
            }
            return match;
        }
    });

    // Handle source maps
    if (options.sourceMap && sourceMapConsumer) {
        const sourceMapGenerator = SourceMapGenerator.fromSourceMap(sourceMapConsumer);
        callback(null, resolvedSource, sourceMapGenerator.toJSON());
    } else {
        callback(null, resolvedSource);
    }
};

// Webpack Configuration Example Usage

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