const { HttpRequest, HttpResponse } = require("@smithy/protocol-http");
const { v4: uuidv4 } = require("uuid");
const { DefaultRateLimiter, RETRY_MODES, INITIAL_RETRY_TOKENS, DEFAULT_MAX_ATTEMPTS, MAXIMUM_RETRY_DELAY, INVOCATION_ID_HEADER, REQUEST_HEADER, NO_RETRY_INCREMENT, RETRY_COST, TIMEOUT_RETRY_COST, CONFIG_MAX_ATTEMPTS, CONFIG_RETRY_MODE } = require("@smithy/util-retry");
const { normalizeProvider } = require("@smithy/util-middleware");
const { isRetryableByTrait, isClockSkewError, isThrottlingError, isTransientError, isServerError } = require("@smithy/service-error-classification");
const { NoOpLogger } = require("@smithy/smithy-client");
const { isStreamingPayload } = require("./isStreamingPayload/isStreamingPayload");

const ENV_MAX_ATTEMPTS = "AWS_MAX_ATTEMPTS";
const ENV_RETRY_MODE = "AWS_RETRY_MODE";

function exportModule(moduleExports) {
  module.exports = moduleExports;
}

function defineProperty(obj, prop, value) {
  Object.defineProperty(obj, prop, { value, configurable: true, enumerable: true });
}

function setModuleProperty(obj, properties) {
  for (let prop in properties) {
    defineProperty(obj, prop, { get: properties[prop], enumerable: true });
  }
}

function asSdkError(error) {
  if (error instanceof Error) return error;
  if (error instanceof Object) return Object.assign(new Error(), error);
  if (typeof error === "string") return new Error(error);
  return new Error(`AWS SDK error wrapper for ${error}`);
}

function getDefaultRetryQuota(initialRetryTokens, options = {}) {
  const MAX_CAPACITY = initialRetryTokens;
  const noRetryIncrement = options.noRetryIncrement || NO_RETRY_INCREMENT;
  const retryCost = options.retryCost || RETRY_COST;
  const timeoutRetryCost = options.timeoutRetryCost || TIMEOUT_RETRY_COST;
  let availableCapacity = initialRetryTokens;

  function getCapacityAmount(error) {
    return error.name === "TimeoutError" ? timeoutRetryCost : retryCost;
  }

  function hasRetryTokens(error) {
    return getCapacityAmount(error) <= availableCapacity;
  }

  function retrieveRetryTokens(error) {
    if (!hasRetryTokens(error)) throw new Error("No retry token available");
    const capacityAmount = getCapacityAmount(error);
    availableCapacity -= capacityAmount;
    return capacityAmount;
  }

  function releaseRetryTokens(capacityReleaseAmount) {
    availableCapacity += capacityReleaseAmount || noRetryIncrement;
    availableCapacity = Math.min(availableCapacity, MAX_CAPACITY);
  }

  return Object.freeze({ hasRetryTokens, retrieveRetryTokens, releaseRetryTokens });
}

function defaultDelayDecider(delayBase, attempts) {
  return Math.floor(Math.min(MAXIMUM_RETRY_DELAY, Math.random() * Math.pow(2, attempts) * delayBase));
}

function defaultRetryDecider(error) {
  if (!error) return false;
  return isRetryableByTrait(error) || isClockSkewError(error) || isThrottlingError(error) || isTransientError(error);
}

function getDelayFromRetryAfterHeader(response) {
  if (!HttpResponse.isInstance(response)) return;
  const retryAfterHeaderName = Object.keys(response.headers).find((key) => key.toLowerCase() === "retry-after");
  if (!retryAfterHeaderName) return;
  const retryAfter = response.headers[retryAfterHeaderName];
  const retryAfterSeconds = Number(retryAfter);
  return !Number.isNaN(retryAfterSeconds) ? retryAfterSeconds * 1000 : (new Date(retryAfter).getTime() - Date.now());
}

class StandardRetryStrategy {
  constructor(maxAttemptsProvider, options = {}) {
    this.maxAttemptsProvider = maxAttemptsProvider;
    this.mode = RETRY_MODES.STANDARD;
    this.retryDecider = options.retryDecider || defaultRetryDecider;
    this.delayDecider = options.delayDecider || defaultDelayDecider;
    this.retryQuota = options.retryQuota || getDefaultRetryQuota(INITIAL_RETRY_TOKENS);
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

  async retry(next, args, options) {
    let retryTokenAmount;
    let attempts = 0;
    let totalDelay = 0;
    const maxAttempts = await this.getMaxAttempts();
    const { request } = args;

    if (HttpRequest.isInstance(request)) {
      request.headers[INVOCATION_ID_HEADER] = uuidv4();
    }

    while (true) {
      try {
        if (HttpRequest.isInstance(request)) {
          request.headers[REQUEST_HEADER] = `attempt=${attempts + 1}; max=${maxAttempts}`;
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
            isThrottlingError(err) ? 500 : 100,
            attempts
          );
          const delayFromResponse = getDelayFromRetryAfterHeader(err.$response);
          const delay = Math.max(delayFromResponse || 0, delayFromDecider);
          totalDelay += delay;
          await new Promise((resolve) => setTimeout(resolve, delay));
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

class AdaptiveRetryStrategy extends StandardRetryStrategy {
  constructor(maxAttemptsProvider, options = {}) {
    const { rateLimiter, ...superOptions } = options;
    super(maxAttemptsProvider, superOptions);
    this.rateLimiter = rateLimiter || new DefaultRateLimiter();
    this.mode = RETRY_MODES.ADAPTIVE;
  }

  async retry(next, args) {
    return super.retry(next, args, {
      beforeRequest: async () => this.rateLimiter.getSendToken(),
      afterRequest: (response) => this.rateLimiter.updateClientSendingRate(response)
    });
  }
}

const NODE_MAX_ATTEMPT_CONFIG_OPTIONS = {
  environmentVariableSelector: (env) => {
    const value = env[ENV_MAX_ATTEMPTS];
    if (!value) return undefined;
    const maxAttempt = parseInt(value, 10);
    if (Number.isNaN(maxAttempt)) {
      throw new Error(`Environment variable ${ENV_MAX_ATTEMPTS} must be a number, got "${value}"`);
    }
    return maxAttempt;
  },
  configFileSelector: (profile) => {
    const value = profile[CONFIG_MAX_ATTEMPTS];
    if (!value) return undefined;
    const maxAttempt = parseInt(value, 10);
    if (Number.isNaN(maxAttempt)) {
      throw new Error(`Shared config file entry ${CONFIG_MAX_ATTEMPTS} must be a number, got "${value}"`);
    }
    return maxAttempt;
  },
  default: DEFAULT_MAX_ATTEMPTS
};

function resolveRetryConfig(input) {
  const { retryStrategy } = input;
  const maxAttempts = normalizeProvider(input.maxAttempts || DEFAULT_MAX_ATTEMPTS);

  return {
    ...input,
    maxAttempts,
    retryStrategy: async () => {
      if (retryStrategy) {
        return retryStrategy;
      }
      const retryMode = await normalizeProvider(input.retryMode)();
      if (retryMode === RETRY_MODES.ADAPTIVE) {
        return new AdaptiveRetryStrategy(maxAttempts);
      }
      return new StandardRetryStrategy(maxAttempts);
    }
  };
}

function omitRetryHeadersMiddleware() {
  return (next) => async (args) => {
    const { request } = args;
    if (HttpRequest.isInstance(request)) {
      delete request.headers[INVOCATION_ID_HEADER];
      delete request.headers[REQUEST_HEADER];
    }
    return next(args);
  };
}

const omitRetryHeadersMiddlewareOptions = {
  name: "omitRetryHeadersMiddleware",
  tags: ["RETRY", "HEADERS", "OMIT_RETRY_HEADERS"],
  relation: "before",
  toMiddleware: "awsAuthMiddleware",
  override: true
};

function getOmitRetryHeadersPlugin(options) {
  return {
    applyToStack: (clientStack) => {
      clientStack.addRelativeTo(omitRetryHeadersMiddleware(), omitRetryHeadersMiddlewareOptions);
    }
  };
}

function retryMiddleware(options) {
  return (next, context) => async (args) => {
    let retryStrategy = await options.retryStrategy();
    const maxAttempts = await options.maxAttempts();
    if (isRetryStrategyV2(retryStrategy)) {
      let retryToken = await retryStrategy.acquireInitialRetryToken(context["partition_id"]);
      let lastError = new Error();
      let attempts = 0;
      let totalRetryDelay = 0;
      const { request } = args;
      const isRequest = HttpRequest.isInstance(request);

      if (isRequest) {
        request.headers[INVOCATION_ID_HEADER] = uuidv4();
      }

      while (true) {
        try {
          if (isRequest) {
            request.headers[REQUEST_HEADER] = `attempt=${attempts + 1}; max=${maxAttempts}`;
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
            (context.logger instanceof NoOpLogger ? console : context.logger)?.warn(
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
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    } else {
      if (retryStrategy?.mode) {
        context.userAgent = [...context.userAgent || [], ["cfg/retry-mode", retryStrategy.mode]];
      }
      return retryStrategy.retry(next, args);
    }
  };
}

const retryMiddlewareOptions = {
  name: "retryMiddleware",
  tags: ["RETRY"],
  step: "finalizeRequest",
  priority: "high",
  override: true
};

function getRetryPlugin(options) {
  return {
    applyToStack: (clientStack) => {
      clientStack.add(retryMiddleware(options), retryMiddlewareOptions);
    }
  };
}

function getRetryErrorInfo(error) {
  const errorInfo = {
    error,
    errorType: getRetryErrorType(error)
  };
  const retryAfterHint = getRetryAfterHint(error.$response);
  if (retryAfterHint) {
    errorInfo.retryAfterHint = retryAfterHint;
  }
  return errorInfo;
}

function getRetryErrorType(error) {
  if (isThrottlingError(error)) return "THROTTLING";
  if (isTransientError(error)) return "TRANSIENT";
  if (isServerError(error)) return "SERVER_ERROR";
  return "CLIENT_ERROR";
}

function getRetryAfterHint(response) {
  if (!HttpResponse.isInstance(response)) return;
  const retryAfterHeaderName = Object.keys(response.headers).find((key) => key.toLowerCase() === "retry-after");
  if (!retryAfterHeaderName) return;
  const retryAfter = response.headers[retryAfterHeaderName];
  const retryAfterSeconds = Number(retryAfter);
  return !Number.isNaN(retryAfterSeconds) ? new Date(retryAfterSeconds * 1000) : new Date(retryAfter);
}

const NODE_RETRY_MODE_CONFIG_OPTIONS = {
  environmentVariableSelector: (env) => env[ENV_RETRY_MODE],
  configFileSelector: (profile) => profile[CONFIG_RETRY_MODE],
  default: "standard"
};

exportModule({
  AdaptiveRetryStrategy,
  StandardRetryStrategy,
  ENV_MAX_ATTEMPTS,
  CONFIG_MAX_ATTEMPTS,
  NODE_MAX_ATTEMPT_CONFIG_OPTIONS,
  resolveRetryConfig,
  ENV_RETRY_MODE,
  CONFIG_RETRY_MODE,
  NODE_RETRY_MODE_CONFIG_OPTIONS,
  defaultDelayDecider,
  omitRetryHeadersMiddleware,
  omitRetryHeadersMiddlewareOptions,
  getOmitRetryHeadersPlugin,
  defaultRetryDecider,
  retryMiddleware,
  retryMiddlewareOptions,
  getRetryPlugin,
  getRetryAfterHint
});
