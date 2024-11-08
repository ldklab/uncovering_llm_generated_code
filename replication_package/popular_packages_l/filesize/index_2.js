export function filesize(bytes, options = {}) {
    const defaults = {
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
    options = { ...defaults, ...options };

    const base = options.base === 2 ? 1024 : 1000;
    let size = Number(bytes);
    if (isNaN(size)) throw new TypeError('Invalid number');

    let exponent = 0;
    while (size >= base && exponent < 8) {
        size /= base;
        exponent++;
    }

    if (options.exponent !== -1 && options.exponent !== exponent) {
        size *= Math.pow(base, exponent - options.exponent);
        exponent = options.exponent;
    }

    if (options.bits) size *= 8;

    const methods = {
        floor: Math.floor,
        ceil: Math.ceil,
        round: Math.round,
    };
    size = methods[options.roundingMethod](size);

    const fixedSize = Number(size.toFixed(options.precision));
    const unitSet = options.bits 
        ? ['b', 'Kibit', 'Mibit', 'Gibit', 'Tibit', 'Pibit', 'Eibit', 'Zibit', 'Yibit'] 
        : ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
    const symbol = options.symbols[unitSet[exponent]] || unitSet[exponent];
    const fullUnits = options.bits 
        ? ['bits', 'kilobits', 'megabits', 'gigabits', 'terabits', 'petabits', 'exabits', 'zettabits', 'yottabits'] 
        : ['bytes', 'kilobytes', 'megabytes', 'gigabytes', 'terabytes', 'petabytes', 'exabytes', 'zettabytes', 'yottabytes'];

    const formattedSize = options.locale
        ? fixedSize.toLocaleString(options.locale, { minimumFractionDigits: options.pad ? options.round : 0, maximumFractionDigits: options.round, ...options.localeOptions })
        : fixedSize.toFixed(options.precision);

    const fullForm = options.fullform ? (options.fullforms[exponent] || fullUnits[exponent]) : symbol;
    
    if (options.output === 'array') return [formattedSize, fullForm];
    if (options.output === 'object') return { value: formattedSize, symbol: fullForm, exponent, unit: fullForm };
    if (options.output === 'exponent') return exponent;
    return formattedSize + options.spacer + fullForm;
}

export function partial(descriptor) {
    return (bytes) => filesize(bytes, descriptor);
}
