const url = require('url');

function getProxyForUrl(requestUrl) {
  const parsedUrl = url.parse(requestUrl);
  const protocol = (parsedUrl.protocol || '').toLowerCase().replace(':', '');
  if (!protocol) return '';

  const hostname = parsedUrl.hostname.toLowerCase();
  const port = parsedUrl.port || defaultPort(protocol);

  const noProxy = getEnv('no_proxy');
  if (noProxy) {
    const noProxyList = noProxy.split(/[\s,]+/);
    if (noProxyList.includes('*')) return '';
    for (let item of noProxyList) {
      item = item.trim().toLowerCase();
      const [noProxyHost, noProxyPort] = item.split(':');
      if (noProxyPort && noProxyPort !== port) continue;
      if (hostname === noProxyHost || 
          (noProxyHost.startsWith('.') && hostname.endsWith(noProxyHost)) ||
          (noProxyHost.startsWith('*') && hostname.endsWith(noProxyHost.slice(1))) ||
          (!noProxyHost && hostname.endsWith(noProxyHost))) {
        return '';
      }
    }
  }

  const proxyVar = `${protocol}_proxy`;
  const proxyUrl = getEnv(proxyVar) || getEnv('all_proxy');
  return proxyUrl ? proxyUrl : '';
}

function defaultPort(protocol) {
  switch (protocol) {
    case 'http': return '80';
    case 'https': return '443';
    case 'ftp': return '21';
    default: return '';
  }
}

function getEnv(name) {
  return process.env[name.toLowerCase()] || process.env[name.toUpperCase()] || '';
}

module.exports = { getProxyForUrl };
