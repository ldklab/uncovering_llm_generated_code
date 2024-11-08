const argParser = (specifications, inputOptions = {}) => {
    const defaultOptions = {
        permissive: false,
        argv: process.argv.slice(2),
        stopAtPositional: false,
    };
    const options = {...defaultOptions, ...inputOptions};
    const parsedArgs = { _: [] };
    const argv = options.argv;
    let skip = false;

    argvLoop: for (let index = 0; index < argv.length; index++) {
        const currentArg = argv[index];

        if (!skip && !currentArg.startsWith('-') && options.stopAtPositional) {
            parsedArgs._.push(...argv.slice(index));
            break;
        }

        if (currentArg.startsWith('--')) {
            const [fullOption, givenValue] = currentArg.split('=');
            if (!(fullOption in specifications)) {
                if (options.permissive) {
                    parsedArgs._.push(currentArg);
                } else {
                    throw createErrorForUnknownOption(currentArg);
                }
                continue;
            }

            processArgument(specifications, parsedArgs, fullOption, givenValue, argv, index, skip);
        } else if (currentArg.startsWith('-') && currentArg !== '-') {
            for (let position = 1; position < currentArg.length; position++) {
                const shortFlag = '-' + currentArg[position];
                if (!(shortFlag in specifications)) {
                    if (options.permissive) {
                        parsedArgs._.push(shortFlag);
                        break;
                    } else {
                        throw createErrorForUnknownOption(currentArg);
                    }
                }

                processArgument(specifications, parsedArgs, shortFlag, null, argv, index, skip);
            }
        } else if (!skip) {
            parsedArgs._.push(currentArg);
        }

        skip = false;
    }

    return parsedArgs;
};

const processArgument = (specifications, parsedArgs, optionKey, value, argv, index, refreshSkip) => {
    const typeSpec = specifications[optionKey];
    const argumentKey = typeof typeSpec === 'string' ? typeSpec : optionKey;

    if (typeSpec === Boolean || (Array.isArray(typeSpec) && typeSpec[0] === Boolean)) {
        parsedArgs[argumentKey] = typeSpec === Boolean ? true : (parsedArgs[argumentKey] || []).concat(true);
    } else {
        if (!value) {
            if (argv[index + 1] && !argv[index + 1].startsWith('-')) {
                value = argv[++index];
                refreshSkip = true;
            } else if (typeSpec !== String) {
                value = '';
            } else {
                throw createErrorForUnknownOption(optionKey);
            }
        }

        const convertedValue = typeSpec(value, optionKey, parsedArgs[argumentKey]);
        parsedArgs[argumentKey] = Array.isArray(typeSpec) ? (parsedArgs[argumentKey] || []).concat(convertedValue) : convertedValue;
    }
};

const createErrorForUnknownOption = (option) => {
    const err = new Error(`Unknown or unexpected option: ${option}`);
    err.code = 'ARG_UNKNOWN_OPTION';
    return err;
};

argParser.flag = (fn) => (value, optionName, previousValue) => fn(true, optionName, previousValue);
argParser.COUNT = (value, optionName, previousValue = 0) => previousValue + 1;

module.exports = argParser;
