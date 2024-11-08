// url-join.js

function urlJoin(...parts) {
  return parts
    // Break down each part by splitting it on '/' and flatten into one array
    .flatMap(part => part.split('/'))
    // Remove any empty sections from the split parts
    .filter(part => part !== '')
    // Combine the parts to form a single string separated by '/'
    .join('/')
    // Correct the URL to ensure only one slash follows the protocol
    .replace(/(https?:\/)(\/+)/g, '$1/')
    // Ensure the query string starts with a single question mark
    .replace(/([^:])(\?{2,})/g, '$1?');
}

export default urlJoin;

// Example usage
const fullUrl = urlJoin('http://www.google.com', 'a', '/b/cd', '?foo=123');
console.log(fullUrl);
// Expected output: 'http://www.google.com/a/b/cd?foo=123'
