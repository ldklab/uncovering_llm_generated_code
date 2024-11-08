// util-endpoints/index.js

class EndpointResolver {
  constructor() {
    // The constructor initializes with a default endpoint that can be used
    // if no specific mapping for a service is available.
    this.defaultEndpoint = 'https://default.service.endpoint';
  }

  /**
   * Resolves the endpoint URL based on the provided service name.
   * @param {string} serviceName - The name of the service to resolve the endpoint for.
   * @returns {string} - The resolved endpoint URL for the service.
   */
  resolve(serviceName) {
    // Predefined mapping of service names to specific endpoint URLs.
    const endpointMappings = {
      's3': 'https://s3.amazonaws.com',
      'dynamo': 'https://dynamodb.amazonaws.com',
    };
    
    // Return the specific endpoint if found in the mappings; otherwise, use the default endpoint.
    return endpointMappings[serviceName] || this.defaultEndpoint;
  }
}

// Export the EndpointResolver class to make it available for use in other parts of the application.
module.exports = {
  EndpointResolver,
};
