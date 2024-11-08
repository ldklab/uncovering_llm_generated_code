"use strict";
const MIMEType = require("whatwg-mimetype");
const { parseURL, serializeURL } = require("whatwg-url");
const {
  stripLeadingAndTrailingASCIIWhitespace,
  stringPercentDecode,
  isomorphicDecode,
  forgivingBase64Decode
} = require("./utils.js");

module.exports = function parseDataURL(stringInput) {
  const urlRecord = parseURL(stringInput);

  if (!urlRecord || urlRecord.scheme !== "data") {
    return null;
  }

  const input = serializeURL(urlRecord, true).slice("data:".length);
  let position = 0;
  let mimeType = "";

  while (position < input.length && input[position] !== ",") {
    mimeType += input[position++];
  }
  mimeType = stripLeadingAndTrailingASCIIWhitespace(mimeType);

  if (position === input.length) {
    return null;
  }

  const encodedBody = input.slice(++position);
  let body = stringPercentDecode(encodedBody);

  const mimeTypeBase64Match = /(.*); *[Bb][Aa][Ss][Ee]64$/.exec(mimeType);
  if (mimeTypeBase64Match) {
    body = forgivingBase64Decode(isomorphicDecode(body));
    if (!body) return null;
    mimeType = mimeTypeBase64Match[1];
  }

  if (mimeType.startsWith(";")) {
    mimeType = "text/plain" + mimeType;
  }

  try {
    return { mimeType: new MIMEType(mimeType), body };
  } catch {
    return { mimeType: new MIMEType("text/plain;charset=US-ASCII"), body };
  }
};
