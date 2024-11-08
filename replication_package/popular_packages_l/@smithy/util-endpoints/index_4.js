// File: index.js

class EndpointUtils {
  constructor() {
    // Set default protocol and port values
    this.config = {
      defaultProtocol: 'https',
      defaultPort: 443,
    };
  }

  // Create a complete URL from host, port, and protocol
  buildEndpoint(host, port = this.config.defaultPort, protocol = this.config.defaultProtocol) {
    return `${protocol}://${host}:${port}`;
  }

  // Extract and return parts of a URL
  parseEndpoint(endpoint) {
    try {
      const url = new URL(endpoint);
      return {
        protocol: url.protocol.replace(':', ''), // Remove trailing colon
        host: url.hostname,
        port: url.port || (url.protocol === 'https:' ? '443' : '80'),
        path: url.pathname,
      };
    } catch (error) {
      console.error('Invalid URL'); // Log error if URL is invalid
      return null;
    }
  }

  // Check if URL components are valid
  validateEndpointComponents({ protocol, host, port }) {
    if (!protocol || !['http', 'https'].includes(protocol)) { // Check for valid protocol
      console.error('Invalid protocol');
      return false;
    }
    if (!host) { // Ensure host is present
      console.error('Host is required');
      return false;
    }
    if (port && isNaN(port)) { // Validate port number
      console.error('Invalid port');
      return false;
    }
    return true; // Return true if all components are valid
  }
}

module.exports = EndpointUtils;

// Example usage
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
