// index.js

const isSymbol = (value) => {
    if (typeof value === 'symbol') {
        return true;
    }
    if (typeof value === 'object' && value instanceof Symbol) {
        return true;
    }
    return false;
};

module.exports = isSymbol;
