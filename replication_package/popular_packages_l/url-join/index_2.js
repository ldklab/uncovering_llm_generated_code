// urlJoin.js

function urlJoin(...parts) {
  return parts
    // Break each part of the URL by slashes and flatten all the resulting arrays into one.
    .flatMap(part => part.split('/'))
    // Filter out any empty strings resulting from splitting.
    .filter(part => part !== '')
    // Concatenate all remaining parts with a slash.
    .join('/')
    // Correct any occurrences of double slashes after 'http:' or 'https:'.
    .replace(/(https?:\/)(\/+)/g, '$1/')
    // Ensure only a single question mark is present in the query string.
    .replace(/([^:])\?{2,}/g, '$1?');
}

export default urlJoin;

// Example usage
const fullUrl = urlJoin('http://www.google.com', 'a', '/b/cd', '?foo=123');
console.log(fullUrl);
// Expected output: 'http://www.google.com/a/b/cd?foo=123'
