'use strict';

/**
 * Check if a specific port number needs to be included in a URL.
 *
 * Determines if the given port is the default port for the specified protocol.
 * Returns false if the port is the default, indicating it shouldn't be included.
 *
 * @param {Number|String} port - The port number to check.
 * @param {String} protocol - The protocol to check against.
 * @returns {Boolean} - True if the port is not default and should be included, otherwise false.
 * @api private
 */
module.exports = function isPortRequired(port, protocol) {
  const normalizedProtocol = protocol.split(':')[0];
  const numericPort = Number(port);

  // A falsy port (0, null, undefined) indicates no port is required
  if (!numericPort) return false;

  switch (normalizedProtocol) {
    case 'http':
    case 'ws':
      return numericPort !== 80;

    case 'https':
    case 'wss':
      return numericPort !== 443;

    case 'ftp':
      return numericPort !== 21;

    case 'gopher':
      return numericPort !== 70;

    case 'file':
      return false;

    default:
      return numericPort !== 0;
  }
};
