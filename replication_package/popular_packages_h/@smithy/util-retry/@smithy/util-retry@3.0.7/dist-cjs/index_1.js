// Utilities for property definitions and copying
var defineProperty = Object.defineProperty;
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
var getOwnPropertyNames = Object.getOwnPropertyNames;
var hasOwnProperty = Object.prototype.hasOwnProperty;

// Function naming utility
var setName = (target, name) => defineProperty(target, "name", { value: name, configurable: true });

// Export utility
var exportAll = (target, sources) => {
  for (var name in sources)
    defineProperty(target, name, { get: sources[name], enumerable: true });
};

// Copying properties utility
var copyProperties = (to, from, except, descriptor) => {
  if (from && (typeof from === "object" || typeof from === "function")) {
    for (let key of getOwnPropertyNames(from)) {
      if (!hasOwnProperty.call(to, key) && key !== except)
        defineProperty(to, key, { get: () => from[key], enumerable: !(descriptor = getOwnPropertyDescriptor(from, key)) || descriptor.enumerable });
    }
  }
  return to;
};

// Exporting as CommonJS
var toCommonJS = (module) => copyProperties(defineProperty({}, "__esModule", { value: true }), module);

var src_exports = {};
exportAll(src_exports, {
  AdaptiveRetryStrategy: () => AdaptiveRetryStrategy,
  ConfiguredRetryStrategy: () => ConfiguredRetryStrategy,
  DEFAULT_MAX_ATTEMPTS: () => DEFAULT_MAX_ATTEMPTS,
  DEFAULT_RETRY_DELAY_BASE: () => DEFAULT_RETRY_DELAY_BASE,
  DEFAULT_RETRY_MODE: () => DEFAULT_RETRY_MODE,
  DefaultRateLimiter: () => DefaultRateLimiter,
  INITIAL_RETRY_TOKENS: () => INITIAL_RETRY_TOKENS,
  INVOCATION_ID_HEADER: () => INVOCATION_ID_HEADER,
  MAXIMUM_RETRY_DELAY: () => MAXIMUM_RETRY_DELAY,
  NO_RETRY_INCREMENT: () => NO_RETRY_INCREMENT,
  REQUEST_HEADER: () => REQUEST_HEADER,
  RETRY_COST: () => RETRY_COST,
  RETRY_MODES: () => RETRY_MODES,
  StandardRetryStrategy: () => StandardRetryStrategy,
  THROTTLING_RETRY_DELAY_BASE: () => THROTTLING_RETRY_DELAY_BASE,
  TIMEOUT_RETRY_COST: () => TIMEOUT_RETRY_COST
});
module.exports = toCommonJS(src_exports);

// Retry modes definition
var RETRY_MODES = ((RETRY_MODES2) => {
  RETRY_MODES2["STANDARD"] = "standard";
  RETRY_MODES2["ADAPTIVE"] = "adaptive";
  return RETRY_MODES2;
})(RETRY_MODES || {});

var DEFAULT_MAX_ATTEMPTS = 3;
var DEFAULT_RETRY_MODE = "standard";

// DefaultRateLimiter Class
var DefaultRateLimiter = class {
  constructor(options) {
    this.currentCapacity = 0;
    this.enabled = false;
    this.lastMaxRate = 0;
    this.measuredTxRate = 0;
    this.requestCount = 0;
    this.lastTimestamp = 0;
    this.timeWindow = 0;
    this.beta = (options?.beta) ?? 0.7;
    this.minCapacity = (options?.minCapacity) ?? 1;
    this.minFillRate = (options?.minFillRate) ?? 0.5;
    this.scaleConstant = (options?.scaleConstant) ?? 0.4;
    this.smooth = (options?.smooth) ?? 0.8;
    this.lastThrottleTime = this.getCurrentTimeInSeconds();
    this.lastTxRateBucket = Math.floor(this.getCurrentTimeInSeconds());
    this.fillRate = this.minFillRate;
    this.maxCapacity = this.minCapacity;
  }

  // Returns the current time in seconds
  getCurrentTimeInSeconds() {
    return Date.now() / 1000;
  }

  // Get a token for sending requests
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
    if (response.isThrottlingError()) {
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
    // calculate time window logic
  }

  cubicThrottle(rateToUse) {
    return rateToUse * this.beta;
  }

  cubicSuccess(timestamp) {
    return this.scaleConstant * Math.pow(timestamp - this.lastThrottleTime - this.timeWindow, 3) + this.lastMaxRate;
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
      this.measuredTxRate = currentRate * this.smooth + this.measuredTxRate * (1 - this.smooth);
      this.requestCount = 0;
      this.lastTxRateBucket = timeBucket;
    }
  }
};

// Constants definition
var DEFAULT_RETRY_DELAY_BASE = 100;
var MAXIMUM_RETRY_DELAY = 20000;
var THROTTLING_RETRY_DELAY_BASE = 500;
var INITIAL_RETRY_TOKENS = 500;
var RETRY_COST = 5;
var TIMEOUT_RETRY_COST = 10;
var NO_RETRY_INCREMENT = 1;
var INVOCATION_ID_HEADER = "amz-sdk-invocation-id";
var REQUEST_HEADER = "amz-sdk-request";

// Backoff strategy
var getDefaultRetryBackoffStrategy = () => {
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

// Default retry token creation
var createDefaultRetryToken = ({ retryDelay, retryCount, retryCost }) => {
  const getRetryCount = () => retryCount;
  const getRetryDelay = () => Math.min(MAXIMUM_RETRY_DELAY, retryDelay);
  const getRetryCost = () => retryCost;
  return {
    getRetryCount,
    getRetryDelay,
    getRetryCost
  };
};

// StandardRetryStrategy Class
var StandardRetryStrategy = class {
  constructor(maxAttempts) {
    this.maxAttempts = maxAttempts;
    this.mode = "standard";
    this.capacity = INITIAL_RETRY_TOKENS;
    this.retryBackoffStrategy = getDefaultRetryBackoffStrategy();
    this.maxAttemptsProvider = typeof maxAttempts === "function" ? maxAttempts : async () => maxAttempts;
  }

  async acquireInitialRetryToken(retryTokenScope) {
    return createDefaultRetryToken({
      retryDelay: DEFAULT_RETRY_DELAY_BASE,
      retryCount: 0
    });
  }

  async refreshRetryTokenForRetry(token, errorInfo) {
    const maxAttempts = await this.getMaxAttempts();
    if (this.shouldRetry(token, errorInfo, maxAttempts)) {
      const errorType = errorInfo.errorType;
      this.retryBackoffStrategy.setDelayBase(
        errorType === "THROTTLING" ? THROTTLING_RETRY_DELAY_BASE : DEFAULT_RETRY_DELAY_BASE
      );
      const delayFromErrorType = this.retryBackoffStrategy.computeNextBackoffDelay(token.getRetryCount());
      const retryDelay = errorInfo.retryAfterHint ? Math.max(errorInfo.retryAfterHint.getTime() - Date.now() || 0, delayFromErrorType) : delayFromErrorType;
      const capacityCost = this.getCapacityCost(errorType);
      this.capacity -= capacityCost;
      return createDefaultRetryToken({
        retryDelay,
        retryCount: token.getRetryCount() + 1,
        retryCost: capacityCost
      });
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
};

// AdaptiveRetryStrategy Class
var AdaptiveRetryStrategy = class {
  constructor(maxAttemptsProvider, options) {
    this.maxAttemptsProvider = maxAttemptsProvider;
    this.mode = "adaptive";
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
};

// ConfiguredRetryStrategy Class
var ConfiguredRetryStrategy = class extends StandardRetryStrategy {
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
};
