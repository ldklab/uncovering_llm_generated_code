const net = require('net');
const tls = require('tls');
const http = require('http');
const { Agent: BaseAgent } = require('http');

/**
 * Custom agent implementation for handling HTTP/HTTPS connections.
 */
class MyAgent extends BaseAgent {
  constructor(options = {}) {
    super(options);
  }

  /**
   * Method to determine the type of connection to create based on request options.
   * @param {Object} req - The request object (unused but provided by signature).
   * @param {Object} opts - Options that indicate whether the endpoint is secure.
   */
  createConnection(req, opts) {
    return opts.secureEndpoint ? tls.connect(opts) : net.connect(opts);
  }
}

// Demonstration of using MyAgent
const agent = new MyAgent({ keepAlive: true });

http.get('http://nodejs.org/api/', { agent }, (response) => {
  console.log('Received response headers:', response.headers);
  response.pipe(process.stdout);
});
