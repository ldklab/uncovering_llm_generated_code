module.exports = extend;

function extend(...sources) {
    const target = {};

    sources.forEach(source => {
        Object.keys(source).forEach(key => {
            target[key] = source[key];
        });
    });

    return target;
}
