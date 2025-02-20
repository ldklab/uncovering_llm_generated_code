class RetryHandler {
    constructor(settings) {
        this.maxRetryAttempts = settings.maxRetryAttempts || 3;
        this.delayBetweenRetries = settings.delayBetweenRetries || 1000; // default delay of 1 second
    }
    
    async execute(request, performRequest) {
        let currentAttempt = 0;
        let encounteredError;

        while (currentAttempt < this.maxRetryAttempts) {
            try {
                const response = await performRequest(request);
                return response;
            } catch (error) {
                encounteredError = error;

                if (!this.canRetry(error, currentAttempt)) {
                    throw error;
                }

                currentAttempt++;
                await this.wait(this.delayBetweenRetries * currentAttempt);
            }
        }

        throw encounteredError;
    }

    canRetry(error, currentAttempt) {
        return currentAttempt < this.maxRetryAttempts && this.isTemporaryError(error);
    }

    isTemporaryError(error) {
        return error.isNetworkError || (error.statusCode >= 500 && error.statusCode < 600);
    }

    async wait(milliseconds) {
        return new Promise(resolution => setTimeout(resolution, milliseconds));
    }
}

async function makeRequestWithRetries(endpoint, settings, retrySettings) {
    const retryHandler = new RetryHandler(retrySettings);
    const networkRequest = async (endpoint) => {
        // Here we simulate a network request, typically with fetch or axios
        throw new Error('Simulated network error');
    };

    const request = { endpoint, settings };
    return retryHandler.execute(request, networkRequest);
}

const retrySettings = {
    maxRetryAttempts: 5,
    delayBetweenRetries: 2000  // 2 seconds delay between retries
};

makeRequestWithRetries('https://example.com/api/data', {}, retrySettings)
    .then(response => {
        console.log('Successfully fetched data:', response);
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });
