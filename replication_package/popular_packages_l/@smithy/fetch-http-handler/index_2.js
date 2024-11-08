// fetchHttpHandler.js
const fetch = require('node-fetch');

class FetchHttpHandler {
  constructor(config = {}) {
    this.config = config;
  }

  async handle(request) {
    if (!request?.url) {
      throw new Error("Request URL is required");
    }

    const fetchOptions = {
      method: request.method || 'GET',
      headers: request.headers || {},
      body: request.body || undefined,
      ...this.config,
    };

    try {
      const response = await fetch(request.url, fetchOptions);
      const responseBody = await response.text();
      return {
        statusCode: response.status,
        headers: response.headers.raw(),
        body: responseBody,
      };
    } catch (error) {
      throw new Error(`Fetch error: ${error.message}`);
    }
  }
}

module.exports = FetchHttpHandler;

// Example usage
async function main() {
  const handler = new FetchHttpHandler();
  const request = {
    url: 'https://jsonplaceholder.typicode.com/posts/1',
    method: 'GET',
  };

  try {
    const response = await handler.handle(request);
    console.log('Response:', response);
  } catch (error) {
    console.error('Error:', error);
  }
}

if (require.main === module) {
  main();
}
