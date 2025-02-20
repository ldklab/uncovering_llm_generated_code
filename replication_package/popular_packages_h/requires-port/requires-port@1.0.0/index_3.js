'use strict';

/**
 * Determines if a custom port should be added to a URL based on the protocol.
 *
 * @see https://url.spec.whatwg.org/#default-port
 * @param {Number|String} port The port number to evaluate.
 * @param {String} protocol The protocol of the URL.
 * @returns {Boolean} True if a non-default port is required for the protocol, otherwise false.
 * @api private
 */
module.exports = function isCustomPortRequired(port, protocol) {
  // Extract the protocol without any colon.
  protocol = protocol.split(':')[0];
  // Convert port to a number if it's not already.
  port = Number(port);

  // If there's no port specified, no custom port is needed.
  if (!port) return false;

  // Evaluate protocol-specific default ports.
  switch (protocol) {
    case 'http':
    case 'ws':
      return port !== 80;
    case 'https':
    case 'wss':
      return port !== 443;
    case 'ftp':
      return port !== 21;
    case 'gopher':
      return port !== 70;
    case 'file':
      return false;
  }

  // For unknown protocols, return true if the port is non-zero.
  return port !== 0;
};
