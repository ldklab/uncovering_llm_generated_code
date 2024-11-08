const { defineProperty, getOwnPropertyDescriptor, getOwnPropertyNames, prototype } = Object;
const hasOwnProperty = prototype.hasOwnProperty;

function name(target, value) {
  defineProperty(target, "name", { value, configurable: true });
}

function exportModule(target, all) {
  for (const name in all) {
    defineProperty(target, name, { get: all[name], enumerable: true });
  }
}

function copyProps(to, from, except) {
  if (from && { object: 1, function: 1 }[typeof from]) {
    getOwnPropertyNames(from).forEach(key => {
      if (!hasOwnProperty.call(to, key) && key !== except) {
        defineProperty(to, key, {
          get: () => from[key],
          enumerable: !(getOwnPropertyDescriptor(from, key)?.enumerable === false)
        });
      }
    });
  }
  return to;
}

function toCommonJS(mod) {
  return copyProps(defineProperty({}, "__esModule", { value: true }), mod);
}

const RETRY_MODES = (() => {
  const modes = { STANDARD: "standard", ADAPTIVE: "adaptive" };
  return modes;
})();

const DEFAULT_MAX_ATTEMPTS = 3;
const DEFAULT_RETRY_MODE = "standard";

class DefaultRateLimiter {
  constructor(options = {}) {
    this.currentCapacity = 0;
    this.enabled = false;
    // Other initializations...
  }
  
  // Add necessary methods here...
  getCurrentTimeInSeconds() {
    return Date.now() / 1e3;
  }
  async getSendToken() {
    // Method implementation...
  }
  // More methods to implement rate limiting logic...
}

const DEFAULT_RETRY_DELAY_BASE = 100;
const MAXIMUM_RETRY_DELAY = 20_000;
const THROTTLING_RETRY_DELAY_BASE = 500;
const INITIAL_RETRY_TOKENS = 500;
const RETRY_COST = 5;
const TIMEOUT_RETRY_COST = 10;
const NO_RETRY_INCREMENT = 1;
const INVOCATION_ID_HEADER = "amz-sdk-invocation-id";
const REQUEST_HEADER = "amz-sdk-request";

const getDefaultRetryBackoffStrategy = name(() => {
  let delayBase = DEFAULT_RETRY_DELAY_BASE;

  function computeNextBackoffDelay(attempts) {
    return Math.min(MAXIMUM_RETRY_DELAY, Math.floor(Math.random() * (2 ** attempts) * delayBase));
  }

  function setDelayBase(delay) {
    delayBase = delay;
  }

  return { computeNextBackoffDelay, setDelayBase };
}, "getDefaultRetryBackoffStrategy");

function createDefaultRetryToken({ retryDelay, retryCount, retryCost }) {
  return {
    getRetryCount: () => retryCount,
    getRetryDelay: () => Math.min(MAXIMUM_RETRY_DELAY, retryDelay),
    getRetryCost: () => retryCost
  };
}

class StandardRetryStrategy {
  constructor(maxAttempts) {
    this.maxAttempts = maxAttempts;
    this.mode = RETRY_MODES.STANDARD;
    this.capacity = INITIAL_RETRY_TOKENS;
    // Other initializations...
  }

  async acquireInitialRetryToken() {
    return createDefaultRetryToken({ retryDelay: DEFAULT_RETRY_DELAY_BASE, retryCount: 0 });
  }

  async refreshRetryTokenForRetry(token, errorInfo) {
    const maxAttempts = await this.getMaxAttempts();
    if (this.shouldRetry(token, errorInfo, maxAttempts)) {
      const delay = this.computeBackoffDelay(token, errorInfo);
      const capacityCost = this.getCapacityCost(errorInfo.errorType);
      this.capacity -= capacityCost;
      return createDefaultRetryToken({
        retryDelay: delay,
        retryCount: token.getRetryCount() + 1,
        retryCost: capacityCost
      });
    }
    throw new Error("No retry token available");
  }

  // Other methods...
}

class AdaptiveRetryStrategy {
  constructor(maxAttemptsProvider, options = {}) {
    // Initialization logic...
  }

  async acquireInitialRetryToken(retryTokenScope) {
    // Implementation...
  }
  // Other methods...
}

class ConfiguredRetryStrategy extends StandardRetryStrategy {
  constructor(maxAttempts, computeNextBackoffDelay = DEFAULT_RETRY_DELAY_BASE) {
    super(maxAttempts);
    if (typeof computeNextBackoffDelay === "number") {
      this.computeNextBackoffDelay = () => computeNextBackoffDelay;
    } else {
      this.computeNextBackoffDelay = computeNextBackoffDelay;
    }
  }

  async refreshRetryTokenForRetry(tokenToRenew, errorInfo) {
    const token = await super.refreshRetryTokenForRetry(tokenToRenew, errorInfo);
    token.getRetryDelay = () => this.computeNextBackoffDelay(token.getRetryCount());
    return token;
  }
  // Additional methods if necessary...
}

module.exports = toCommonJS({
  AdaptiveRetryStrategy,
  ConfiguredRetryStrategy,
  DefaultRateLimiter,
  StandardRetryStrategy,
  RETRY_MODES,
  DEFAULT_MAX_ATTEMPTS,
  DEFAULT_RETRY_MODE,
  DEFAULT_RETRY_DELAY_BASE,
  MAXIMUM_RETRY_DELAY,
  THROTTLING_RETRY_DELAY_BASE,
  INITIAL_RETRY_TOKENS,
  RETRY_COST,
  TIMEOUT_RETRY_COST,
  NO_RETRY_INCREMENT,
  INVOCATION_ID_HEADER,
  REQUEST_HEADER
});
