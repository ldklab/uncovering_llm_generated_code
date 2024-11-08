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

    const loaderContext = { ...context, resourcePath: resource, loaders, readResource };
    const resourcePath = resource.split('?')[0];

    function readAndProcessResource(callback) {
        if (processResource) {
            processResource(loaderContext, resourcePath, callback);
        } else {
            readResource(resourcePath, callback);
        }
    }

    readAndProcessResource((err, resourceBuffer) => {
        if (err) return callback(err);

        let resultBuffer = resourceBuffer;
        const fileDependencies = [resourcePath];
        const missingDependencies = [];
        const contextDependencies = [];

        loaders.forEach(loader => {
            let loaderFunc;
            let loaderPath;
            if (typeof loader === 'string') {
                loaderPath = loader.split('?')[0];
                loaderFunc = require(loaderPath);
                fileDependencies.push(loaderPath);
            } else if (loader.loader) {
                loaderPath = loader.loader;
                loaderFunc = require(loaderPath);
                fileDependencies.push(loaderPath);
            }
            resultBuffer = loaderFunc(resultBuffer, { ...loaderContext, options: loader.options });
        });

        const result = {
            result: resultBuffer.toString(),
            resourceBuffer,
            cacheable: true,
            fileDependencies,
            missingDependencies,
            contextDependencies
        };

        callback(null, result);
    });
}

module.exports = {
    runLoaders
};
