class RetryHandler {
    constructor(options) {
        this.maxAttempts = options.maxRetries || 3;
        this.delayDuration = options.retryDelay || 1000;
    }
    
    async execute(request, nextFunction) {
        let attemptCount = 0;
        let error;

        while (attemptCount < this.maxAttempts) {
            try {
                const result = await nextFunction(request);
                return result;
            } catch (err) {
                error = err;

                if (!this.canRetry(error, attemptCount)) {
                    throw error;
                }

                attemptCount++;
                await this.wait(this.delayDuration * attemptCount);
            }
        }

        throw error;
    }

    canRetry(error, attemptCount) {
        return attemptCount < this.maxAttempts && this.isRetryableError(error);
    }

    isRetryableError(error) {
        return error.isNetworkIssue || (error.statusCode >= 500 && error.statusCode < 600);
    }

    async wait(milliseconds) {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
    }
}

async function fetchDataWithRetryRetry(url, options, retryOptions) {
    const retryHandler = new RetryHandler(retryOptions);
    const httpClient = async (req) => {
        throw new Error('Simulated network error');
    };

    const requestConfig = { url, options };
    return retryHandler.execute(requestConfig, httpClient);
}

const retryOptions = {
    maxRetries: 5,
    retryDelay: 2000
};

fetchDataWithRetryRetry('https://example.com/api/data', {}, retryOptions)
    .then(data => {
        console.log('Request successful:', data);
    })
    .catch(err => {
        console.error('Request failed:', err);
    });
