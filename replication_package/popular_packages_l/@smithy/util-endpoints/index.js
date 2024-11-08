// File: index.js

class EndpointUtils {
  constructor() {
    // Initialize with potential internal configurations
    this.config = {
      defaultProtocol: 'https',
      defaultPort: 443,
    };
  }

  // Function to construct a full endpoint URL
  buildEndpoint(host, port = this.config.defaultPort, protocol = this.config.defaultProtocol) {
    return `${protocol}://${host}:${port}`;
  }

  // Function to parse a given endpoint URL into components
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

  // Validate a given endpoint's components
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

// Usage (hypothetical and for internal testing purposes only)
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
