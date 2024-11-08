const { defineProperty, getOwnPropertyDescriptor, getOwnPropertyNames, prototype: { hasOwnProperty } } = Object;

const __name = (target, value) => defineProperty(target, "name", { value, configurable: true });

const __export = (target, all) => {
  Object.keys(all).forEach(name => {
    defineProperty(target, name, { get: all[name], enumerable: true });
  });
};

const __copyProps = (to, from, except) => {
  if (from && (typeof from === "object" || typeof from === "function")) {
    for (let key of getOwnPropertyNames(from)) {
      if (!hasOwnProperty.call(to, key) && key !== except) {
        defineProperty(to, key, { get: () => from[key], enumerable: true });
      }
    }
  }
  return to;
};

const __toCommonJS = mod => __copyProps(defineProperty({}, "__esModule", { value: true }), mod);

// Retry Strategy Exports

const src_exports = {};
__export(src_exports, {
  AdaptiveRetryStrategy: () => AdaptiveRetryStrategy,
  StandardRetryStrategy: () => StandardRetryStrategy,
  ENV_MAX_ATTEMPTS: () => ENV_MAX_ATTEMPTS,
  CONFIG_MAX_ATTEMPTS: () => CONFIG_MAX_ATTEMPTS,
  NODE_MAX_ATTEMPT_CONFIG_OPTIONS: () => NODE_MAX_ATTEMPT_CONFIG_OPTIONS,
  resolveRetryConfig: () => resolveRetryConfig,
  ENV_RETRY_MODE: () => ENV_RETRY_MODE,
  CONFIG_RETRY_MODE: () => CONFIG_RETRY_MODE,
  NODE_RETRY_MODE_CONFIG_OPTIONS: () => NODE_RETRY_MODE_CONFIG_OPTIONS,
  defaultDelayDecider: () => defaultDelayDecider,
  defaultRetryDecider: () => defaultRetryDecider,
  omitRetryHeadersMiddleware: () => omitRetryHeadersMiddleware,
  omitRetryHeadersMiddlewareOptions: () => omitRetryHeadersMiddlewareOptions,
  getOmitRetryHeadersPlugin: () => getOmitRetryHeadersPlugin,
  retryMiddleware: () => retryMiddleware,
  retryMiddlewareOptions: () => retryMiddlewareOptions,
  getRetryPlugin: () => getRetryPlugin,
  getRetryAfterHint: () => getRetryAfterHint
});

module.exports = __toCommonJS(src_exports);

// Adaptive Retry Strategy Implementation
class AdaptiveRetryStrategy extends StandardRetryStrategy {
  constructor(maxAttemptsProvider, options = {}) {
    super(maxAttemptsProvider, options);
    this.rateLimiter = options.rateLimiter || new DefaultRateLimiter();
    this.mode = RETRY_MODES.ADAPTIVE;
  }

  async retry(next, args) {
    return super.retry(next, args, {
      beforeRequest: async () => this.rateLimiter.getSendToken(),
      afterRequest: (response) => this.rateLimiter.updateClientSendingRate(response),
    });
  }
}
__name(AdaptiveRetryStrategy, "AdaptiveRetryStrategy");

// Standard Retry Strategy Implementation
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
    } catch (error) {
      return DEFAULT_MAX_ATTEMPTS;
    }
  }

  async retry(next, args, options) {
    let attempts = 0;
    let totalDelay = 0;
    const maxAttempts = await this.getMaxAttempts();
    const { request } = args;

    if (HttpRequest.isInstance(request)) {
      request.headers[INVOCATION_ID_HEADER] = v4();
    }

    while (true) {
      try {
        if (HttpRequest.isInstance(request)) {
          request.headers[REQUEST_HEADER] = `attempt=${attempts + 1}; max=${maxAttempts}`;
        }

        if (options?.beforeRequest) await options.beforeRequest();

        const { response, output } = await next(args);

        if (options?.afterRequest) options.afterRequest(response);

        this.retryQuota.releaseRetryTokens();

        output.$metadata.attempts = attempts + 1;
        output.$metadata.totalRetryDelay = totalDelay;

        return { response, output };
      } catch (e) {
        const err = e instanceof Error ? e : new Error(e);
        attempts++;

        if (this.shouldRetry(err, attempts, maxAttempts)) {
          const retryTokenAmount = this.retryQuota.retrieveRetryTokens(err);
          const delay = Math.max(this.delayDecider(DEFAULT_RETRY_DELAY_BASE, attempts), getRetryAfterHint(err.$response) || 0);

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
__name(StandardRetryStrategy, "StandardRetryStrategy");

// Configuration and Utilities

const {
  NO_RETRY_INCREMENT,
  DEFAULT_MAX_ATTEMPTS,
  RETRY_COST,
  TIMEOUT_RETRY_COST,
  INITIAL_RETRY_TOKENS,
  INVOCATION_ID_HEADER,
  REQUEST_HEADER,
  DEFAULT_RETRY_DELAY_BASE,
  MAXIMUM_RETRY_DELAY,
  DEFAULT_RETRY_MODE,
  RETRY_MODES
} = require("@smithy/util-retry");

const { v4 } = require("uuid");
const { HttpRequest, HttpResponse } = require("@smithy/protocol-http");

const ENV_MAX_ATTEMPTS = "AWS_MAX_ATTEMPTS";
const CONFIG_MAX_ATTEMPTS = "max_attempts";

const NODE_MAX_ATTEMPT_CONFIG_OPTIONS = {
  environmentVariableSelector: env => parseInt(env[ENV_MAX_ATTEMPTS]) || undefined,
  configFileSelector: profile => parseInt(profile[CONFIG_MAX_ATTEMPTS]) || undefined,
  default: DEFAULT_MAX_ATTEMPTS
};

const resolveRetryConfig = input => {
  const { retryStrategy } = input;
  return {
    ...input,
    maxAttempts: normalizeProvider(input.maxAttempts ?? DEFAULT_MAX_ATTEMPTS),
    retryStrategy: async () => {
      if (retryStrategy) return retryStrategy;

      const retryMode = await normalizeProvider(input.retryMode)();
      if (retryMode === RETRY_MODES.ADAPTIVE) return new AdaptiveRetryStrategy(maxAttempts);
      return new StandardRetryStrategy(maxAttempts);
    }
  };
};
__name(resolveRetryConfig, "resolveRetryConfig");

const ENV_RETRY_MODE = "AWS_RETRY_MODE";
const CONFIG_RETRY_MODE = "retry_mode";

const NODE_RETRY_MODE_CONFIG_OPTIONS = {
  environmentVariableSelector: env => env[ENV_RETRY_MODE],
  configFileSelector: profile => profile[CONFIG_RETRY_MODE],
  default: DEFAULT_RETRY_MODE
};

// Middleware

const omitRetryHeadersMiddleware = () => next => async args => {
  const { request } = args;
  if (HttpRequest.isInstance(request)) {
    delete request.headers[INVOCATION_ID_HEADER];
    delete request.headers[REQUEST_HEADER];
  }
  return next(args);
};
__name(omitRetryHeadersMiddleware, "omitRetryHeadersMiddleware");

const omitRetryHeadersMiddlewareOptions = {
  name: "omitRetryHeadersMiddleware",
  tags: ["RETRY", "HEADERS", "OMIT_RETRY_HEADERS"],
  relation: "before",
  toMiddleware: "awsAuthMiddleware",
  override: true
};

const getOmitRetryHeadersPlugin = options => ({
  applyToStack: clientStack => clientStack.addRelativeTo(omitRetryHeadersMiddleware(), omitRetryHeadersMiddlewareOptions)
});

const defaultDelayDecider = (delayBase, attempts) => Math.floor(Math.min(MAXIMUM_RETRY_DELAY, Math.random() * 2 ** attempts * delayBase));
__name(defaultDelayDecider, "defaultDelayDecider");

const defaultRetryDecider = error => {
  return isRetryableByTrait(error) || isClockSkewError(error) || isThrottlingError(error) || isTransientError(error);
};
__name(defaultRetryDecider, "defaultRetryDecider");

const retryMiddleware = options => (next, context) => async args => {
  let retryStrategy = await options.retryStrategy();
  const maxAttempts = await options.maxAttempts();

  if (isRetryStrategyV2(retryStrategy)) {
    let retryToken = await retryStrategy.acquireInitialRetryToken(context["partition_id"]);
    let lastError = new Error();
    let attempts = 0;
    let totalRetryDelay = 0;
    const { request } = args;

    if (HttpRequest.isInstance(request)) {
      request.headers[INVOCATION_ID_HEADER] = v4();
    }

    while (true) {
      try {
        if (HttpRequest.isInstance(request)) {
          request.headers[REQUEST_HEADER] = `attempt=${attempts + 1}; max=${maxAttempts}`;
        }

        const { response, output } = await next(args);

        retryStrategy.recordSuccess(retryToken);
        output.$metadata.attempts = attempts + 1;
        output.$metadata.totalRetryDelay = totalRetryDelay;

        return { response, output };
      } catch (e) {
        const retryErrorInfo = getRetryErrorInfo(e);
        lastError = new Error(e);

        if (HttpRequest.isInstance(request) && isStreamingPayload(request)) {
          context.logger?.warn("An error was encountered in a non-retryable streaming request.");
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
      context.userAgent = [...(context.userAgent || []), ["cfg/retry-mode", retryStrategy.mode]];
    }
    return retryStrategy.retry(next, args);
  }
};
__name(retryMiddleware, "retryMiddleware");

const retryMiddlewareOptions = {
  name: "retryMiddleware",
  tags: ["RETRY"],
  step: "finalizeRequest",
  priority: "high",
  override: true
};

const getRetryPlugin = options => ({
  applyToStack: clientStack => clientStack.add(retryMiddleware(options), retryMiddlewareOptions)
});

const getRetryAfterHint = response => {
  if (!HttpResponse.isInstance(response)) return;
  const retryAfterHeader = Object.keys(response.headers).find(key => key.toLowerCase() === "retry-after");

  if (!retryAfterHeader) return;
  const retryAfter = Number(response.headers[retryAfterHeader]);
  if (!Number.isNaN(retryAfter)) return new Date(retryAfter * 1000);

  const retryDate = new Date(response.headers[retryAfterHeader]);
  return retryDate;
};
__name(getRetryAfterHint, "getRetryAfterHint");
