'use strict';

/**
 * Determine if a given port number is a non-default and should be included for a specific protocol.
 *
 * @see https://url.spec.whatwg.org/#default-port
 * @param {Number|String} port The port number we need to check.
 * @param {String} protocol The protocol we need to check against.
 * @returns {Boolean} Returns true if the port is not the default for the protocol, otherwise false.
 * @api private
 */
module.exports = function isPortRequired(port, protocol) {
  // Remove any trailing colon from protocol
  protocol = protocol.split(':')[0];
  // Convert port to a number
  port = Number(port);

  // If port is falsy (e.g., 0, null, undefined), return false
  if (!port) return false;

  // Check against known default ports for various protocols
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
      return false; // File URLs do not use ports
  }

  // For unrecognized protocols, assume any non-zero port needs to be specified
  return port !== 0;
};
