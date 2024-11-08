const http = require('http');
const https = require('https');
const { URL } = require('url');

class SimpleAxios {
  constructor(config = {}) {
    this.defaults = {
      method: 'GET',
      timeout: 0,
      headers: {},
      ...config
    };
  }

  request(customConfig) {
    const config = { ...this.defaults, ...customConfig };
    const { method, data, timeout, headers, url: requestUrl } = config;
    const parsedUrl = new URL(requestUrl);

    const options = {
      method: method.toUpperCase(),
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      headers,
      timeout
    };

    const transport = parsedUrl.protocol === 'https:' ? https : http;

    return new Promise((resolve, reject) => {
      const req = transport.request(options, res => {
        let responseData = '';

        res.on('data', chunk => {
          responseData += chunk;
        });

        res.on('end', () => {
          try {
            resolve(JSON.parse(responseData));
          } catch {
            resolve(responseData);
          }
        });
      });

      req.on('error', error => reject(error));
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timed out'));
      });

      if (data) {
        req.write(typeof data === 'object' ? JSON.stringify(data) : String(data));
      }
      
      req.end();
    });
  }

  get(url, config) {
    return this.request({ ...config, method: 'GET', url });
  }

  post(url, data, config) {
    return this.request({ ...config, method: 'POST', url, data });
  }
}

// Instantiate SimpleAxios
const simpleAxios = new SimpleAxios();

// Example usage
simpleAxios.get('http://jsonplaceholder.typicode.com/posts/1')
  .then(console.log)
  .catch(console.error);

module.exports = SimpleAxios;
