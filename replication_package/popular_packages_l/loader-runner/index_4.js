const fs = require('fs');
const path = require('path');

function runLoaders(options, callback) {
    const {
        resource,
        loaders,
        context = {},
        processResource,
        readResource = fs.readFile.bind(fs)
    } = options;

    const resourcePath = resource.split('?')[0];
    const loaderContext = {
        ...context,
        resourcePath,
        loaders,
        readResource,
    };

    function processResourceOrRead(callback) {
        if (processResource) {
            processResource(loaderContext, resourcePath, callback);
        } else {
            readResource(resourcePath, callback);
        }
    }

    processResourceOrRead((err, resourceBuffer) => {
        if (err) return callback(err);

        let processedBuffer = resourceBuffer;
        const fileDependencies = [resourcePath];
        const missingDependencies = [];
        const contextDependencies = [];

        loaders.forEach(loader => {
            let loaderFunc;
            if (typeof loader === 'string') {
                loaderFunc = require(loader.split('?')[0]);
                fileDependencies.push(loader.split('?')[0]);
            } else if (loader.loader) {
                loaderFunc = require(loader.loader);
                fileDependencies.push(loader.loader);
            }
            processedBuffer = loaderFunc(processedBuffer, { ...loaderContext, options: loader.options });
        });

        const result = {
            result: processedBuffer.toString(),
            resourceBuffer,
            cacheable: true,
            fileDependencies,
            missingDependencies,
            contextDependencies,
        };

        callback(null, result);
    });
}

module.exports = {
    runLoaders
};
