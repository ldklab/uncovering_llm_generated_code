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
    
    const base = options.base === 2 ? 1024 : 1000;
    const bits = options.bits;
    const standard = options.standard;
    const fullform = options.fullform;
    const fullforms = options.fullforms;
    const spacer = options.spacer;
    let locale = options.locale;
    const roundingMethod = options.roundingMethod;
    
    let e = -1;
    let num = Number(bytes);
    if (isNaN(num)) {
        throw new TypeError('Invalid number');
    }

    const increment = num < 0 ? Math.ceil : Math.floor;
    
    while (num >= base && e < 8) {
        num /= base;
        e++;
    }
    
    const exponent = options.exponent !== -1 ? options.exponent : e;
    
    if (exponent !== e) {
        num *= Math.pow(base, e - exponent);
        e = exponent;
    }

    if (bits) {
        num *= 8;
    }

    if (roundingMethod === 'floor') {
        num = Math.floor(num);
    } else if (roundingMethod === 'ceil') {
        num = Math.ceil(num);
    } else {
        num = Math[roundingMethod](num);
    }

    const precPower = Math.pow(10, options.precision);
    num = Math.round(num * precPower) / precPower;

    const defaultSymbols = bits 
        ? ['b', 'Kibit', 'Mibit', 'Gibit', 'Tibit', 'Pibit', 'Eibit', 'Zibit', 'Yibit'] 
        : ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
    
    const symbol = options.symbols[defaultSymbols[e]] || (bits ? 'bit' : 'B');

    const defaultFullforms = bits 
        ? ['bits', 'kilobits', 'megabits', 'gigabits', 'terabits', 'petabits', 'exabits', 'zettabits', 'yottabits']
        : ['bytes', 'kilobytes', 'megabytes', 'gigabytes', 'terabytes', 'petabytes', 'exabytes', 'zettabytes', 'yottabytes'];
    
    const full = fullform ? fullforms[e] || defaultFullforms[e] : '';

    let result;
    if (locale) {
        result = num.toLocaleString(locale, {
            minimumFractionDigits: options.pad ? options.round : 0,
            maximumFractionDigits: options.round, 
            ...options.localeOptions
        });
    } else {
        result = num.toFixed(options.precision);
    }

    if (options.output === 'array') {
        return [result, symbol];
    } else if (options.output === 'object') {
        return { value: result, symbol, exponent: e, unit: symbol };
    } else if (options.output === 'exponent') {
        return e;
    } else {
        return result + spacer + (full || symbol);
    }
}

export function partial(descriptor) {
    return (bytes) => filesize(bytes, descriptor);
}