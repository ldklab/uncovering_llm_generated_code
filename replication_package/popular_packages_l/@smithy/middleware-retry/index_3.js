class RetryMiddleware {
    constructor({ maxRetries = 3, retryDelay = 1000 } = {}) {
        this.maxRetries = maxRetries;
        this.retryDelay = retryDelay;
    }
    
    async handle(request, executeRequest) {
        let attempts = 0;
        let lastError;

        while (attempts < this.maxRetries) {
            try {
                const response = await executeRequest(request);
                return response;
            } catch (error) {
                lastError = error;

                if (!this.shouldRetry(error, attempts)) {
                    throw error;
                }

                attempts++;
                await this.delay(attempts * this.retryDelay);
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

// Usage with an HTTP client
async function fetchDataWithRetry(url, options, retryConfig) {
    const retryMiddleware = new RetryMiddleware(retryConfig);
    const client = async (request) => {
        // Simulated HTTP request logic
        throw new Error('Simulated network error');
    };

    const request = { url, options };
    return retryMiddleware.handle(request, client);
}

// Example usage
const retryConfig = {
    maxRetries: 5,
    retryDelay: 2000
};

fetchDataWithRetry('https://example.com/api/data', {}, retryConfig)
    .then(response => {
        console.log('Data fetched successfully:', response);
    })
    .catch(error => {
        console.error('Failed to fetch data:', error);
    });
