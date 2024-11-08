markdown
// index.js

function isSymbol(value) {
    return typeof value === 'symbol' ||
        Object.prototype.toString.call(value) === '[object Symbol]';
}

module.exports = isSymbol;
