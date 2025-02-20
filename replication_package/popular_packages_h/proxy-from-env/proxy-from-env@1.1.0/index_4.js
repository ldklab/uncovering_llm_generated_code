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

const stringEndsWith = String.prototype.endsWith || function (suffix) {
  return this.length >= suffix.length &&
    this.lastIndexOf(suffix) === this.length - suffix.length;
};

/**
 * Determines the appropriate proxy for a given URL.
 *
 * @param {string|object} url - The URL or a parsed URL object.
 * @returns {string} The proxy URL or an empty string if no proxy should be used.
 */
function getProxyForUrl(url) {
  const parsedUrl = typeof url === 'string' ? parse(url) : url || {};
  let protocol = parsedUrl.protocol;
  const hostname = parsedUrl.hostname;
  const port = parsedUrl.port || DEFAULT_PORTS[protocol.slice(0, -1)];

  if (!protocol || !hostname) {
    return ''; // No proxy for invalid URLs.
  }

  protocol = protocol.replace(':', '');

  if (!shouldProxy(hostname, port)) {
    return ''; // No proxy if the hostname should bypass proxy according to NO_PROXY.
  }

  const proxyEnvVar = [
    `npm_config_${protocol}_proxy`,
    `${protocol}_proxy`,
    'npm_config_proxy',
    'all_proxy',
  ];

  let proxy = proxyEnvVar.map(getEnv).find(Boolean) || '';

  if (proxy && !proxy.includes('://')) {
    proxy = `${protocol}://${proxy}`;
  }

  return proxy;
}

/**
 * Determines whether a given hostname and port should be proxied.
 *
 * @param {string} hostname - The hostname from the URL.
 * @param {number} port - The port from the URL.
 * @returns {boolean} True if should use proxy, else false.
 */
function shouldProxy(hostname, port) {
  const NO_PROXY = getEnv('npm_config_no_proxy') || getEnv('no_proxy');
  
  if (!NO_PROXY) return true;
  if (NO_PROXY === '*') return false;

  return NO_PROXY.split(/[\s,]+/).every(proxy => {
    if (!proxy) return true;

    const [proxyHost, proxyPort] = proxy.split(':', 2);
    const portNumber = parseInt(proxyPort, 10);
    
    if (portNumber && portNumber !== port) {
      return true;
    }

    if (/^\*/.test(proxyHost)) {
      return !stringEndsWith.call(hostname, proxyHost.slice(1));
    }

    return hostname !== proxyHost;
  });
}

/**
 * Retrieves the value of an environment variable in a case-insensitive manner.
 *
 * @param {string} key - The name of the environment variable.
 * @returns {string} The value of the environment variable or an empty string.
 */
function getEnv(key) {
  return process.env[key.toLowerCase()] || process.env[key.toUpperCase()] || '';
}

exports.getProxyForUrl = getProxyForUrl;
