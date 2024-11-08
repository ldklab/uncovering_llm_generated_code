// agent-base.js - A basic implementation of the agent-base functionality.

const net = require('net');
const tls = require('tls');
const http = require('http');
const { Agent: BaseAgent } = require('http');

/**
 * Custom agent class extending the built-in http.Agent using agent-base logic.
 */
class MyAgent extends BaseAgent {
  constructor(options = {}) {
    super(options);
  }

  /**
   * Overridden method to create socket connections based on the request options.
   * @param {Object} req - The request object.
   * @param {Object} opts - Options for the connection, containing secureEndpoint.
   */
  connect(req, opts) {
    if (opts.secureEndpoint) {
      // Create a TLS connection for HTTPS requests.
      return tls.connect(opts);
    } else {
      // Create a TCP connection for HTTP requests.
      return net.connect(opts);
    }
  }
}

// Usage example
const agent = new MyAgent({ keepAlive: true });

http.get('http://nodejs.org/api/', { agent }, (res) => {
  console.log('"response" event!', res.headers);
  res.pipe(process.stdout);
});
