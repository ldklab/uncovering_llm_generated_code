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

    const loaderContext = Object.assign({}, context, {
        resourcePath: resource,
        loaders,
        readResource
    });

    const resourcePath = resource.split('?')[0];

    function readAndProcessResource(done) {
        if (processResource) {
            processResource(loaderContext, resourcePath, done);
        } else {
            readResource(resourcePath, done);
        }
    }

    readAndProcessResource((err, resourceBuffer) => {
        if (err) return callback(err);

        let resultBuffer = resourceBuffer;
        const fileDependencies = [resourcePath];
        const missingDependencies = [];
        const contextDependencies = [];

        for (const loader of loaders) {
            let loaderFunc;
            if (typeof loader === 'string') {
                loaderFunc = require(loader.split('?')[0]);
                fileDependencies.push(loader.split('?')[0]);
            } else if (loader.loader) {
                loaderFunc = require(loader.loader);
                fileDependencies.push(loader.loader);
            }

            if (loaderFunc) {
                resultBuffer = loaderFunc(resultBuffer, { ...loaderContext, options: loader.options || {} });
            }
        }

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
