// util-endpoints/index.js

class EndpointResolver {
  constructor() {
    // Extendable with configurations or different service endpoint mappings
    this.defaultEndpoint = 'https://default.service.endpoint';
  }

  /**
   * Resolves the endpoint URL for a specified service.
   * @param {string} serviceName - The name of the service.
   * @returns {string} - The resolved endpoint URL.
   */
  resolve(serviceName) {
    const endpointMappings = {
      's3': 'https://s3.amazonaws.com',
      'dynamo': 'https://dynamodb.amazonaws.com',
    };

    return endpointMappings[serviceName] || this.defaultEndpoint;
  }
}

module.exports = {
  EndpointResolver,
};
