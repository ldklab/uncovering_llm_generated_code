// File: index.js

class EndpointUtils {
  constructor() {
    // Initialize configuration with default values for protocol and port
    this.config = {
      defaultProtocol: 'https',
      defaultPort: 443,
    };
  }

  // Constructs a URL from the given host, with optional custom port and protocol
  buildEndpoint(host, port = this.config.defaultPort, protocol = this.config.defaultProtocol) {
    return `${protocol}://${host}:${port}`;
  }

  // Parses the provided URL into its components: protocol, host, port, and path
  parseEndpoint(endpoint) {
    try {
      const url = new URL(endpoint);
      return {
        protocol: url.protocol.replace(':', ''),
        host: url.hostname,
        port: url.port || (url.protocol === 'https:' ? '443' : '80'),
        path: url.pathname,
      };
    } catch (error) {
      console.error('Invalid URL');
      return null;
    }
  }

  // Checks if the endpoint components are valid: protocol ('http' or 'https'), host, and numeric port
  validateEndpointComponents({ protocol, host, port }) {
    if (!protocol || !['http', 'https'].includes(protocol)) {
      console.error('Invalid protocol');
      return false;
    }
    if (!host) {
      console.error('Host is required');
      return false;
    }
    if (port && isNaN(port)) {
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
