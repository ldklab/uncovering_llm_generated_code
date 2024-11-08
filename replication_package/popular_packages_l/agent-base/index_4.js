const net = require('net');
const tls = require('tls');
const http = require('http');
const { Agent: BaseAgent } = require('http');

/**
 * Custom agent extending the http.Agent.
 */
class MyAgent extends BaseAgent {
  constructor(options = {}) {
    super(options);
  }

  /**
   * Decides the type of connection (TLS or TCP).
   * @param {Object} req - The request object.
   * @param {Object} opts - Connection options.
   */
  connect(req, opts) {
    return opts.secureEndpoint ? tls.connect(opts) : net.connect(opts);
  }
}

// Example usage of MyAgent
const agent = new MyAgent({ keepAlive: true });

http.get('http://nodejs.org/api/', { agent }, (res) => {
  console.log('"response" event!', res.headers);
  res.pipe(process.stdout);
});
