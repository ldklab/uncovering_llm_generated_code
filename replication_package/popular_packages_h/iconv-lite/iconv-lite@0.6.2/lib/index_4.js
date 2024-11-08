"use strict";

const { Buffer } = require("safer-buffer");

const bomHandling = require("./bom-handling");
const iconv = module.exports;

// Default character for errors and encoding/decoding
iconv.defaultCharUnicode = '�';
iconv.defaultCharSingleByte = '?';

// Placeholder for encodings
iconv.encodings = null;

// Encode string to Buffer using specified encoding
iconv.encode = function(str, encoding, options) {
    str = String(str);
    const encoder = iconv.getEncoder(encoding, options);
    const res = encoder.write(str);
    const trail = encoder.end();
    return trail && trail.length > 0 ? Buffer.concat([res, trail]) : res;
};

// Decode Buffer to string using specified encoding
iconv.decode = function(buf, encoding, options) {
    if (typeof buf === 'string') {
        if (!iconv.skipDecodeWarning) {
            console.error('Iconv-lite warning: decode()-ing strings is deprecated.');
            iconv.skipDecodeWarning = true;
        }
        buf = Buffer.from(String(buf || ""), "binary");
    }
    const decoder = iconv.getDecoder(encoding, options);
    const res = decoder.write(buf);
    const trail = decoder.end();
    return trail ? res + trail : res;
};

// Check if Encoding exists
iconv.encodingExists = function(enc) {
    try {
        iconv.getCodec(enc);
        return true;
    } catch (e) {
        return false;
    }
};

// Aliases
iconv.toEncoding = iconv.encode;
iconv.fromEncoding = iconv.decode;

// Cache Codec Data
iconv._codecDataCache = {};
iconv.getCodec = function(encoding) {
    if (!iconv.encodings) iconv.encodings = require("../encodings");
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
                if (!codecOptions.encodingName) codecOptions.encodingName = enc;
                enc = codecDef.type;
                break;
            case "function":
                if (!codecOptions.encodingName) codecOptions.encodingName = enc;
                codec = new codecDef(codecOptions, iconv);
                iconv._codecDataCache[codecOptions.encodingName] = codec;
                return codec;
            default:
                throw new Error(`Encoding not recognized: '${encoding}' (searched as: '${enc}')`);
        }
    }
};

// Canonicalize Encoding
iconv._canonicalizeEncoding = function(encoding) {
    return ('' + encoding).toLowerCase().replace(/:\d{4}$|[^0-9a-z]/g, "");
};

// Get Encoder
iconv.getEncoder = function(encoding, options) {
    const codec = iconv.getCodec(encoding);
    let encoder = new codec.encoder(options, codec);
    if (codec.bomAware && options && options.addBOM) {
        encoder = new bomHandling.PrependBOM(encoder, options);
    }
    return encoder;
};

// Get Decoder
iconv.getDecoder = function(encoding, options) {
    const codec = iconv.getCodec(encoding);
    let decoder = new codec.decoder(options, codec);
    if (codec.bomAware && !(options && options.stripBOM === false)) {
        decoder = new bomHandling.StripBOM(decoder, options);
    }
    return decoder;
};

// Enable Streaming API
iconv.enableStreamingAPI = function(stream_module) {
    if (iconv.supportsStreams) return;

    const streams = require("./streams")(stream_module);

    iconv.IconvLiteEncoderStream = streams.IconvLiteEncoderStream;
    iconv.IconvLiteDecoderStream = streams.IconvLiteDecoderStream;

    iconv.encodeStream = function(encoding, options) {
        return new iconv.IconvLiteEncoderStream(iconv.getEncoder(encoding, options), options);
    };

    iconv.decodeStream = function(encoding, options) {
        return new iconv.IconvLiteDecoderStream(iconv.getDecoder(encoding, options), options);
    };

    iconv.supportsStreams = true;
};

// Attempt to enable Streaming API
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

// Warn about non-UTF-8 encoding usage
if ("Ā" !== "\u0100") {
    console.error("iconv-lite warning: js files use non-utf8 encoding.");
}
