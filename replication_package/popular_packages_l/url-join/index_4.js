// url-join.js

const urlJoin = (...parts) => {
  return parts
    .reduce((acc, part) => [...acc, ...part.split('/')], [])
    .filter(Boolean)
    .join('/')
    .replace(/(https?:\/)(\/+)/g, '$1/')
    .replace(/([^:])(\?{2,})/g, '$1?');
};

export default urlJoin;

// Example usage
const fullUrl = urlJoin('http://www.google.com', 'a', '/b/cd', '?foo=123');
console.log(fullUrl);
// Expected output: 'http://www.google.com/a/b/cd?foo=123'
