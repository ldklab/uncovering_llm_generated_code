'use strict';

/**
 * Determines if a port number needs to be explicitly added to a URL
 * based on the protocol being used. Defaults are based on standard
 * practices for common protocols.
 *
 * @param {Number|String} port The port number to check.
 * @param {String} protocol The protocol to validate against.
 * @returns {Boolean} `true` if the port is not default for the protocol.
 * @api private
 */
module.exports = function isPortRequired(port, protocol) {
  // Remove any trailing colon from protocol
  protocol = protocol.split(':')[0];
  // Convert port to a number
  port = +port;

  // If port is 0 (falsy) then it can be assumed no specific port is needed
  if (!port) return false;

  // Evaluate the protocol and check if the port is non-default
  switch (protocol) {
    case 'http':
    case 'ws':
      // Default HTTP and WebSocket ports
      return port !== 80;

    case 'https':
    case 'wss':
      // Default HTTPS and Secure WebSocket ports
      return port !== 443;

    case 'ftp':
      // Default FTP port
      return port !== 21;

    case 'gopher':
      // Default Gopher port
      return port !== 70;

    case 'file':
      // Default file protocol doesn't require a port
      return false;
  }

  // If protocol is unknown, assume non-default if port is not 0
  return port !== 0;
};
