markdown
// index.js

function isSymbol(value) {
    return typeof value === 'symbol' || 
           (typeof value === 'object' && value instanceof Symbol);
}

module.exports = isSymbol;
