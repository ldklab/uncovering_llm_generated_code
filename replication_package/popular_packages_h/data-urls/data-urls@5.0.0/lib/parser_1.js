"use strict";
const MIMEType = require("whatwg-mimetype");
const { parseURL, serializeURL, percentDecodeString } = require("whatwg-url");
const { stripLeadingAndTrailingASCIIWhitespace, isomorphicDecode, forgivingBase64Decode } = require("./utils.js");

module.exports = function parseDataURL(input) {
  const urlRecord = parseURL(input);
  if (!urlRecord) return null;

  return parseDataFromURLRecord(urlRecord);
};

function parseDataFromURLRecord(urlRecord) {
  if (urlRecord.scheme !== "data") return null;

  const serializedURL = serializeURL(urlRecord, true);
  const dataSchemeIndex = "data:".length;
  const dataString = serializedURL.substring(dataSchemeIndex);

  let position = 0;
  let mimeTypeStr = "";

  // Extract mimeType up to the first comma
  while (position < dataString.length && dataString[position] !== ",") {
    mimeTypeStr += dataString[position];
    position++;
  }

  mimeTypeStr = stripLeadingAndTrailingASCIIWhitespace(mimeTypeStr);

  if (position === dataString.length) return null;
  position++;

  const encodedBody = dataString.substring(position);
  let body = percentDecodeString(encodedBody);

  // Handle Base64 encoded data
  const base64Pattern = /(.*); *[Bb][Aa][Ss][Ee]64$/u;
  const base64Match = base64Pattern.exec(mimeTypeStr);
  if (base64Match) {
    const decodedStringBody = isomorphicDecode(body);
    body = forgivingBase64Decode(decodedStringBody);
    if (body === null) return null;
    mimeTypeStr = base64Match[1];
  }

  // Default to text/plain if mimeType starts with ;
  if (mimeTypeStr.startsWith(";")) {
    mimeTypeStr = `text/plain${mimeTypeStr}`;
  }

  let mimeType;
  try {
    mimeType = new MIMEType(mimeTypeStr);
  } catch (error) {
    mimeType = new MIMEType("text/plain;charset=US-ASCII");
  }

  return {
    mimeType,
    body
  };
}
