const net = require('net');
const tls = require('tls');
const http = require('http');
const { Agent: HttpAgent } = require('http');

class CustomAgent extends HttpAgent {
  constructor(options = {}) {
    super(options);
  }

  createConnection(options) {
    return options.secureEndpoint ? tls.connect(options) : net.connect(options);
  }
}

const myAgent = new CustomAgent({ keepAlive: true });

http.get('http://nodejs.org/api/', { agent: myAgent }, (response) => {
  console.log('Received response headers:', response.headers);
  response.pipe(process.stdout);
});
