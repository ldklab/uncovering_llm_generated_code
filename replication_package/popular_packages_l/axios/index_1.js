const http = require('http');
const https = require('https');
const { URL } = require('url');

class Axios {
  constructor(config = {}) {
    this.defaults = {
      method: 'get',
      timeout: 0,
      headers: {},
      ...config
    };
  }

  request(config) {
    const finalConfig = { ...this.defaults, ...config };
    const { method, data, timeout, headers, url } = finalConfig;
    const parsedUrl = new URL(url);
    const options = {
      method: method.toUpperCase(),
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      headers: headers,
      timeout: timeout,
    };

    const transport = parsedUrl.protocol === 'https:' ? https : http;

    return new Promise((resolve, reject) => {
      const req = transport.request(options, (res) => {
        let response = '';

        res.on('data', (chunk) => response += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(response));
          } catch {
            resolve(response);
          }
        });
      });

      req.on('error', reject);
      req.on('timeout', () => reject(new Error('Request timed out')));

      if (data) {
        req.write(typeof data === 'object' ? JSON.stringify(data) : data);
      }
      
      req.end();
    });
  }

  get(url, config) {
    return this.request({ ...config, method: 'get', url });
  }

  post(url, data, config) {
    return this.request({ ...config, method: 'post', url, data });
  }
}

// Instantiate Axios
const axios = new Axios();

// Example usage
axios.get('http://jsonplaceholder.typicode.com/posts/1')
  .then(console.log)
  .catch(console.error);

module.exports = Axios;
