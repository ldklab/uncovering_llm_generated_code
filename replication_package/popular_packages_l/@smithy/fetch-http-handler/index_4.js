// fetchHttpHandler.js
class FetchHttpHandler {
  constructor(config = {}) {
    this.config = config;
  }

  async handle(request) {
    // Ensure a valid request object with a URL is provided
    if (!request?.url) throw new Error("Request URL is required");

    // Prepare fetch options, applying default method to GET if not specified
    const fetchOptions = {
      method: request.method || 'GET',
      headers: request.headers || {},
      body: request.body || null,
      ...this.config,
    };

    try {
      // Execute the fetch request and capture the response
      const response = await fetch(request.url, fetchOptions);
      const responseBody = await response.text();

      // Return the relevant response details
      return {
        statusCode: response.status,
        headers: response.headers,
        body: responseBody,
      };
    } catch (error) {
      // In case of error, throw a new error with a descriptive message
      throw new Error(`Fetch error: ${error.message}`);
    }
  }
}

// Export the FetchHttpHandler class for external usage
module.exports = FetchHttpHandler;

// Example usage of the FetchHttpHandler
async function main() {
  const handler = new FetchHttpHandler();

  // Define the request object for a GET request
  const request = {
    url: 'https://jsonplaceholder.typicode.com/posts/1',
    method: 'GET'
  };

  try {
    // Attempt to handle the request and log the response upon success
    const response = await handler.handle(request);
    console.log('Response:', response);
  } catch (error) {
    // Log any errors encountered during the request handling
    console.error('Error:', error);
  }
}

// Execute the main function if the module is run directly
if (require.main === module) {
  main();
}
