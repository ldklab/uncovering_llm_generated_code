const url = require('url');

/**
 * Determines the appropriate proxy server URL for a given request URL, taking
 * into account the protocol and any no-proxy configurations.
 * 
 * @param {string} requestUrl - The URL for which to find a proxy.
 * @return {string} The proxy URL or an empty string if no proxy should be used.
 */
function getProxyForUrl(requestUrl) {
  // Parsing the provided request URL
  const parsedUrl = url.parse(requestUrl);
  const protocol = (parsedUrl.protocol || '').toLowerCase().replace(':', '');

  // Return immediately if the protocol is not defined
  if (!protocol) return '';

  const hostname = parsedUrl.hostname.toLowerCase();
  const port = parsedUrl.port || defaultPort(protocol);

  // Handle 'no_proxy' environment variable
  const noProxy = getEnv('no_proxy');
  if (noProxy) {
    const noProxyList = noProxy.split(/[\s,]+/);
    if (noProxyList.includes('*')) return '';
    
    // Iterate through no-proxy list items to check if the request matches any
    for (let item of noProxyList) {
      item = item.trim().toLowerCase();
      if (!item) continue;
      
      const [noProxyHost, noProxyPort] = item.split(':');
      if (noProxyPort && noProxyPort !== port) continue;

      // Check hostname against various no-proxy patterns
      if (hostname === noProxyHost || 
          (noProxyHost.startsWith('.') && hostname.endsWith(noProxyHost)) ||
          (noProxyHost.startsWith('*') && hostname.endsWith(noProxyHost.slice(1))) ||
          (!noProxyHost && hostname.endsWith(noProxyHost))) {
        return '';
      }
    }
  }

  // Determine proxy variable based on protocol
  const proxyVar = `${protocol}_proxy`;
  const proxyUrl = getEnv(proxyVar) || getEnv('all_proxy');

  // Return the found proxy URL or an empty string if none is set
  return proxyUrl ? proxyUrl : '';
}

/**
 * Provides the default port for a given protocol.
 *
 * @param {string} protocol - The protocol to get the default port for.
 * @return {string} The default port number as a string, or an empty string if undefined.
 */
function defaultPort(protocol) {
  switch (protocol) {
    case 'http': return '80';
    case 'https': return '443';
    case 'ftp': return '21';
    default: return '';
  }
}

/**
 * Retrieves an environment variable's value, checking both lowercase and
 * uppercase variants.
 *
 * @param {string} name - The name of the environment variable.
 * @return {string} The environment variable's value or an empty string if not set.
 */
function getEnv(name) {
  return process.env[name.toLowerCase()] || process.env[name.toUpperCase()] || '';
}

module.exports = { getProxyForUrl };
