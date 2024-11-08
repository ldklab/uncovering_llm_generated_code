// agent-base.js - A custom HTTP agent using Node.js built-in capabilities

const net = require('net');
const tls = require('tls');
const http = require('http');
const { Agent: BaseAgent } = require('http');

/**
 * Custom agent class that extends the default HTTP Agent to support HTTP and HTTPS.
 */
class MyAgent extends BaseAgent {
  constructor(options = {}) {
    super(options);
  }

  /**
   * Method to establish a connection based on request type (HTTP/HTTPS).
   * @param {Object} req - The request object.
   * @param {Object} opts - Connection options, includes secureEndpoint flag.
   */
  connect(req, opts) {
    return opts.secureEndpoint ? tls.connect(opts) : net.connect(opts);
  }
}

// Example of how to use the MyAgent instance
const agent = new MyAgent({ keepAlive: true });

http.get('http://nodejs.org/api/', { agent }, (res) => {
  console.log('"response" event!', res.headers);
  res.pipe(process.stdout);
});
