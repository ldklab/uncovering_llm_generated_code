const { MIMEType } = require('whatwg-mimetype');
const { labelToName, decode: whatwgDecode } = require('whatwg-encoding');
const { parseURL } = require('whatwg-url');

function parseDataURL(dataURLString) {
  if (!dataURLString.startsWith('data:')) {
    return null;
  }

  try {
    const dataURL = decodeURIComponent(dataURLString.slice(5));
    const [mimeTypeString, data] = dataURL.split(',');

    const mimeType = new MIMEType(mimeTypeString);
    const isBase64 = mimeTypeString.includes(';base64');
    const body = isBase64 ? Buffer.from(data, 'base64') : new TextEncoder().encode(data);

    return { mimeType, body: new Uint8Array(body) };
  } catch {
    return null;
  }
}

function fromURLRecord(urlRecord) {
  const dataURLString = `data:${urlRecord.schemeData}`;
  return parseDataURL(dataURLString);
}

function decodeBody(dataURL) {
  const charset = dataURL.mimeType.parameters.get('charset') || 'utf-8';
  const encodingName = labelToName(charset);
  return whatwgDecode(dataURL.body, encodingName);
}

module.exports = parseDataURL;

// Example usage of the functions exported
const dataURLExample = parseDataURL('data:,Hello%2C%20World!');
if (dataURLExample) {
  console.log(dataURLExample.mimeType.toString()); // text/plain;charset=US-ASCII
  console.log(dataURLExample.body); // Uint8Array containing bytes representing "Hello, World!"
}

// Using fromURLRecord example
const urlRecord = parseURL('data:,Hello%2C%20World!');
const dataURLFromRecord = fromURLRecord(urlRecord);
if (dataURLFromRecord) {
  console.log(dataURLFromRecord.mimeType.toString()); // "text/plain;charset=US-ASCII"
}

// Decoding the body example
const decodedBody = decodeBody(dataURLExample);
console.log(decodedBody); // "Hello, World!"
