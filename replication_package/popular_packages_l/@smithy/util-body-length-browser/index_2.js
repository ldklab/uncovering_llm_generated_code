function getBodyLength(body) {
  if (body == null) {
    return 0;
  }

  switch (true) {
    case typeof body === 'string':
      return body.length;

    case body instanceof Blob:
      return body.size;

    case Buffer.isBuffer(body):
      return body.length;

    case body instanceof ArrayBuffer:
      return body.byteLength;

    case ArrayBuffer.isView(body):
      return body.byteLength;

    default:
      return null;
  }
}

module.exports = { getBodyLength };
