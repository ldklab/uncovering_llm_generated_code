// index.js
const STABLE_CONVENTIONS = {
  ATTR_NETWORK_PEER_ADDRESS: 'net.peer.address',
  ATTR_NETWORK_PEER_PORT: 'net.peer.port',
  ATTR_NETWORK_PROTOCOL_NAME: 'net.protocol.name',
  ATTR_NETWORK_PROTOCOL_VERSION: 'net.protocol.version',
  ATTR_NETWORK_TRANSPORT: 'net.transport',
  NETWORK_TRANSPORT_VALUE_TCP: 'tcp',
};

const INCUBATING_CONVENTIONS = {
  ...STABLE_CONVENTIONS,
  ATTR_PROCESS_COMMAND: 'process.command',
  ATTR_PROCESS_COMMAND_ARGS: 'process.command_args',
  ATTR_PROCESS_COMMAND_LINE: 'process.command_line',
};

// Export both STABLE and INCUBATING conventions
module.exports = {
  ...STABLE_CONVENTIONS,
  incubating: INCUBATING_CONVENTIONS,
};

// Usage of stable conventions

// stableConventions.js
const {
  ATTR_NETWORK_PEER_ADDRESS,
  ATTR_NETWORK_PEER_PORT,
  ATTR_NETWORK_PROTOCOL_NAME,
  ATTR_NETWORK_PROTOCOL_VERSION,
  ATTR_NETWORK_TRANSPORT,
  NETWORK_TRANSPORT_VALUE_TCP,
} = require('./index');

function createNetworkSpan(tracer, spanName, spanOptions) {
  // Create a network span with predefined attributes related to network conventions
  const span = tracer.startSpan(spanName, spanOptions).setAttributes({
    [ATTR_NETWORK_PEER_ADDRESS]: 'localhost',
    [ATTR_NETWORK_PEER_PORT]: 8080,
    [ATTR_NETWORK_PROTOCOL_NAME]: 'http',
    [ATTR_NETWORK_PROTOCOL_VERSION]: '1.1',
    [ATTR_NETWORK_TRANSPORT]: NETWORK_TRANSPORT_VALUE_TCP,
  });
  return span;
}

// Usage of incubating conventions

// incubatingConventions.js
const {
  ATTR_PROCESS_COMMAND,
  ATTR_PROCESS_COMMAND_ARGS,
  ATTR_PROCESS_COMMAND_LINE,
} = require('./index').incubating;

function createProcessSpan(tracer, spanName, spanOptions) {
  // Create a process span with predefined attributes related to process execution
  const span = tracer.startSpan(spanName, spanOptions).setAttributes({
    [ATTR_PROCESS_COMMAND]: 'cat',
    [ATTR_PROCESS_COMMAND_ARGS]: ['file1', 'file2'],
    [ATTR_PROCESS_COMMAND_LINE]: 'cat file1 file2',
  });
  return span;
}
