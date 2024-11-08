const { defineProperty, getOwnPropertyDescriptor, getOwnPropertyNames } = Object;
const { hasOwnProperty } = Object.prototype;

const defineFunctionName = (func, name) => defineProperty(func, "name", { value: name, configurable: true });

const exportModule = (target, all) => {
  for (const name in all) {
    defineProperty(target, name, {
      get: all[name],
      enumerable: true
    });
  }
};

const copyProps = (to, from, except, desc) => {
  if (from && (typeof from === 'object' || typeof from === 'function')) {
    for (const key of getOwnPropertyNames(from)) {
      if (!hasOwnProperty.call(to, key) && key !== except) {
        defineProperty(to, key, {
          get: () => from[key],
          enumerable: !(desc = getOwnPropertyDescriptor(from, key)) || desc.enumerable
        });
      }
    }
  }
  return to;
};

const toCommonJS = (mod) => copyProps(defineProperty({}, '__esModule', { value: true }), mod);

// src/index.ts
const src_exports = {};
exportModule(src_exports, {
  AdaptiveRetryStrategy: () => AdaptiveRetryStrategy,
  CONFIG_MAX_ATTEMPTS: () => CONFIG_MAX_ATTEMPTS,
  CONFIG_RETRY_MODE: () => CONFIG_RETRY_MODE,
  ENV_MAX_ATTEMPTS: () => ENV_MAX_ATTEMPTS,
  ENV_RETRY_MODE: () => ENV_RETRY_MODE,
  NODE_MAX_ATTEMPT_CONFIG_OPTIONS: () => NODE_MAX_ATTEMPT_CONFIG_OPTIONS,
  NODE_RETRY_MODE_CONFIG_OPTIONS: () => NODE_RETRY_MODE_CONFIG_OPTIONS,
  StandardRetryStrategy: () => StandardRetryStrategy,
  defaultDelayDecider: () => defaultDelayDecider,
  defaultRetryDecider: () => defaultRetryDecider,
  getOmitRetryHeadersPlugin: () => getOmitRetryHeadersPlugin,
  getRetryAfterHint: () => getRetryAfterHint,
  getRetryPlugin: () => getRetryPlugin,
  omitRetryHeadersMiddleware: () => omitRetryHeadersMiddleware,
  omitRetryHeadersMiddlewareOptions: () => omitRetryHeadersMiddlewareOptions,
  resolveRetryConfig: () => resolveRetryConfig,
  retryMiddleware: () => retryMiddleware,
  retryMiddlewareOptions: () => retryMiddlewareOptions
});
module.exports = toCommonJS(src_exports);

// Import dependencies and implement functions

const getDefaultRetryQuota = (initialRetryTokens, options) => {
  const MAX_CAPACITY = initialRetryTokens;
  const noRetryIncrement = options?.noRetryIncrement ?? utilRetry.NO_RETRY_INCREMENT;
  const retryCost = options?.retryCost ?? utilRetry.RETRY_COST;
  const timeoutRetryCost = options?.timeoutRetryCost ?? utilRetry.TIMEOUT_RETRY_COST;
  let availableCapacity = initialRetryTokens;

  const getCapacityAmount = (error) => error.name === "TimeoutError" ? timeoutRetryCost : retryCost;
  
  const hasRetryTokens = (error) => getCapacityAmount(error) <= availableCapacity;
  
  const retrieveRetryTokens = (error) => {
    if (!hasRetryTokens(error)) {
      throw new Error("No retry token available");
    }
    const capacityAmount = getCapacityAmount(error);
    availableCapacity -= capacityAmount;
    return capacityAmount;
  };
  
  const releaseRetryTokens = (capacityReleaseAmount) => {
    availableCapacity += capacityReleaseAmount ?? noRetryIncrement;
    availableCapacity = Math.min(availableCapacity, MAX_CAPACITY);
  };

  return Object.freeze({
    hasRetryTokens,
    retrieveRetryTokens,
    releaseRetryTokens
  });
};

const defaultDelayDecider = (delayBase, attempts) => Math.floor(Math.min(utilRetry.MAXIMUM_RETRY_DELAY, Math.random() * 2 ** attempts * delayBase));

const defaultRetryDecider = (error) => {
  if (!error) return false;
  return serviceErrorClassification.isRetryableByTrait(error) ||
    serviceErrorClassification.isClockSkewError(error) ||
    serviceErrorClassification.isThrottlingError(error) ||
    serviceErrorClassification.isTransientError(error);
};

const asSdkError = (error) => {
  if (error instanceof Error) return error;
  if (error instanceof Object) return Object.assign(new Error(), error);
  if (typeof error === 'string') return new Error(error);
  return new Error(`AWS SDK error wrapper for ${error}`);
};

class StandardRetryStrategy {
  constructor(maxAttemptsProvider, options) {
    this.maxAttemptsProvider = maxAttemptsProvider;
    this.mode = utilRetry.RETRY_MODES.STANDARD;
    this.retryDecider = options?.retryDecider ?? defaultRetryDecider;
    this.delayDecider = options?.delayDecider ?? defaultDelayDecider;
    this.retryQuota = options?.retryQuota ?? getDefaultRetryQuota(utilRetry.INITIAL_RETRY_TOKENS);
  }

  shouldRetry(error, attempts, maxAttempts) {
    return attempts < maxAttempts && this.retryDecider(error) && this.retryQuota.hasRetryTokens(error);
  }

  async getMaxAttempts() {
    let maxAttempts;
    try {
      maxAttempts = await this.maxAttemptsProvider();
    } catch (error) {
      maxAttempts = utilRetry.DEFAULT_MAX_ATTEMPTS;
    }
    return maxAttempts;
  }

  async retry(next, args, options) {
    let retryTokenAmount;
    let attempts = 0;
    let totalDelay = 0;
    const maxAttempts = await this.getMaxAttempts();
    const { request } = args;
    if (protocolHttp.HttpRequest.isInstance(request)) {
      request.headers[utilRetry.INVOCATION_ID_HEADER] = uuid.v4();
    }
    while (true) {
      try {
        if (protocolHttp.HttpRequest.isInstance(request)) {
          request.headers[utilRetry.REQUEST_HEADER] = `attempt=${attempts + 1}; max=${maxAttempts}`;
        }
        if (options?.beforeRequest) {
          await options.beforeRequest();
        }
        const { response, output } = await next(args);
        if (options?.afterRequest) {
          options.afterRequest(response);
        }
        this.retryQuota.releaseRetryTokens(retryTokenAmount);
        output.$metadata.attempts = attempts + 1;
        output.$metadata.totalRetryDelay = totalDelay;
        return { response, output };
      } catch (e) {
        const err = asSdkError(e);
        attempts++;
        if (this.shouldRetry(err, attempts, maxAttempts)) {
          retryTokenAmount = this.retryQuota.retrieveRetryTokens(err);
          const delayFromDecider = this.delayDecider(
            serviceErrorClassification.isThrottlingError(err) ? utilRetry.THROTTLING_RETRY_DELAY_BASE : utilRetry.DEFAULT_RETRY_DELAY_BASE,
            attempts
          );
          const delayFromResponse = getDelayFromRetryAfterHeader(err.$response);
          const delay = Math.max(delayFromResponse || 0, delayFromDecider);
          totalDelay += delay;
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        if (!err.$metadata) {
          err.$metadata = {};
        }
        err.$metadata.attempts = attempts;
        err.$metadata.totalRetryDelay = totalDelay;
        throw err;
      }
    }
  }
}

const getDelayFromRetryAfterHeader = (response) => {
  if (!protocolHttp.HttpResponse.isInstance(response)) return;
  const retryAfterHeaderName = Object.keys(response.headers).find(key => key.toLowerCase() === "retry-after");
  if (!retryAfterHeaderName) return;
  const retryAfter = response.headers[retryAfterHeaderName];
  const retryAfterSeconds = Number(retryAfter);
  if (!Number.isNaN(retryAfterSeconds)) return retryAfterSeconds * 1000;
  const retryAfterDate = new Date(retryAfter);
  return retryAfterDate.getTime() - Date.now();
};

class AdaptiveRetryStrategy extends StandardRetryStrategy {
  constructor(maxAttemptsProvider, options = {}) {
    const { rateLimiter, ...superOptions } = options;
    super(maxAttemptsProvider, superOptions);
    this.rateLimiter = rateLimiter ?? new utilRetry.DefaultRateLimiter();
    this.mode = utilRetry.RETRY_MODES.ADAPTIVE;
  }

  async retry(next, args) {
    return super.retry(next, args, {
      beforeRequest: async () => {
        return this.rateLimiter.getSendToken();
      },
      afterRequest: response => {
        this.rateLimiter.updateClientSendingRate(response);
      }
    });
  }
}

// Configuration options

const ENV_MAX_ATTEMPTS = 'AWS_MAX_ATTEMPTS';
const CONFIG_MAX_ATTEMPTS = 'max_attempts';
const NODE_MAX_ATTEMPT_CONFIG_OPTIONS = {
  environmentVariableSelector: env => {
    const value = env[ENV_MAX_ATTEMPTS];
    if (value === undefined) return;
    const maxAttempt = parseInt(value);
    if (Number.isNaN(maxAttempt)) {
      throw new Error(`Environment variable ${ENV_MAX_ATTEMPTS} must be a number, got "${value}"`);
    }
    return maxAttempt;
  },
  configFileSelector: profile => {
    const value = profile[CONFIG_MAX_ATTEMPTS];
    if (value === undefined) return;
    const maxAttempt = parseInt(value);
    if (Number.isNaN(maxAttempt)) {
      throw new Error(`Shared config file entry ${CONFIG_MAX_ATTEMPTS} must be a number, got "${value}"`);
    }
    return maxAttempt;
  },
  default: utilRetry.DEFAULT_MAX_ATTEMPTS
};

const resolveRetryConfig = input => {
  const { retryStrategy } = input;
  const maxAttempts = utilMiddleware.normalizeProvider(input.maxAttempts ?? utilRetry.DEFAULT_MAX_ATTEMPTS);

  return {
    ...input,
    maxAttempts,
    retryStrategy: async () => {
      if (retryStrategy) {
        return retryStrategy;
      }
      const retryMode = await utilMiddleware.normalizeProvider(input.retryMode)();
      return retryMode === utilRetry.RETRY_MODES.ADAPTIVE ?
        new utilRetry.AdaptiveRetryStrategy(maxAttempts) :
        new utilRetry.StandardRetryStrategy(maxAttempts);
    }
  };
};

const ENV_RETRY_MODE = 'AWS_RETRY_MODE';
const CONFIG_RETRY_MODE = 'retry_mode';
const NODE_RETRY_MODE_CONFIG_OPTIONS = {
  environmentVariableSelector: env => env[ENV_RETRY_MODE],
  configFileSelector: profile => profile[CONFIG_RETRY_MODE],
  default: utilRetry.DEFAULT_RETRY_MODE
};

// Middleware

const omitRetryHeadersMiddleware = () => next => async args => {
  const { request } = args;
  if (protocolHttp.HttpRequest.isInstance(request)) {
    delete request.headers[utilRetry.INVOCATION_ID_HEADER];
    delete request.headers[utilRetry.REQUEST_HEADER];
  }
  return next(args);
};

const omitRetryHeadersMiddlewareOptions = {
  name: "omitRetryHeadersMiddleware",
  tags: ["RETRY", "HEADERS", "OMIT_RETRY_HEADERS"],
  relation: "before",
  toMiddleware: "awsAuthMiddleware",
  override: true
};

const getOmitRetryHeadersPlugin = options => ({
  applyToStack: clientStack => {
    clientStack.addRelativeTo(omitRetryHeadersMiddleware(), omitRetryHeadersMiddlewareOptions);
  }
});

const retryMiddleware = options => (next, context) => async args => {
  let retryStrategy = await options.retryStrategy();
  const maxAttempts = await options.maxAttempts();
  if (isRetryStrategyV2(retryStrategy)) {
    let retryToken = await retryStrategy.acquireInitialRetryToken(context["partition_id"]);
    let lastError = new Error();
    let attempts = 0;
    let totalRetryDelay = 0;
    const { request } = args;
    const isRequest = protocolHttp.HttpRequest.isInstance(request);
    if (isRequest) {
      request.headers[utilRetry.INVOCATION_ID_HEADER] = uuid.v4();
    }
    while (true) {
      try {
        if (isRequest) {
          request.headers[utilRetry.REQUEST_HEADER] = `attempt=${attempts + 1}; max=${maxAttempts}`;
        }
        const { response, output } = await next(args);
        retryStrategy.recordSuccess(retryToken);
        output.$metadata.attempts = attempts + 1;
        output.$metadata.totalRetryDelay = totalRetryDelay;
        return { response, output };
      } catch (e) {
        const retryErrorInfo = getRetryErrorInfo(e);
        lastError = asSdkError(e);
        if (isRequest && isStreamingPayload(request)) {
          (context.logger instanceof smithyClient.NoOpLogger ? console : context.logger)?.warn(
            "An error was encountered in a non-retryable streaming request."
          );
          throw lastError;
        }
        try {
          retryToken = await retryStrategy.refreshRetryTokenForRetry(retryToken, retryErrorInfo);
        } catch (refreshError) {
          if (!lastError.$metadata) {
            lastError.$metadata = {};
          }
          lastError.$metadata.attempts = attempts + 1;
          lastError.$metadata.totalRetryDelay = totalRetryDelay;
          throw lastError;
        }
        attempts = retryToken.getRetryCount();
        const delay = retryToken.getRetryDelay();
        totalRetryDelay += delay;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  } else {
    if (retryStrategy?.mode) {
      context.userAgent = [...context.userAgent || [], ["cfg/retry-mode", retryStrategy.mode]];
    }
    return retryStrategy.retry(next, args);
  }
};

const isRetryStrategyV2 = retryStrategy => {
  return typeof retryStrategy.acquireInitialRetryToken !== "undefined" &&
    typeof retryStrategy.refreshRetryTokenForRetry !== "undefined" &&
    typeof retryStrategy.recordSuccess !== "undefined";
};

const getRetryErrorInfo = error => {
  const errorInfo = {
    error,
    errorType: getRetryErrorType(error)
  };
  const retryAfterHint = getRetryAfterHint(error.$response);
  if (retryAfterHint) {
    errorInfo.retryAfterHint = retryAfterHint;
  }
  return errorInfo;
};

const getRetryErrorType = error => {
  if (serviceErrorClassification.isThrottlingError(error)) return "THROTTLING";
  if (serviceErrorClassification.isTransientError(error)) return "TRANSIENT";
  if (serviceErrorClassification.isServerError(error)) return "SERVER_ERROR";
  return "CLIENT_ERROR";
};

const retryMiddlewareOptions = {
  name: "retryMiddleware",
  tags: ["RETRY"],
  step: "finalizeRequest",
  priority: "high",
  override: true
};

const getRetryPlugin = options => ({
  applyToStack: clientStack => {
    clientStack.add(retryMiddleware(options), retryMiddlewareOptions);
  }
});

const getRetryAfterHint = response => {
  if (!protocolHttp.HttpResponse.isInstance(response)) return;
  const retryAfterHeaderName = Object.keys(response.headers).find(key => key.toLowerCase() === "retry-after");
  if (!retryAfterHeaderName) return;
  const retryAfter = response.headers[retryAfterHeaderName];
  const retryAfterSeconds = Number(retryAfter);
  if (!Number.isNaN(retryAfterSeconds)) return new Date(retryAfterSeconds * 1000);
  const retryAfterDate = new Date(retryAfter);
  return retryAfterDate;
};
