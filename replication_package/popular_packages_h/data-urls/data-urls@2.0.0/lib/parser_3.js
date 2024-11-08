"use strict";
const MIMEType = require("whatwg-mimetype");
const { parseURL, serializeURL } = require("whatwg-url");
const {
  stripLeadingAndTrailingASCIIWhitespace,
  stringPercentDecode,
  isomorphicDecode,
  forgivingBase64Decode
} = require("./utils.js");

module.exports = stringInput => {
  const urlRecord = parseURL(stringInput);

  if (!urlRecord) return null;

  return module.exports.fromURLRecord(urlRecord);
};

module.exports.fromURLRecord = urlRecord => {
  if (urlRecord.scheme !== "data") return null;

  const input = serializeURL(urlRecord, true).substring("data:".length);
  let position = 0;

  let mimeType = "";
  while (position < input.length && input[position] !== ",") {
    mimeType += input[position];
    ++position;
  }
  mimeType = stripLeadingAndTrailingASCIIWhitespace(mimeType);

  if (position === input.length) return null;  

  ++position;
  const encodedBody = input.substring(position);
  let body = stringPercentDecode(encodedBody);

  const mimeTypeBase64Match = /(.*); *[Bb][Aa][Ss][Ee]64$/.exec(mimeType);
  if (mimeTypeBase64Match) {
    const stringBody = isomorphicDecode(body);
    body = forgivingBase64Decode(stringBody);
    if (!body) return null;

    mimeType = mimeTypeBase64Match[1];
  }

  if (mimeType.startsWith(";")) {
    mimeType = "text/plain" + mimeType;
  }

  let mimeTypeRecord;
  try {
    mimeTypeRecord = new MIMEType(mimeType);
  } catch {
    mimeTypeRecord = new MIMEType("text/plain;charset=US-ASCII");
  }

  return { mimeType: mimeTypeRecord, body };
};
