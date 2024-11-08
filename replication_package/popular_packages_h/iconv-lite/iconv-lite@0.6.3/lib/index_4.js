"use strict";

const { Buffer } = require("safer-buffer");
const bomHandling = require("./bom-handling");

let iconv = module.exports;

// Initialize encodings, set default characters for errors
iconv.encodings = null;
iconv.defaultCharUnicode = '�';
iconv.defaultCharSingleByte = '?';

// Encode a string into a buffer
iconv.encode = (str, encoding, options) => {
    str = String(str || "");
    const encoder = iconv.getEncoder(encoding, options);
    const result = encoder.write(str);
    const trail = encoder.end();

    return trail && trail.length > 0 ? Buffer.concat([result, trail]) : result;
};

// Decode a buffer into a string
iconv.decode = (buf, encoding, options) => {
    if (typeof buf === 'string') {
        if (!iconv.skipDecodeWarning) {
            console.error('Iconv-lite warning: decode()-ing strings is deprecated.');
            iconv.skipDecodeWarning = true;
        }
        buf = Buffer.from(String(buf || ""), "binary");
    }

    const decoder = iconv.getDecoder(encoding, options);
    const result = decoder.write(buf);
    const trail = decoder.end();

    return trail ? result + trail : result;
};

// Check if encoding exists
iconv.encodingExists = (enc) => {
    try {
        iconv.getCodec(enc);
        return true;
    } catch (e) {
        return false;
    }
};

// Encoding functions aliases
iconv.toEncoding = iconv.encode;
iconv.fromEncoding = iconv.decode;

iconv._codecDataCache = {};

// Get codec based on encoding
iconv.getCodec = (encoding) => {
    if (!iconv.encodings)
        iconv.encodings = require("../encodings");

    let enc = iconv._canonicalizeEncoding(encoding);
    const codecOptions = {};

    while (true) {
        let codec = iconv._codecDataCache[enc];
        if (codec) return codec;

        const codecDef = iconv.encodings[enc];

        switch (typeof codecDef) {
            case "string":
                enc = codecDef;
                break;
            case "object":
                Object.assign(codecOptions, codecDef);
                codecOptions.encodingName = codecOptions.encodingName || enc;
                enc = codecDef.type;
                break;
            case "function":
                codecOptions.encodingName = codecOptions.encodingName || enc;
                codec = new codecDef(codecOptions, iconv);
                iconv._codecDataCache[codecOptions.encodingName] = codec;
                return codec;
            default:
                throw new Error(`Encoding not recognized: '${encoding}' (searched as: '${enc}')`);
        }
    }
};

// Canonicalize encoding name
iconv._canonicalizeEncoding = (encoding) => (
    String(encoding).toLowerCase().replace(/:\d{4}$|[^0-9a-z]/g, "")
);

// Get encoder for encoding
iconv.getEncoder = (encoding, options) => {
    const codec = iconv.getCodec(encoding);
    let encoder = new codec.encoder(options, codec);

    if (codec.bomAware && options && options.addBOM) {
        encoder = new bomHandling.PrependBOM(encoder, options);
    }

    return encoder;
};

// Get decoder for encoding
iconv.getDecoder = (encoding, options) => {
    const codec = iconv.getCodec(encoding);
    let decoder = new codec.decoder(options, codec);

    if (codec.bomAware && !(options && options.stripBOM === false)) {
        decoder = new bomHandling.StripBOM(decoder, options);
    }

    return decoder;
};

// Enable the streaming API if the 'stream' module is present
iconv.enableStreamingAPI = (stream_module) => {
    if (iconv.supportsStreams) return;

    const streams = require("./streams")(stream_module);

    iconv.IconvLiteEncoderStream = streams.IconvLiteEncoderStream;
    iconv.IconvLiteDecoderStream = streams.IconvLiteDecoderStream;

    iconv.encodeStream = (encoding, options) => (
        new iconv.IconvLiteEncoderStream(iconv.getEncoder(encoding, options), options)
    );

    iconv.decodeStream = (encoding, options) => (
        new iconv.IconvLiteDecoderStream(iconv.getDecoder(encoding, options), options)
    );

    iconv.supportsStreams = true;
};

// Automatically enable streaming API if possible
let stream_module;
try {
    stream_module = require("stream");
} catch (e) {}

if (stream_module && stream_module.Transform) {
    iconv.enableStreamingAPI(stream_module);
} else {
    iconv.encodeStream = iconv.decodeStream = function() {
        throw new Error("iconv-lite Streaming API is not enabled. Use iconv.enableStreamingAPI(require('stream')); to enable it.");
    };
}

if ("Ā" !== "\u0100") {
    console.error("iconv-lite warning: js files use non-utf8 encoding.");
}
