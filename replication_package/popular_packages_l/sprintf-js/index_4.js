function sprintf(format, ...args) {
    return formatString(format, args);
}

function vsprintf(format, array) {
    return formatString(format, array);
}

function formatString(format, args) {
    let i = 0;
    const regex = /%(\d+\$)?([-+])?(')?(\d+)?(\.\d+)?([bcdeEufFgGosxXjtTv%])/g;
    return format.replace(regex, function(match, index, flags, pad, width, precision, type) {
        if (type === '%') return '%';

        let arg = args[i++];
        if (index) arg = args[parseInt(index) - 1];

        switch (type) {
            case 'b': return parseInt(arg).toString(2);
            case 'c': return String.fromCharCode(parseInt(arg));
            case 'd':
            case 'i': return parseInt(arg).toString(10);
            case 'e': return parseFloat(arg).toExponential(precision ? parseInt(precision.substr(1)) : undefined);
            case 'u': return Math.abs(parseInt(arg));
            case 'f': return parseFloat(arg).toFixed(precision ? parseInt(precision.substr(1)) : 6);
            case 'g':
            case 'G': return parseFloat(arg).toPrecision(precision ? parseInt(precision.substr(1)) : undefined);
            case 'o': return parseInt(arg).toString(8);
            case 's': return String(arg);
            case 'x': return parseInt(arg).toString(16);
            case 'X': return parseInt(arg).toString(16).toUpperCase();
            case 'j': return JSON.stringify(arg, null, width ? parseInt(width) : undefined);
            case 't': return String(!!arg);
            case 'T': return getType(arg);

            default:
                throw Error('Unknown format type');
        }
    });
}

function getType(arg) {
    if (arg === null) return 'null';
    if (Array.isArray(arg)) return 'array';
    if (arg instanceof Date) return 'date';
    return typeof arg;
}

module.exports = {
    sprintf,
    vsprintf
};
