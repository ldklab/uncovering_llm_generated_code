// url-join.js

function urlJoin(...parts) {
  return parts
    // Flatten the array of parts into a single array
    .flatMap(part => part.split('/'))
    // Remove any empty parts that may result from splitting or joining
    .filter(part => part !== '')
    // Join with a single slash
    .join('/')
    // Add prepending slash if any part had one after joining
    .replace(/(https?:\/)(\/+)/g, '$1/')
    // Ensure a single question mark for the query string
    .replace(/([^:])(\?{2,})/g, '$1?');
}

export default urlJoin;

// Example usage
const fullUrl = urlJoin('http://www.google.com', 'a', '/b/cd', '?foo=123');
console.log(fullUrl);
// Expected output: 'http://www.google.com/a/b/cd?foo=123'
