// util-endpoints/index.js

class EndpointResolver {
  constructor() {
    // Default endpoint URL, which can be used if no specific mapping is found
    this.defaultEndpoint = 'https://default.service.endpoint';
  }

  /**
   * Returns the service endpoint URL based on the provided service name.
   * @param {string} serviceName - The name of the service to resolve the endpoint for.
   * @returns {string} - The endpoint URL for the specified service, or a default endpoint.
   */
  resolve(serviceName) {
    // Predefined service name to endpoint URL mappings
    const endpointMappings = {
      's3': 'https://s3.amazonaws.com',
      'dynamo': 'https://dynamodb.amazonaws.com',
    };

    // Return the resolved endpoint or the default if no match is found
    return endpointMappings[serviceName] || this.defaultEndpoint;
  }
}

module.exports = {
  EndpointResolver,
};
