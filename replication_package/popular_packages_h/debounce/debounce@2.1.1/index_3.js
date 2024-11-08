function debounce(func, wait = 100, options = {}) {
	if (typeof func !== 'function') {
		throw new TypeError(`Expected a function, but received ${typeof func}`);
	}

	if (wait < 0) {
		throw new RangeError('`wait` cannot be negative');
	}

	const { immediate } = typeof options === 'boolean' ? { immediate: options } : options;

	let context, args, timeoutId, timestamp, result;

	function execute() {
		const callContext = context;
		const callArguments = args;
		context = args = undefined;
		result = func.apply(callContext, callArguments);
		return result;
	}

	function later() {
		const lastElapsed = Date.now() - timestamp;
		if (lastElapsed < wait && lastElapsed >= 0) {
			timeoutId = setTimeout(later, wait - lastElapsed);
		} else {
			timeoutId = undefined;
			if (!immediate) {
				execute();
			}
		}
	}

	const debounced = function(...args_) {
		if (
			context &&
			this !== context &&
			Object.getPrototypeOf(this) === Object.getPrototypeOf(context)
		) {
			throw new Error('Debounced method called with differing contexts of the same prototype.');
		}

		context = this;
		args = args_;
		timestamp = Date.now();
		
		const shouldCallImmediately = immediate && !timeoutId;
		
		if (!timeoutId) {
			timeoutId = setTimeout(later, wait);
		}
		
		if (shouldCallImmediately) {
			execute();
		}
		
		return result;
	};

	debounced.clear = () => {
		if (timeoutId) {
			clearTimeout(timeoutId);
			timeoutId = undefined;
		}
	};

	debounced.flush = () => {
		if (timeoutId) {
			debounced.trigger();
		}
	};

	debounced.trigger = () => {
		execute();
		debounced.clear();
	};

	return debounced;
}

module.exports.debounce = debounce;
module.exports = debounce;
