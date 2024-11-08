const arg = (spec, options = {}) => {
    const defaults = {
        permissive: false,
        argv: process.argv.slice(2),
        stopAtPositional: false,
    };
    options = { ...defaults, ...options };
    
    const result = { _: [] };
    const { argv, stopAtPositional, permissive } = options;
    
    let skipFlag = false;

    argv.forEach((arg, i) => {
        if (!skipFlag && !arg.startsWith('-') && stopAtPositional) {
            result._ = [...result._, ...argv.slice(i)];
            return;
        }

        if (arg.startsWith('--')) {
            const [identifier, value] = arg.split('=');
            if (!(identifier in spec)) {
                if (permissive) {
                    result._.push(arg);
                } else {
                    throw createUnknownOptionError(arg);
                }
                return;
            }

            handleArgument(spec, result, identifier, value, argv, i, skipFlag);
        } else if (arg.startsWith('-') && arg !== '-') {
            [...arg.slice(1)].forEach((char) => {
                const flag = '-' + char;
                if (!(flag in spec)) {
                    if (permissive) {
                        result._.push(flag);
                        return;
                    } else {
                        throw createUnknownOptionError(arg);
                    }
                }

                handleArgument(spec, result, flag, null, argv, i, skipFlag);
            });
        } else if (!skipFlag) {
            result._.push(arg);
        }

        skipFlag = false;
    });

    return result;
};

const handleArgument = (spec, result, flag, value, argv, i, skipRefresh) => {
    const type = spec[flag];
	
    flag = typeof type === 'string' ? type : flag;

    if (type === Boolean || (Array.isArray(type) && type[0] === Boolean)) {
        result[flag] = type === Boolean ? true : (result[flag] || []).concat(true);
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

        const val = type(value, flag, result[flag]);
        result[flag] = Array.isArray(type) ? (result[flag] || []).concat(val) : val;
    }
};

const createUnknownOptionError = (arg) => {
    const err = new Error(`Unknown or unexpected option: ${arg}`);
    err.code = 'ARG_UNKNOWN_OPTION';
    return err;
};

arg.flag = (fn) => (value, argName, previousValue) => fn(true, argName, previousValue);
arg.COUNT = (value, argName, previousValue = 0) => previousValue + 1;

module.exports = arg;
