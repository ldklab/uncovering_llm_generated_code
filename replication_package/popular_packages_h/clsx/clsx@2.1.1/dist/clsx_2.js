function processItem(item) {
    let result = '';
    
    if (typeof item === 'string' || typeof item === 'number') {
        result += item;
    } else if (typeof item === 'object') {
        if (Array.isArray(item)) {
            for (let i = 0; i < item.length; i++) {
                if (item[i]) {
                    const value = processItem(item[i]);
                    if (value) {
                        result && (result += ' ');
                        result += value;
                    }
                }
            }
        } else {
            for (const key in item) {
                if (item.hasOwnProperty(key) && item[key]) {
                    result && (result += ' ');
                    result += key;
                }
            }
        }
    }
    
    return result;
}

function classNames() {
    let finalString = '';
    
    for (let i = 0; i < arguments.length; i++) {
        const item = arguments[i];
        if (item) {
            const stringifiedItem = processItem(item);
            if (stringifiedItem) {
                finalString && (finalString += ' ');
                finalString += stringifiedItem;
            }
        }
    }
    
    return finalString;
}

module.exports = classNames;
module.exports.clsx = classNames;
