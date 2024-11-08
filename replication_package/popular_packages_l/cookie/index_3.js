// cookie.js
module.exports = {
  parse,
  serialize
};

function parse(cookieHeader, options = {}) {
  const decode = options.decode || decodeURIComponent;
  const cookies = {};

  if (!cookieHeader) return cookies;

  cookieHeader.split(';').forEach(cookie => {
    const [name, ...rest] = cookie.split('=');
    const value = rest.join('=').trim();
    const trimName = name.trim();
    if (!cookies[trimName]) {
      try {
        cookies[trimName] = decode(value);
      } catch (e) {
        cookies[trimName] = value;
      }
    }
  });

  return cookies;
}

function serialize(name, value, options = {}) {
  const encode = options.encode || encodeURIComponent;
  const pairs = [`${name}=${encode(value)}`];

  if (options.maxAge) pairs.push(`Max-Age=${Math.floor(options.maxAge)}`);
  if (options.domain) pairs.push(`Domain=${options.domain}`);
  if (options.path) pairs.push(`Path=${options.path}`);
  if (options.expires) pairs.push(`Expires=${options.expires.toUTCString()}`);
  if (options.httpOnly) pairs.push('HttpOnly');
  if (options.secure) pairs.push('Secure');
  if (options.partitioned) pairs.push('Partitioned');

  if (options.priority) {
    const priorities = { low: 'Low', medium: 'Medium', high: 'High' };
    pairs.push(`Priority=${priorities[options.priority] || 'Medium'}`);
  }

  const sameSiteValue = typeof options.sameSite === 'string'
    ? options.sameSite.charAt(0).toUpperCase() + options.sameSite.slice(1)
    : (options.sameSite === true ? 'Strict' : undefined);

  if (sameSiteValue) pairs.push(`SameSite=${sameSiteValue}`);
  
  return pairs.join('; ');
}

// Example of usage in a simple HTTP server (app.js)
const http = require('http');
const url = require('url');
const escapeHtml = require('escape-html');
const cookie = require('./cookie');

const server = http.createServer((req, res) => {
  const query = url.parse(req.url, true).query;
  const cookies = cookie.parse(req.headers.cookie || '');

  if (query.name) {
    res.setHeader('Set-Cookie', cookie.serialize('name', String(query.name), {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 // 1 week
    }));
    res.writeHead(302, { Location: '/' });
    res.end();
    return;
  }

  res.setHeader('Content-Type', 'text/html; charset=UTF-8');
  if (cookies.name) {
    res.write(`<p>Welcome back, <b>${escapeHtml(cookies.name)}</b>!</p>`);
  } else {
    res.write('<p>Hello, new visitor!</p>');
  }

  res.write('<form method="GET">');
  res.write('<input placeholder="enter your name" name="name"><input type="submit" value="Set Name">');
  res.end('</form>');
});

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000/');
});
