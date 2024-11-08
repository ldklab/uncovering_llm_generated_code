export function filesize(bytes, options = {}) {
    const defaultOptions = {
        base: 10,
        bits: false,
        fullform: false,
        fullforms: [],
        locale: '',
        localeOptions: {},
        output: 'string',
        pad: false,
        precision: 0,
        round: 2,
        roundingMethod: 'round',
        separator: '',
        spacer: ' ',
        standard: 'si',
        symbols: {}
    };

    options = { ...defaultOptions, ...options };

    const {
        base,
        bits,
        fullform,
        fullforms,
        locale,
        localeOptions,
        output,
        pad,
        precision,
        round,
        roundingMethod,
        spacer,
        symbols
    } = options;

    const baseVal = base === 2 ? 1024 : 1000;
    let e = -1;
    let num = Number(bytes);
    if (isNaN(num)) {
        throw new TypeError('Invalid number');
    }

    while (num >= baseVal && e < 8) {
        num /= baseVal;
        e++;
    }

    const exponent = options.exponent !== -1 ? options.exponent : e;
    if (exponent !== e) {
        num *= Math.pow(baseVal, e - exponent);
        e = exponent;
    }

    num *= bits ? 8 : 1;

    switch (roundingMethod) {
        case 'floor': num = Math.floor(num); break;
        case 'ceil': num = Math.ceil(num); break;
        default: num = Math.round(num);
    }

    num = Math.round(num * Math.pow(10, precision)) / Math.pow(10, precision);

    const unitArray = bits ? ['b', 'Kibit', 'Mibit', 'Gibit', 'Tibit', 'Pibit', 'Eibit', 'Zibit', 'Yibit'] :
        ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
    const fullformArray = bits ? ['bits', 'kilobits', 'megabits', 'gigabits', 'terabits', 'petabits', 'exabits', 'zettabits', 'yottabits'] :
        ['bytes', 'kilobytes', 'megabytes', 'gigabytes', 'terabytes', 'petabytes', 'exabytes', 'zettabytes', 'yottabytes'];
    
    const symbol = symbols[unitArray[e]] || (bits ? 'bit' : 'B');
    const full = fullform ? (fullforms[e] || fullformArray[e]) : '';

    let result;
    if (locale) {
        result = num.toLocaleString(locale, { minimumFractionDigits: pad ? round : 0, maximumFractionDigits: round, ...localeOptions });
    } else {
        result = num.toFixed(precision);
    }
    
    switch (output) {
        case 'array': return [result, symbol];
        case 'object': return { value: result, symbol, exponent: e, unit: symbol };
        case 'exponent': return e;
        default: return result + spacer + (full || symbol);
    }
}

export function partial(descriptor) {
    return (bytes) => filesize(bytes, descriptor);
}
