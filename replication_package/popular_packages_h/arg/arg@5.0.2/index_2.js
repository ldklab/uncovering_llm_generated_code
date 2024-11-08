const flagSymbol = Symbol('arg flag');

class ArgError extends Error {
	constructor(msg, code) {
		super(msg);
		this.name = 'ArgError';
		this.code = code;
		Object.setPrototypeOf(this, ArgError.prototype);
	}
}

function arg(opts, { argv = process.argv.slice(2), permissive = false, stopAtPositional = false } = {}) {
	if (!opts) {
		throw new ArgError('Argument specification object is required', 'ARG_CONFIG_NO_SPEC');
	}

	const result = { _: [] };
	const aliases = {};
	const handlers = {};

	for (const key of Object.keys(opts)) {
		if (!key || key[0] !== '-' || key.length === 1) {
			throw new ArgError(`Invalid argument key: ${key}`, 'ARG_CONFIG_ERROR');
		}

		if (typeof opts[key] === 'string') {
			aliases[key] = opts[key];
			continue;
		}

		let type = opts[key];
		let isFlag = false;

		if (Array.isArray(type) && type.length === 1 && typeof type[0] === 'function') {
			const [fn] = type;
			type = (value, name, prev = []) => {
				prev.push(fn(value, name, prev[prev.length - 1]));
				return prev;
			};
			isFlag = fn === Boolean || fn[flagSymbol] === true;
		} else if (typeof type === 'function') {
			isFlag = type === Boolean || type[flagSymbol] === true;
		} else {
			throw new ArgError(`Type missing or not a function: ${key}`, 'ARG_CONFIG_BAD_TYPE');
		}

		if (key[1] !== '-' && key.length > 2) {
			throw new ArgError(`Short keys must have one character: ${key}`, 'ARG_CONFIG_SHORTOPT_TOOLONG');
		}

		handlers[key] = [type, isFlag];
	}

	for (let i = 0; i < argv.length; i++) {
		const wholeArg = argv[i];

		if (stopAtPositional && result._.length > 0) {
			result._.push(...argv.slice(i));
			break;
		}

		if (wholeArg === '--') {
			result._.push(...argv.slice(i + 1));
			break;
		}

		if (wholeArg.startsWith('-')) {
			const separatedArgs = wholeArg[1] === '-' || wholeArg.length === 2
				? [wholeArg]
				: wholeArg.slice(1).split('').map((a) => `-${a}`);

			for (let j = 0; j < separatedArgs.length; j++) {
				const arg = separatedArgs[j];
				const [origArgName, argStr] = arg[1] === '-' ? arg.split(/=(.*)/, 2) : [arg, undefined];
				let argName = origArgName;

				while (aliases[argName]) {
					argName = aliases[argName];
				}

				if (!handlers[argName]) {
					if (permissive) {
						result._.push(arg);
						continue;
					}
					throw new ArgError(`Unknown option: ${origArgName}`, 'ARG_UNKNOWN_OPTION');
				}

				const [type, isFlag] = handlers[argName];

				if (!isFlag && j + 1 < separatedArgs.length) {
					throw new ArgError(`Option requires argument: ${origArgName}`, 'ARG_MISSING_REQUIRED_SHORTARG');
				}

				if (isFlag) {
					result[argName] = type(true, argName, result[argName]);
				} else if (argStr === undefined) {
					if (argv.length < i + 2 || (argv[i + 1].startsWith('-') && !isNumeric(argv[i + 1], type))) {
						throw new ArgError(`Option requires argument: ${origArgName}`, 'ARG_MISSING_REQUIRED_LONGARG');
					}
					result[argName] = type(argv[i + 1], argName, result[argName]);
					i++;
				} else {
					result[argName] = type(argStr, argName, result[argName]);
				}
			}
		} else {
			result._.push(wholeArg);
		}
	}

	return result;
}

const isNumeric = (str, type) => /^-?\d*(\.\d+)?$/.test(str) && (type === Number || (typeof BigInt !== 'undefined' && type === BigInt));

arg.flag = (fn) => {
	fn[flagSymbol] = true;
	return fn;
};

arg.COUNT = arg.flag((v, name, existingCount) => (existingCount || 0) + 1);
arg.ArgError = ArgError;

module.exports = arg;
