function debounce(func, wait = 100, options = {}) {
	if (typeof func !== 'function') {
		throw new TypeError(`Expected the first parameter to be a function, got \`${typeof func}\`.`);
	}

	if (wait < 0) {
		throw new RangeError('`wait` must not be negative.');
	}

	const { immediate } = typeof options === 'boolean' ? { immediate: options } : options;

	let context, args, timeout, lastCall;
	let result;

	function executeFunction() {
		const callContext = context;
		const callArguments = args;
		context = undefined;
		args = undefined;
		result = func.apply(callContext, callArguments);
		return result;
	}

	function checkElapsedTime() {
		const elapsed = Date.now() - lastCall;

		if (elapsed < wait && elapsed >= 0) {
			timeout = setTimeout(checkElapsedTime, wait - elapsed);
		} else {
			timeout = undefined;

			if (!immediate) {
				result = executeFunction();
			}
		}
	}

	const debounced = function (...arguments_) {
		if (
			context &&
			this !== context &&
			Object.getPrototypeOf(this) === Object.getPrototypeOf(context)
		) {
			throw new Error('Debounced method called with different contexts of the same prototype.');
		}

		context = this;
		args = arguments_;
		lastCall = Date.now();

		const callImmediately = immediate && !timeout;

		if (!timeout) {
			timeout = setTimeout(checkElapsedTime, wait);
		}

		if (callImmediately) {
			result = executeFunction();
		}

		return result;
	};

	debounced.clear = () => {
		if (!timeout) {
			return;
		}

		clearTimeout(timeout);
		timeout = undefined;
	};

	debounced.flush = () => {
		if (!timeout) {
			return;
		}

		debounced.trigger();
	};

	debounced.trigger = () => {
		result = executeFunction();
		debounced.clear();
	};

	return debounced;
}

module.exports.debounce = debounce;
module.exports = debounce;
