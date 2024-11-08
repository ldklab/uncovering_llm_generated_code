// File: index.js

class EndpointUtils {
  constructor() {
    // Initialize with default configurations for protocol and port
    this.config = {
      defaultProtocol: 'https',
      defaultPort: 443,
    };
  }

  // Constructs a complete endpoint URL using the provided components
  buildEndpoint(host, port = this.config.defaultPort, protocol = this.config.defaultProtocol) {
    return `${protocol}://${host}:${port}`;
  }

  // Parses a complete endpoint URL into its constituent components
  parseEndpoint(endpoint) {
    try {
      const url = new URL(endpoint);
      return {
        protocol: url.protocol.slice(0, -1), // Remove the colon from protocol
        host: url.hostname,
        port: url.port || (url.protocol === 'https:' ? '443' : '80'), // Default port based on protocol
        path: url.pathname,
      };
    } catch (error) {
      console.error('Invalid URL');
      return null;
    }
  }

  // Checks the validity of the endpoint's components
  validateEndpointComponents({ protocol, host, port }) {
    if (!protocol || !['http', 'https'].includes(protocol)) {
      console.error('Invalid protocol');
      return false;
    }
    if (!host) {
      console.error('Host is required');
      return false;
    }
    if (port && isNaN(port)) { // Ensures port is a number if provided
      console.error('Invalid port');
      return false;
    }
    return true;
  }
}

module.exports = EndpointUtils;

// Hypothetical usage for internal testing
if (require.main === module) {
  const endpointUtil = new EndpointUtils();
  const endpoint = 'https://example.com:443';
  const parsed = endpointUtil.parseEndpoint(endpoint);
  if (endpointUtil.validateEndpointComponents(parsed)) {
    console.log('Endpoint is valid:', parsed);
  } else {
    console.warn('Endpoint validation failed.');
  }
}
