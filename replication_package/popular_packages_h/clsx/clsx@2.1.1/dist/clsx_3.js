function convertToString(input) {
    let result = "";
    if (typeof input === "string" || typeof input === "number") {
        result += input;
    } else if (typeof input === "object") {
        if (Array.isArray(input)) {
            for (let i = 0; i < input.length; i++) {
                const recursiveResult = convertToString(input[i]);
                if (recursiveResult) {
                    if (result) result += " ";
                    result += recursiveResult;
                }
            }
        } else {
            for (const key in input) {
                if (input[key]) {
                    if (result) result += " ";
                    result += key;
                }
            }
        }
    }
    return result;
}

function concatenateArguments() {
    let concatenatedResult = "";
    for (let i = 0; i < arguments.length; i++) {
        const currentResult = convertToString(arguments[i]);
        if (currentResult) {
            if (concatenatedResult) concatenatedResult += " ";
            concatenatedResult += currentResult;
        }
    }
    return concatenatedResult;
}

module.exports = concatenateArguments;
module.exports.clsx = concatenateArguments;
