// Define two functions, one that returns true and another that returns false
function trueFunc() {
    return true;
}

function falseFunc() {
    return false;
}

// Export the functions as part of an object
module.exports = {
    trueFunc: trueFunc,
    falseFunc: falseFunc
};
