'use strict';

const { parse } = require('url');

const DEFAULT_PORTS = {
  ftp: 21,
  gopher: 70,
  http: 80,
  https: 443,
  ws: 80,
  wss: 443,
};

const stringEndsWith = String.prototype.endsWith || function(s) {
  return s.length <= this.length &&
    this.indexOf(s, this.length - s.length) !== -1;
};

/**
 * Determines the appropriate proxy URL for the given target URL.
 * @param {string|object} url - The URL or parsed URL object.
 * @return {string} The proxy URL or an empty string if no proxy is applicable.
 */
function getProxyForUrl(url) {
  const parsedUrl = typeof url === 'string' ? parse(url) : url || {};
  let { protocol, host: hostname, port } = parsedUrl;
  if (!hostname || !protocol) {
    return ''; // Return empty if URL lacks valid proto or host
  }

  protocol = protocol.split(':')[0];
  hostname = hostname.replace(/:\d*$/, '');
  port = parseInt(port, 10) || DEFAULT_PORTS[protocol] || 0;

  return shouldProxy(hostname, port) ? determineProxy(protocol) : '';
}

/**
 * Checks if the URL should bypass proxy based on NO_PROXY settings.
 * @param {string} hostname - Hostname of the URL.
 * @param {number} port - Port number of the URL.
 * @return {boolean} Whether the host should be proxied.
 * @private
 */
function shouldProxy(hostname, port) {
  const NO_PROXY = (getEnv('npm_config_no_proxy') || getEnv('no_proxy')).toLowerCase();
  if (!NO_PROXY) return true; // Lack of NO_PROXY implies always proxy

  return NO_PROXY.split(/[,\s]/).every(function(proxy) {
    if (!proxy) return true; // Ignore empty entries
    const [parsedHost, parsedPort] = proxy.split(':');
    if (parsedPort && parseInt(parsedPort, 10) !== port) return true;

    const cleanedHost = parsedHost.startsWith('*') ? parsedHost.slice(1) : parsedHost;
    return !stringEndsWith.call(hostname, cleanedHost);
  });
}

/**
 * Retrieve environment variable for proxy based on protocol.
 * @param {string} protocol - Protocol of the URL (http, https, etc.)
 * @return {string} Proxy URL.
 */
function determineProxy(protocol) {
  const proxy = getEnv(`npm_config_${protocol}_proxy`) ||
                getEnv(`${protocol}_proxy`) ||
                getEnv('npm_config_proxy') ||
                getEnv('all_proxy');
  return proxy && proxy.includes('://') ? proxy : `${protocol}://${proxy}`;
}

/**
 * Retrieves the value of an environment variable by key.
 * @param {string} key - Environment variable key.
 * @return {string} Value of the environment variable or an empty string.
 */
function getEnv(key) {
  return process.env[key.toLowerCase()] || process.env[key.toUpperCase()] || '';
}

exports.getProxyForUrl = getProxyForUrl;
