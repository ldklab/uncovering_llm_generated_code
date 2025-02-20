"use strict";

const { MIMEType } = require("whatwg-mimetype");
const { parseURL, serializeURL } = require("whatwg-url");
const {
  stripLeadingAndTrailingASCIIWhitespace,
  stringPercentDecode,
  isomorphicDecode,
  forgivingBase64Decode
} = require("./utils.js");

module.exports = function parseDataURL(stringInput) {
  const urlRecord = parseURL(stringInput);

  if (!urlRecord) {
    return null;
  }

  return parseFromURLRecord(urlRecord);
};

function parseFromURLRecord(urlRecord) {
  if (urlRecord.scheme !== "data") {
    return null;
  }

  const serializedDataURL = serializeURL(urlRecord, true).substring("data:".length);
  let position = 0;
  let mimeTypeSection = "";

  // Extract MIME type section up to the first comma
  while (position < serializedDataURL.length && serializedDataURL[position] !== ",") {
    mimeTypeSection += serializedDataURL[position++];
  }
  mimeTypeSection = stripLeadingAndTrailingASCIIWhitespace(mimeTypeSection);

  // If there's no comma found, the URL is incorrectly formatted
  if (position === serializedDataURL.length) {
    return null;
  }

  // Get the encoded body skipping the comma
  const encodedBody = serializedDataURL.substring(++position);
  let body = stringPercentDecode(encodedBody);

  // Check for base64 encoded body and handle it
  const mimeTypeBase64Match = /(.*); *[Bb][Aa][Ss][Ee]64$/.exec(mimeTypeSection);
  if (mimeTypeBase64Match) {
    const decodedStringBody = isomorphicDecode(body);
    body = forgivingBase64Decode(decodedStringBody);

    if (body === null) {
      return null;
    }
    mimeTypeSection = mimeTypeBase64Match[1];
  }

  // Default MIME type if none is specified
  if (mimeTypeSection.startsWith(";")) {
    mimeTypeSection = "text/plain" + mimeTypeSection;
  }

  let mimeTypeRecord;
  try {
    mimeTypeRecord = new MIMEType(mimeTypeSection);
  } catch (e) {
    mimeTypeRecord = new MIMEType("text/plain;charset=US-ASCII");
  }

  return {
    mimeType: mimeTypeRecord,
    body
  };
}

module.exports.fromURLRecord = parseFromURLRecord;
