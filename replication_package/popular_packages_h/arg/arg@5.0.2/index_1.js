const flagSymbol = Symbol('arg flag');

class ArgError extends Error {
	constructor(msg, code) {
		super(msg);
		this.name = 'ArgError';
		this.code = code;

		Object.setPrototypeOf(this, ArgError.prototype);
	}
}

function arg(options, { argv = process.argv.slice(2), permissive = false, stopAtPositional = false } = {}) {
	if (!options) {
		throw new ArgError('Argument specification object is required', 'ARG_CONFIG_NO_SPEC');
	}

	const result = { _: [] };
	const aliases = {};
	const handlers = {};

	for (const key of Object.keys(options)) {
		if (!key || key[0] !== '-' || key.length === 1) {
			throw new ArgError(`Invalid argument key: '${key}'`, 'ARG_CONFIG_INVALID_KEY');
		}

		if (typeof options[key] === 'string') {
			aliases[key] = options[key];
			continue;
		}

		let type = options[key];
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
			throw new ArgError(`Type missing or invalid for key: '${key}'`, 'ARG_CONFIG_INVALID_TYPE');
		}

		if (key[1] !== '-' && key.length > 2) {
			throw new ArgError(`Single hyphen keys must be one character: '${key}'`, 'ARG_CONFIG_SHORT_KEY_TOO_LONG');
		}

		handlers[key] = [type, isFlag];
	}

	for (let i = 0; i < argv.length; i++) {
		const wholeArg = argv[i];

		if (stopAtPositional && result._.length > 0) {
			result._ = [...result._, ...argv.slice(i)];
			break;
		}

		if (wholeArg === '--') {
			result._ = [...result._, ...argv.slice(i+1)];
			break;
		}

		if (wholeArg.startsWith('-')) {
			const separatedArguments = wholeArg[1] === '-' || wholeArg.length === 2 ? [wholeArg] : wholeArg.slice(1).split('').map(a => `-${a}`);

			for (let j = 0; j < separatedArguments.length; j++) {
				const arg = separatedArguments[j];
				const [originalArgName, argStr] = arg.split(/=(.*)/, 2);
				let argName = originalArgName;

				while (argName in aliases) {
					argName = aliases[argName];
				}

				if (!(argName in handlers)) {
					if (permissive) {
						result._.push(arg);
					} else {
						throw new ArgError(`Unknown option: '${originalArgName}'`, 'ARG_UNKNOWN_OPTION');
					}
					continue;
				}

				const [type, isFlag] = handlers[argName];

				if (!isFlag && j + 1 < separatedArguments.length) {
					throw new ArgError(`Option requires an argument: '${originalArgName}'`, 'ARG_MISSING_ARGUMENT_FOR_OPTION');
				}

				if (isFlag) {
					result[argName] = type(true, argName, result[argName]);
				} else if (argStr === undefined) {
					if (i + 1 >= argv.length || argv[i + 1].startsWith('-') && !isValidNumberForOption(argv[i + 1], type)) {
						const extended = originalArgName === argName ? '' : ` (alias for ${argName})`;
						throw new ArgError(`Option requires argument: '${originalArgName}'${extended}`, 'ARG_MISSING_REQUIRED_ARGUMENT');
					}
					result[argName] = type(argv[i + 1], argName, result[argName]);
					++i;
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

arg.flag = fn => {
	fn[flagSymbol] = true;
	return fn;
};

arg.COUNT = arg.flag((v, name, existingCount) => (existingCount || 0) + 1);

arg.ArgError = ArgError;

module.exports = arg;

function isValidNumberForOption(value, type) {
	return /^-?\d*(\.(?=\d))?\d*$/.test(value) && (type === Number || (typeof BigInt !== 'undefined' && type === BigInt));
}
