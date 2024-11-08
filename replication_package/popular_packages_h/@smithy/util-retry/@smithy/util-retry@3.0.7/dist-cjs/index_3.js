const { defineProperty, getOwnPropertyDescriptor, getOwnPropertyNames } = Object;
const hasOwnProperty = Object.prototype.hasOwnProperty;

const setName = (target, value) => defineProperty(target, "name", { value, configurable: true });

const exportModules = (target, allExports) => {
  for (let name in allExports) {
    defineProperty(target, name, { get: allExports[name], enumerable: true });
  }
};

const copyProperties = (to, from, exclude, descriptor) => {
  if (from && (typeof from === "object" || typeof from === "function")) {
    for (let key of getOwnPropertyNames(from)) {
      if (!hasOwnProperty.call(to, key) && key !== exclude) {
        defineProperty(to, key, {
          get: () => from[key],
          enumerable: !(descriptor = getOwnPropertyDescriptor(from, key)) || descriptor.enumerable
        });
      }
    }
  }
  return to;
};

const toCommonJS = (mod) => copyProperties(defineProperty({}, "__esModule", { value: true }), mod);

// Retries Module
const retryExports = {};

exportModules(retryExports, {
  AdaptiveRetryStrategy,
  ConfiguredRetryStrategy,
  DEFAULT_MAX_ATTEMPTS: () => DEFAULT_MAX_ATTEMPTS,
  DEFAULT_RETRY_DELAY_BASE: () => DEFAULT_RETRY_DELAY_BASE,
  DEFAULT_RETRY_MODE: () => DEFAULT_RETRY_MODE,
  DefaultRateLimiter,
  INITIAL_RETRY_TOKENS: () => INITIAL_RETRY_TOKENS,
  INVOCATION_ID_HEADER: () => INVOCATION_ID_HEADER,
  MAXIMUM_RETRY_DELAY: () => MAXIMUM_RETRY_DELAY,
  NO_RETRY_INCREMENT: () => NO_RETRY_INCREMENT,
  REQUEST_HEADER: () => REQUEST_HEADER,
  RETRY_COST: () => RETRY_COST,
  RETRY_MODES: () => RETRY_MODES,
  StandardRetryStrategy,
  THROTTLING_RETRY_DELAY_BASE: () => THROTTLING_RETRY_DELAY_BASE,
  TIMEOUT_RETRY_COST: () => TIMEOUT_RETRY_COST
});

module.exports = toCommonJS(retryExports);

const RETRY_MODES = ((modes) => {
  modes.STANDARD = 'standard';
  modes.ADAPTIVE = 'adaptive';
  return modes;
})({});

const DEFAULT_MAX_ATTEMPTS = 3;
const DEFAULT_RETRY_MODE = 'standard';

class DefaultRateLimiter {
  constructor(options = {}) {
    this.currentCapacity = 0;
    this.enabled = false;
    this.lastMaxRate = 0;
    this.measuredTxRate = 0;
    this.requestCount = 0;
    this.lastTimestamp = 0;
    this.timeWindow = 0;
    this.beta = options.beta ?? 0.7;
    this.minCapacity = options.minCapacity ?? 1;
    this.minFillRate = options.minFillRate ?? 0.5;
    this.scaleConstant = options.scaleConstant ?? 0.4;
    this.smooth = options.smooth ?? 0.8;
    const initTime = this.getCurrentTimeInSeconds();
    this.lastThrottleTime = initTime;
    this.lastTxRateBucket = Math.floor(initTime);
    this.fillRate = this.minFillRate;
    this.maxCapacity = this.minCapacity;
  }

  getCurrentTimeInSeconds() {
    return Date.now() / 1000;
  }

  async getSendToken() {
    return this.acquireTokenBucket(1);
  }

  async acquireTokenBucket(amount) {
    if (!this.enabled) return;
    this.refillTokenBucket();

    if (amount > this.currentCapacity) {
      const delay = (amount - this.currentCapacity) / this.fillRate * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    this.currentCapacity -= amount;
  }

  refillTokenBucket() {
    const timestamp = this.getCurrentTimeInSeconds();
    if (!this.lastTimestamp) {
      this.lastTimestamp = timestamp;
      return;
    }
    const fillAmount = (timestamp - this.lastTimestamp) * this.fillRate;
    this.currentCapacity = Math.min(this.maxCapacity, this.currentCapacity + fillAmount);
    this.lastTimestamp = timestamp;
  }

  updateClientSendingRate(response) {
    let calculatedRate;
    this.updateMeasuredRate();

    if (isThrottlingError(response)) {
      const rateToUse = !this.enabled ? this.measuredTxRate : Math.min(this.measuredTxRate, this.fillRate);
      this.lastMaxRate = rateToUse;
      this.calculateTimeWindow();
      this.lastThrottleTime = this.getCurrentTimeInSeconds();
      calculatedRate = this.cubicThrottle(rateToUse);
      this.enableTokenBucket();
    } else {
      this.calculateTimeWindow();
      calculatedRate = this.cubicSuccess(this.getCurrentTimeInSeconds());
    }

    const newRate = Math.min(calculatedRate, 2 * this.measuredTxRate);
    this.updateTokenBucketRate(newRate);
  }

  calculateTimeWindow() {
    this.timeWindow = Math.pow(this.lastMaxRate * (1 - this.beta) / this.scaleConstant, 1 / 3).toFixed(8);
  }

  cubicThrottle(rateToUse) {
    return (rateToUse * this.beta).toFixed(8);
  }

  cubicSuccess(timestamp) {
    return (
      this.scaleConstant * Math.pow(timestamp - this.lastThrottleTime - this.timeWindow, 3) + this.lastMaxRate
    ).toFixed(8);
  }

  enableTokenBucket() {
    this.enabled = true;
  }

  updateTokenBucketRate(newRate) {
    this.refillTokenBucket();
    this.fillRate = Math.max(newRate, this.minFillRate);
    this.maxCapacity = Math.max(newRate, this.minCapacity);
    this.currentCapacity = Math.min(this.currentCapacity, this.maxCapacity);
  }

  updateMeasuredRate() {
    const t = this.getCurrentTimeInSeconds();
    const timeBucket = Math.floor(t * 2) / 2;
    this.requestCount++;

    if (timeBucket > this.lastTxRateBucket) {
      const currentRate = this.requestCount / (timeBucket - this.lastTxRateBucket);
      this.measuredTxRate = (currentRate * this.smooth + this.measuredTxRate * (1 - this.smooth)).toFixed(8);
      this.requestCount = 0;
      this.lastTxRateBucket = timeBucket;
    }
  }
}

class StandardRetryStrategy {
  constructor(maxAttempts) {
    this.maxAttempts = maxAttempts;
    this.mode = 'standard';
    this.capacity = INITIAL_RETRY_TOKENS;
    this.retryBackoffStrategy = getDefaultRetryBackoffStrategy();
    this.maxAttemptsProvider = typeof maxAttempts === "function" ? maxAttempts : async () => maxAttempts;
  }

  async acquireInitialRetryToken() {
    return createDefaultRetryToken({ retryDelay: DEFAULT_RETRY_DELAY_BASE, retryCount: 0 });
  }

  async refreshRetryTokenForRetry(token, errorInfo) {
    const maxAttempts = await this.getMaxAttempts();

    if (this.shouldRetry(token, errorInfo, maxAttempts)) {
      const errorType = errorInfo.errorType;
      this.retryBackoffStrategy.setDelayBase(errorType === "THROTTLING" ? THROTTLING_RETRY_DELAY_BASE : DEFAULT_RETRY_DELAY_BASE);
      const delay = this.retryBackoffStrategy.computeNextBackoffDelay(token.getRetryCount());
      const retryDelay = errorInfo.retryAfterHint ? Math.max(errorInfo.retryAfterHint.getTime() - Date.now() || 0, delay) : delay;
      const capacityCost = this.getCapacityCost(errorType);
      this.capacity -= capacityCost;
      return createDefaultRetryToken({ retryDelay, retryCount: token.getRetryCount() + 1, retryCost: capacityCost });
    }

    throw new Error("No retry token available");
  }

  recordSuccess(token) {
    this.capacity = Math.max(INITIAL_RETRY_TOKENS, this.capacity + (token.getRetryCost() ?? NO_RETRY_INCREMENT));
  }

  getCapacity() {
    return this.capacity;
  }

  async getMaxAttempts() {
    try {
      return await this.maxAttemptsProvider();
    } catch (error) {
      console.warn(`Max attempts provider could not resolve. Using default of ${DEFAULT_MAX_ATTEMPTS}`);
      return DEFAULT_MAX_ATTEMPTS;
    }
  }

  shouldRetry(tokenToRenew, errorInfo, maxAttempts) {
    const attempts = tokenToRenew.getRetryCount() + 1;
    return attempts < maxAttempts && this.capacity >= this.getCapacityCost(errorInfo.errorType) && this.isRetryableError(errorInfo.errorType);
  }

  getCapacityCost(errorType) {
    return errorType === "TRANSIENT" ? TIMEOUT_RETRY_COST : RETRY_COST;
  }

  isRetryableError(errorType) {
    return errorType === "THROTTLING" || errorType === "TRANSIENT";
  }
}

class AdaptiveRetryStrategy {
  constructor(maxAttemptsProvider, options) {
    this.maxAttemptsProvider = maxAttemptsProvider;
    this.mode = 'adaptive';
    const { rateLimiter } = options ?? {};
    this.rateLimiter = rateLimiter ?? new DefaultRateLimiter();
    this.standardRetryStrategy = new StandardRetryStrategy(maxAttemptsProvider);
  }

  async acquireInitialRetryToken(retryTokenScope) {
    await this.rateLimiter.getSendToken();
    return this.standardRetryStrategy.acquireInitialRetryToken(retryTokenScope);
  }

  async refreshRetryTokenForRetry(tokenToRenew, errorInfo) {
    this.rateLimiter.updateClientSendingRate(errorInfo);
    return this.standardRetryStrategy.refreshRetryTokenForRetry(tokenToRenew, errorInfo);
  }

  recordSuccess(token) {
    this.rateLimiter.updateClientSendingRate({});
    this.standardRetryStrategy.recordSuccess(token);
  }
}

class ConfiguredRetryStrategy extends StandardRetryStrategy {
  constructor(maxAttempts, computeNextBackoffDelay = DEFAULT_RETRY_DELAY_BASE) {
    super(typeof maxAttempts === "function" ? maxAttempts : async () => maxAttempts);

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
}

// Constants
const DEFAULT_RETRY_DELAY_BASE = 100;
const MAXIMUM_RETRY_DELAY = 20000;
const THROTTLING_RETRY_DELAY_BASE = 500;
const INITIAL_RETRY_TOKENS = 500;
const RETRY_COST = 5;
const TIMEOUT_RETRY_COST = 10;
const NO_RETRY_INCREMENT = 1;
const INVOCATION_ID_HEADER = "amz-sdk-invocation-id";
const REQUEST_HEADER = "amz-sdk-request";

const getDefaultRetryBackoffStrategy = () => {
  let delayBase = DEFAULT_RETRY_DELAY_BASE;

  const computeNextBackoffDelay = (attempts) => {
    return Math.floor(Math.min(MAXIMUM_RETRY_DELAY, Math.random() * 2 ** attempts * delayBase));
  };

  const setDelayBase = (delay) => {
    delayBase = delay;
  };

  return {
    computeNextBackoffDelay,
    setDelayBase
  };
};

const createDefaultRetryToken = ({ retryDelay, retryCount, retryCost }) => {
  const getRetryCount = () => retryCount;
  const getRetryDelay = () => Math.min(MAXIMUM_RETRY_DELAY, retryDelay);
  const getRetryCost = () => retryCost;

  return {
    getRetryCount,
    getRetryDelay,
    getRetryCost
  };
};
