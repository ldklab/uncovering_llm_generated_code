const flagSymbol = Symbol('arg flag');

class ArgError extends Error {
	constructor(msg, code) {
		super(msg);
		this.name = 'ArgError';
		this.code = code;
		Object.setPrototypeOf(this, new.target.prototype);
	}
}

function arg(opts, config = {}) {
	const { argv = process.argv.slice(2), permissive = false, stopAtPositional = false } = config;

	if (!opts) {
		throw new ArgError('argument specification object is required', 'ARG_CONFIG_NO_SPEC');
	}

	const result = { _: [] };
	const aliases = {};
	const handlers = {};

	for (const key in opts) {
		if (!key) throw new ArgError('argument key cannot be an empty string', 'ARG_CONFIG_EMPTY_KEY');
		if (key[0] !== '-') throw new ArgError(`argument key must start with '-' but found: '${key}'`, 'ARG_CONFIG_NONOPT_KEY');
		if (key.length === 1) throw new ArgError(`singular '-' keys are not allowed: ${key}`, 'ARG_CONFIG_NONAME_KEY');

		const value = opts[key];
		if (typeof value === 'string') {
			aliases[key] = value;
			continue;
		}

		let type = value;
		let isFlag = false;

		if (Array.isArray(type) && type.length === 1 && typeof type[0] === 'function') {
			const [fn] = type;
			type = (val, name, prev = []) => (prev.push(fn(val, name, prev[prev.length - 1])), prev);
			isFlag = fn === Boolean || fn[flagSymbol] === true;
		} else if (typeof type === 'function') {
			isFlag = type === Boolean || type[flagSymbol] === true;
		} else {
			throw new ArgError(`invalid type for: ${key}`, 'ARG_CONFIG_VAD_TYPE');
		}

		if (key[1] !== '-' && key.length > 2) throw new ArgError(`short keys must have one character: ${key}`, 'ARG_CONFIG_SHORTOPT_TOOLONG');

		handlers[key] = [type, isFlag];
	}

	for (let i = 0; i < argv.length; i++) {
		const arg = argv[i];

		if (stopAtPositional && result._.length) {
			result._.push(...argv.slice(i));
			break;
		}

		if (arg === '--') {
			result._.push(...argv.slice(i + 1));
			break;
		}

		if (arg.length > 1 && arg[0] === '-') {
			const argsSequence = (arg[1] === '-' || arg.length === 2)
				? [arg]
				: arg.slice(1).split('').map(a => `-${a}`);

			for (let j = 0; j < argsSequence.length; j++) {
				const currentArg = argsSequence[j];
				const [argName, argValue] = currentArg[1] === '-' ? currentArg.split(/=(.*)/, 2) : [currentArg, undefined];

				let name = argName;
				while (aliases[name]) {
					name = aliases[name];
				}

				if (!handlers[name]) {
					if (permissive) {
						result._.push(currentArg);
						continue;
					} else {
						throw new ArgError(`unknown option: ${argName}`, 'ARG_UNKNOWN_OPTION');
					}
				}

				const [type, isFlag] = handlers[name];

				if (!isFlag && j + 1 < argsSequence.length) {
					throw new ArgError(`option requires argument: ${argName}`, 'ARG_MISSING_REQUIRED_SHORTARG');
				}

				if (isFlag) {
					result[name] = type(true, name, result[name]);
				} else if (argValue === undefined) {
					if (
						i + 1 >= argv.length || (
							argv[i + 1][0] === '-' &&
							!argv[i + 1].match(/^-?\d*(\.(?=\d))?\d*$/) &&
							(type !== Number && (typeof BigInt === 'undefined' || type !== BigInt))
						)
					) {
						const aliasInfo = argName === name ? '' : ` (alias for ${name})`;
						throw new ArgError(`option requires argument: ${argName}${aliasInfo}`, 'ARG_MISSING_REQUIRED_LONGARG');
					}
					result[name] = type(argv[++i], name, result[name]);
				} else {
					result[name] = type(argValue, name, result[name]);
				}
			}
		} else {
			result._.push(arg);
		}
	}

	return result;
}

arg.flag = fn => {
	fn[flagSymbol] = true;
	return fn;
};

arg.COUNT = arg.flag((v, name, existingCount = 0) => existingCount + 1);

arg.ArgError = ArgError;

module.exports = arg;
