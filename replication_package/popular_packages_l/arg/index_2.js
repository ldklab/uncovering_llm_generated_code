const arg = (spec, options = {}) => {
    const defaults = {
        permissive: false,
        argv: process.argv.slice(2),
        stopAtPositional: false,
    };
    options = { ...defaults, ...options };
    
    const result = { _: [] };
    const argv = options.argv;
    let skipFlag = false;

    for (let i = 0; i < argv.length; i++) {
        const currentArg = argv[i];

        if (!skipFlag && !currentArg.startsWith('-') && options.stopAtPositional) {
            result._ = result._.concat(argv.slice(i));
            break;
        }

        if (currentArg.startsWith('--')) {
            const [identifier, value] = currentArg.split('=');
            if (!(identifier in spec)) {
                if (options.permissive) {
                    result._.push(currentArg);
                } else {
                    throw createUnknownOptionError(currentArg);
                }
                continue;
            }

            processArgument(spec, result, identifier, value, argv, i, skipFlag);
        } else if (currentArg.startsWith('-') && currentArg !== '-') {
            for (let j = 1; j < currentArg.length; j++) {
                const flag = '-' + currentArg[j];
                if (!(flag in spec)) {
                    if (options.permissive) {
                        result._.push(flag);
                        break;
                    } else {
                        throw createUnknownOptionError(flag);
                    }
                }

                processArgument(spec, result, flag, null, argv, i, skipFlag);
            }
        } else if (!skipFlag) {
            result._.push(currentArg);
        }

        skipFlag = false;
    }

    return result;
};

const processArgument = (spec, result, flag, value, argv, index, skipNext) => {
    const type = spec[flag];
    flag = typeof type === 'string' ? type : flag;

    if (type === Boolean || (Array.isArray(type) && type[0] === Boolean)) {
        result[flag] = type === Boolean ? true : (result[flag] || []).concat(true);
    } else {
        if (!value) {
            if (argv[index + 1] && !argv[index + 1].startsWith('-')) {
                value = argv[++index];
                skipNext = true;
            } else if (type !== String) {
                value = '';
            } else {
                throw createUnknownOptionError(flag);
            }
        }
        const convertedValue = type(value, flag, result[flag]);
        result[flag] = Array.isArray(type) ? (result[flag] || []).concat(convertedValue) : convertedValue;
    }
};

const createUnknownOptionError = (arg) => {
    const error = new Error(`Unknown or unexpected option: ${arg}`);
    error.code = 'ARG_UNKNOWN_OPTION';
    return error;
};

arg.flag = (fn) => (value, argName, previousValue) => fn(true, argName, previousValue);
arg.COUNT = (value, argName, previousValue = 0) => previousValue + 1;

module.exports = arg;
