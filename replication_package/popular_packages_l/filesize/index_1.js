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
        symbols: {},
    };
    options = {...defaultOptions, ...options};

    const base = options.base === 2 ? 1024 : 1000;
    const bits = options.bits;
    const fullform = options.fullform;
    const fullforms = options.fullforms;
    const roundingMethod = options.roundingMethod;
    const spacer = options.spacer;
    const locale = options.locale;

    let e = -1;
    let num = Number(bytes);
    if (isNaN(num)) throw new TypeError('Invalid number');
    
    const ceil = num < 0 ? Math.ceil : Math.floor;
    
    while (num >= base && e < 8) {
        num /= base;
        e++;
    }

    const exponent = options.exponent !== -1 ? options.exponent : e;
    if (exponent !== e) {
        num *= Math.pow(base, e - exponent);
        e = exponent;
    }

    if (bits) num *= 8;

    num = (Math[roundingMethod] || Math.round)(num);
    num = Math.round(num * Math.pow(10, options.precision)) / Math.pow(10, options.precision);

    const units = bits ? ['b', 'Kibit', 'Mibit', 'Gibit', 'Tibit', 'Pibit', 'Eibit', 'Zibit', 'Yibit'] : ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
    const defaultUnit = bits ? 'bit' : 'B';
    const symbol = options.symbols[units[e]] || defaultUnit;

    const fullUnits = bits ? ['bits', 'kilobits', 'megabits', 'gigabits', 'terabits', 'petabits', 'exabits', 'zettabits', 'yottabits'] : ['bytes', 'kilobytes', 'megabytes', 'gigabytes', 'terabytes', 'petabytes', 'exabytes', 'zettabytes', 'yottabytes'];
    const full = fullform ? fullforms[e] || fullUnits[e] : '';

    let result = locale 
        ? num.toLocaleString(locale, { minimumFractionDigits: options.pad ? options.round : 0, maximumFractionDigits: options.round, ...options.localeOptions })
        : num.toFixed(options.precision);

    switch (options.output) {
        case 'array':
            return [result, symbol];
        case 'object':
            return {value: result, symbol, exponent: e, unit: symbol};
        case 'exponent':
            return e;
        default:
            return result + spacer + (full || symbol);
    }
}

export function partial(descriptor) {
    return (bytes) => filesize(bytes, descriptor);
}
