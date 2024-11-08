const __defProp = Object.defineProperty;
const __getOwnPropDesc = Object.getOwnPropertyDescriptor;
const __getOwnPropNames = Object.getOwnPropertyNames;
const __hasOwnProp = Object.prototype.hasOwnProperty;

const __name = (target, value) => __defProp(target, "name", { value, configurable: true });
const __export = (target, all) => {
  for (const name in all) {
    __defProp(target, name, { get: all[name], enumerable: true });
  }
};
const __copyProps = (to, from, except, desc) => {
  if (from && (typeof from === "object" || typeof from === "function")) {
    for (const key of __getOwnPropNames(from)) {
      if (!__hasOwnProp.call(to, key) && key !== except) {
        __defProp(to, key, { 
          get: () => from[key], 
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable 
        });
      }
    }
  }
  return to;
};
const __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

class StandardRetryStrategy {
  constructor(maxAttemptsProvider, options = {}) {
    this.maxAttemptsProvider = maxAttemptsProvider;
    this.mode = "standard";
    this.retryDecider = options.retryDecider || defaultRetryDecider;
    this.delayDecider = options.delayDecider || defaultDelayDecider;
    this.retryQuota = options.retryQuota || getDefaultRetryQuota(initialTokens);
  }
  shouldRetry(error, attempts, maxAttempts) {
    return attempts < maxAttempts && this.retryDecider(error) && this.retryQuota.hasRetryTokens(error);
  }
  async getMaxAttempts() {
    try {
      return await this.maxAttemptsProvider();
    } catch {
      return DEFAULT_MAX_ATTEMPTS;
    }
  }
  // Implementation of retry logic
  async retry(next, args, options) {
    let attempts = 0;
    let totalDelay = 0;
    let retryTokenAmount;
    const maxAttempts = await this.getMaxAttempts();
    const { request } = args;
    while (true) {
      try {
        const { response, output } = await next(args);
        return { response, output };
      } catch (error) {
        attempts++;
        if (this.shouldRetry(error, attempts, maxAttempts)) {
          retryTokenAmount = this.retryQuota.retrieveRetryTokens(error);
          const delay = this.delayDecider(BASE_DELAY, attempts);
          totalDelay += delay;
          await new Promise(res => setTimeout(res, delay));
          continue;
        }
        throw error;
      }
    }
  }
}

class AdaptiveRetryStrategy extends StandardRetryStrategy {
  constructor(maxAttemptsProvider, options = {}) {
    super(maxAttemptsProvider, options);
    this.rateLimiter = options.rateLimiter || new DefaultRateLimiter();
    this.mode = "adaptive";
  }
  async retry(next, args) {
    // Adaptive retry logic
    return super.retry(next, args, { beforeRequest: async () => this.rateLimiter.getSendToken() });
  }
}

const defaultRetryDecider = (error) => {
  return isRetryableByTrait(error) || isThrottlingError(error) || isClockSkewError(error);
};

const defaultDelayDecider = (delayBase, attempts) => {
  return Math.min(MAX_RETRY_DELAY, Math.random() * Math.pow(2, attempts) * delayBase);
};

function getDefaultRetryQuota(initialRetryTokens) {
  const MAX_CAPACITY = initialRetryTokens;
  let availableCapacity = initialRetryTokens;
  return {
    hasRetryTokens: (error) => getCapacityAmount(error) <= availableCapacity,
    retrieveRetryTokens: (error) => {
      if (!this.hasRetryTokens(error)) {
        throw new Error("No retry token available");
      }
      const capacityAmount = getCapacityAmount(error);
      availableCapacity -= capacityAmount;
      return capacityAmount;
    },
    releaseRetryTokens: (amount) => {
      availableCapacity += amount;
      availableCapacity = Math.min(availableCapacity, MAX_CAPACITY);
    }
  };
}

const getDelayFromRetryAfterHeader = (response) => {
  if (!response || !response.headers) return;
  const retryAfter = response.headers["retry-after"];
  if (!retryAfter) return;
  const retryAfterSeconds = Number(retryAfter);
  return !isNaN(retryAfterSeconds) ? retryAfterSeconds * 1000 : new Date(retryAfter).getTime() - Date.now();
};

const omitRetryHeadersMiddleware = () => (next) => async (args) => {
  if (args.request && args.request.headers) {
    delete args.request.headers["invocation-id"];
    delete args.request.headers["retry-header"];
  }
  return next(args);
};

const getRetryPlugin = (options) => ({
  applyToStack: (clientStack) => {
    clientStack.add(retryMiddleware(options), {
      name: "retryMiddleware",
      step: "finalizeRequest",
      priority: "high"
    });
  }
});

const retryMiddleware = (options) => (next, context) => async (args) => {
  let attempts = 0;
  const retryStrategy = await options.retryStrategy();

  while (true) {
    try {
      return await next(args);
    } catch (error) {
      attempts++;
      if (attempts >= await options.maxAttempts()) throw error;
      const delay = retryStrategy.calculateRetryDelay(attempts);
      await new Promise(res => setTimeout(res, delay));
    }
  }
};

// Export the relevant classes and functions
module.exports = __toCommonJS({
  StandardRetryStrategy,
  AdaptiveRetryStrategy,
  defaultRetryDecider,
  defaultDelayDecider,
  getDelayFromRetryAfterHeader,
  omitRetryHeadersMiddleware,
  getRetryPlugin,
  retryMiddleware
});
