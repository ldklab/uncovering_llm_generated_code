// Import the url module for parsing URLs
const url = require('url');

// Function to determine the proxy server to be used for a given URL
function getProxyForUrl(requestUrl) {
  // Parse the input URL to extract components
  const parsedUrl = url.parse(requestUrl);
  const protocol = (parsedUrl.protocol || '').toLowerCase().replace(':', '');

  // If the protocol is not specified, return an empty string
  if (!protocol) return '';

  // Extract the hostname and port from the parsed URL
  const hostname = parsedUrl.hostname.toLowerCase();
  const port = parsedUrl.port || defaultPort(protocol);

  // Retrieve the NO_PROXY environment variable
  const noProxy = getEnv('no_proxy');
  if (noProxy) {
    // Split the NO_PROXY variable into a list by spaces and commas
    const noProxyList = noProxy.split(/[\s,]+/);
    // If wildcard '*' is present, return no proxy
    if (noProxyList.includes('*')) return '';
    // Iterate through each entry in the NO_PROXY list
    for (let item of noProxyList) {
      item = item.trim().toLowerCase();
      if (!item) continue; // Skip if the item is empty
      const [noProxyHost, noProxyPort] = item.split(':');
      // Check if the port matches, or if the host matches exactly or by pattern
      if (noProxyPort && noProxyPort !== port) continue;
      if (hostname === noProxyHost || 
          (noProxyHost.startsWith('.') && hostname.endsWith(noProxyHost)) ||
          (noProxyHost.startsWith('*') && hostname.endsWith(noProxyHost.slice(1))) ||
          (!noProxyHost && hostname.endsWith(noProxyHost))) {
        return ''; // Return no proxy if any condition is met
      }
    }
  }

  // Determine the appropriate proxy based on the URL's protocol
  const proxyVar = `${protocol}_proxy`;
  const proxyUrl = getEnv(proxyVar) || getEnv('all_proxy');

  // Return the proxy URL if found, otherwise an empty string
  return proxyUrl ? proxyUrl : '';
}

// Function to determine the default port based on protocol
function defaultPort(protocol) {
  switch (protocol) {
    case 'http': return '80';
    case 'https': return '443';
    case 'ftp': return '21';
    // Add other protocols here if needed
    default: return '';
  }
}

// Function to retrieve environment variables in a case-insensitive way
function getEnv(name) {
  return process.env[name.toLowerCase()] || process.env[name.toUpperCase()] || '';
}

// Export the getProxyForUrl function for use in other modules
module.exports = { getProxyForUrl };
