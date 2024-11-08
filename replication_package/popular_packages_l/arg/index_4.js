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

    const handleArgument = (spec, result, flag, value, argv, i, skipRefresh) => {
        const type = spec[flag];
        const argumentName = typeof type === 'string' ? type : flag;

        if (type === Boolean || (Array.isArray(type) && type[0] === Boolean)) {
            result[argumentName] = type === Boolean ? true : (result[argumentName] || []).concat(true);
        } else {
            if (!value) {
                if (argv[i + 1] && !argv[i + 1].startsWith('-')) {
                    value = argv[++i];
                    skipRefresh = true;
                } else if (type !== String) {
                    value = '';
                } else {
                    throw createUnknownOptionError(flag);
                }
            }

            const val = type(value, flag, result[argumentName]);
            result[argumentName] = Array.isArray(type) ? (result[argumentName] || []).concat(val) : val;
        }
    };

    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];

        if (!skipFlag && !arg.startsWith('-') && options.stopAtPositional) {
            result._ = result._.concat(argv.slice(i));
            break;
        }

        if (arg.startsWith('--')) {
            const [identifier, value] = arg.split('=');
            if (!(identifier in spec)) {
                if (options.permissive) {
                    result._.push(arg);
                } else {
                    throw createUnknownOptionError(arg);
                }
                continue;
            }

            handleArgument(spec, result, identifier, value, argv, i, skipFlag);
        } else if (arg.startsWith('-') && arg !== '-') {
            for (let j = 1; j < arg.length; j++) {
                const flag = '-' + arg[j];
                if (!(flag in spec)) {
                    if (options.permissive) {
                        result._.push('-' + arg[j]);
                        break;
                    } else {
                        throw createUnknownOptionError(arg);
                    }
                }

                handleArgument(spec, result, flag, null, argv, i, skipFlag);
            }
        } else if (!skipFlag) {
            result._.push(arg);
        }

        skipFlag = false;
    }

    return result;
};

const createUnknownOptionError = (arg) => {
    const err = new Error(`Unknown or unexpected option: ${arg}`);
    err.code = 'ARG_UNKNOWN_OPTION';
    return err;
};

arg.flag = (fn) => (value, argName, previousValue) => fn(true, argName, previousValue);
arg.COUNT = (value, argName, previousValue = 0) => previousValue + 1;

module.exports = arg;
