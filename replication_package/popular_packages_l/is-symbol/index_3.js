// index.js

function checkIfSymbol(value) {
    // Check if the value is of type 'symbol' or is an object and an instance of Symbol
    if (typeof value === 'symbol') {
        return true;
    }
    if (typeof value === 'object' && Object.prototype.toString.call(value) === '[object Symbol]') {
        return true;
    }
    return false;
}

// Export the function for use in other modules
module.exports = checkIfSymbol;
