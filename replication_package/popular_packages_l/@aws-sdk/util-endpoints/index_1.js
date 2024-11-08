// util-endpoints/index.js

class EndpointResolver {
  constructor() {
    // Default endpoint set for services without a specific mapping.
    this.defaultEndpoint = 'https://default.service.endpoint';
  }

  /**
   * Resolves the endpoint for the given service name.
   * @param {string} serviceName - The name of the AWS service.
   * @returns {string} - The endpoint URL for the specified service or default.
   */
  resolve(serviceName) {
    // A predefined set of service name to endpoint mappings.
    const endpointMappings = {
      's3': 'https://s3.amazonaws.com',
      'dynamo': 'https://dynamodb.amazonaws.com',
    };

    // Returns the specific endpoint if found in mappings or the default endpoint.
    return endpointMappings[serviceName] || this.defaultEndpoint;
  }
}

module.exports = {
  EndpointResolver,
};
