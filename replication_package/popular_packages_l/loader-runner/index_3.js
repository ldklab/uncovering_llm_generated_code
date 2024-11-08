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

    const loaderContext = { 
        ...context, 
        resourcePath: resource, 
        loaders, 
        readResource 
    };

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
            if (typeof loader === 'string') {
                const loaderFunc = require(loader.split('?')[0]);
                resultBuffer = loaderFunc(resultBuffer, loaderContext);
                fileDependencies.push(loader.split('?')[0]);
            } else if (loader.loader) {
                const loaderFunc = require(loader.loader);
                resultBuffer = loaderFunc(resultBuffer, { 
                    ...loaderContext, 
                    options: loader.options 
                });
                fileDependencies.push(loader.loader);
            }
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
