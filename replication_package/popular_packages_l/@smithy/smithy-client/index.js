// smithy-client.js

class SmithyClient {
  constructor(config) {
    this.config = config || {};
    this.baseUrl = this.config.baseUrl || '';
  }

  async makeRequest(endpoint, options) {
    const url = `${this.baseUrl}${endpoint}`;
    const requestOptions = {
      method: options.method || 'GET',
      headers: options.headers || {},
      body: options.body ? JSON.stringify(options.body) : undefined,
    };

    try {
      const response = await fetch(url, requestOptions);
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Request failed:', error);
      throw error;
    }
  }
}

// Example usage of the SmithyClient class
const client = new SmithyClient({ baseUrl: 'https://api.example.com' });

client.makeRequest('/data', { method: 'GET' })
  .then(data => console.log('Data received:', data))
  .catch(error => console.error('Error:', error));

module.exports = SmithyClient;

// To use the SmithyClient package, you would typically do:
// const SmithyClient = require('./smithy-client');
// const client = new SmithyClient({ /* configuration */ });
// client.makeRequest('/endpoint', { /* options */ }).then(/* handle response */);