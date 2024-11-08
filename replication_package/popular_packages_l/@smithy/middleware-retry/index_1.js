class RetryMiddleware {
    constructor(config) {
        this.maxRetries = config.maxRetries || 3;
        this.retryDelay = config.retryDelay || 1000; // Default delay of 1 second
    }
    
    async handle(request, next) {
        let attempts = 0;
        let lastError;

        while (attempts < this.maxRetries) {
            try {
                const response = await next(request);
                return response;
            } catch (error) {
                lastError = error;

                if (!this.shouldRetry(error, attempts)) {
                    throw error;
                }

                attempts++;
                await this.delay(this.retryDelay * attempts);
            }
        }

        throw lastError;
    }

    shouldRetry(error, attempts) {
        return attempts < this.maxRetries && this.isTransientError(error);
    }

    isTransientError(error) {
        return error.isNetworkError || (error.statusCode >= 500 && error.statusCode < 600);
    }

    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

async function fetchDataWithRetry(url, options, retryConfig) {
    const retryMiddleware = new RetryMiddleware(retryConfig);
    const client = async (request) => {
        throw new Error('Simulated network error');
    };

    try {
        return await retryMiddleware.handle({ url, options }, client);
    } catch (error) {
        throw new Error('Failed after retries:', { cause: error });
    }
}

const retryConfig = {
    maxRetries: 5,
    retryDelay: 2000 // 2 seconds between retries
};

fetchDataWithRetry('https://example.com/api/data', {}, retryConfig)
    .then(response => console.log('Data fetched successfully:', response))
    .catch(error => console.error('Failed to fetch data:', error));
