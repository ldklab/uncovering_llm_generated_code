// url-join.js

function urlJoin(...parts) {
  return parts
    .flatMap(part => part.split('/'))
    .filter(part => part !== '')
    .join('/')
    .replace(/(https?:\/)(\/+)/g, '$1/')
    .replace(/([^:])(\?{2,})/g, '$1?');
}

export default urlJoin;

// Example usage
const fullUrl = urlJoin('http://www.google.com', 'a', '/b/cd', '?foo=123');
console.log(fullUrl);
// Expected output: 'http://www.google.com/a/b/cd?foo=123'
