const flagSymbol = Symbol('arg flag');

class ArgError extends Error {
	constructor(msg, code) {
		super(msg);
		this.name = 'ArgError';
		this.code = code;
		Object.setPrototypeOf(this, ArgError.prototype);
	}
}

function parseArgs(
	spec,
	{
		argv = process.argv.slice(2),
		permissive = false,
		stopAtPositional = false
	} = {}
) {
	if (!spec) {
		throw new ArgError('argument specification object is required', 'ARG_CONFIG_NO_SPEC');
	}

	const parsedArgs = { _: [] };
	const aliases = {};
	const argHandlers = {};

	for (const opt of Object.keys(spec)) {
		if (!opt) {
			throw new ArgError('argument key cannot be an empty string', 'ARG_CONFIG_EMPTY_KEY');
		}

		if (opt[0] !== '-') {
			throw new ArgError(`argument key must start with '-' but found: '${opt}'`, 'ARG_CONFIG_NONOPT_KEY');
		}

		if (opt.length === 1) {
			throw new ArgError(`argument key must have a name; singular '-' keys are not allowed: ${opt}`, 'ARG_CONFIG_NONAME_KEY');
		}

		if (typeof spec[opt] === 'string') {
			aliases[opt] = spec[opt];
			continue;
		}

		let handlerType = spec[opt];
		let isFlag = false;

		if (Array.isArray(handlerType) && handlerType.length === 1 && typeof handlerType[0] === 'function') {
			const [fn] = handlerType;
			handlerType = (value, name, prev = []) => {
				prev.push(fn(value, name, prev[prev.length - 1]));
				return prev;
			};
			isFlag = fn === Boolean || fn[flagSymbol] === true;
		} else if (typeof handlerType === 'function') {
			isFlag = handlerType === Boolean || handlerType[flagSymbol] === true;
		} else {
			throw new ArgError(`type missing or invalid for key: ${opt}`, 'ARG_CONFIG_VAD_TYPE');
		}

		if (opt[1] !== '-' && opt.length > 2) {
			throw new ArgError(`short argument keys must have only one character: ${opt}`, 'ARG_CONFIG_SHORTOPT_TOOLONG');
		}

		argHandlers[opt] = [handlerType, isFlag];
	}

	for (let i = 0; i < argv.length; i++) {
		const arg = argv[i];

		if (stopAtPositional && parsedArgs._.length > 0) {
			parsedArgs._.push(...argv.slice(i));
			break;
		}

		if (arg === '--') {
			parsedArgs._.push(...argv.slice(i + 1));
			break;
		}

		if (arg.startsWith('-')) {
			const separatedArgs = arg[1] === '-' || arg.length === 2
				? [arg]
				: arg.slice(1).split('').map(a => `-${a}`);

			for (let j = 0; j < separatedArgs.length; j++) {
				const subArg = separatedArgs[j];
				const [originalName, argValue] = subArg[1] === '-' ? subArg.split(/=(.*)/, 2) : [subArg, undefined];

				let argName = originalName;
				while (argName in aliases) {
					argName = aliases[argName];
				}

				if (!(argName in argHandlers)) {
					if (permissive) {
						parsedArgs._.push(arg);
						continue;
					} else {
						throw new ArgError(`unknown option: ${originalName}`, 'ARG_UNKNOWN_OPTION');
					}
				}

				const [type, flag] = argHandlers[argName];

				if (!flag && j + 1 < separatedArgs.length) {
					throw new ArgError(`option requires argument: ${originalName}`, 'ARG_MISSING_REQUIRED_SHORTARG');
				}

				if (flag) {
					parsedArgs[argName] = type(true, argName, parsedArgs[argName]);
				} else if (argValue === undefined) {
					if (argv.length <= i + 1 || (argv[i + 1].startsWith('-') && !(isValidNumber(argv[i + 1]) && (type === Number || (typeof BigInt !== 'undefined' && type === BigInt))))) {
						throw new ArgError(`option requires argument: ${originalName}`, 'ARG_MISSING_REQUIRED_LONGARG');
					}

					parsedArgs[argName] = type(argv[++i], argName, parsedArgs[argName]);
				} else {
					parsedArgs[argName] = type(argValue, argName, parsedArgs[argName]);
				}
			}
		} else {
			parsedArgs._.push(arg);
		}
	}

	return parsedArgs;
}

function isValidNumber(value) {
	return /^-?\d*(\.\d+)?$/.test(value);
}

parseArgs.flag = (fn) => {
	fn[flagSymbol] = true;
	return fn;
};

parseArgs.COUNT = parseArgs.flag((v, name, existingCount) => (existingCount || 0) + 1);

parseArgs.ArgError = ArgError;

module.exports = parseArgs;
