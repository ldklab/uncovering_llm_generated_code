"use strict";

const { Buffer } = require("safer-buffer");
const bomHandling = require("./bom-handling");
const iconv = module.exports;

iconv.encodings = null;
iconv.defaultCharUnicode = '�';
iconv.defaultCharSingleByte = '?';

iconv.encode = (str, encoding, options) => {
    str = "" + (str || "");
    const encoder = iconv.getEncoder(encoding, options);
    const res = encoder.write(str);
    const trail = encoder.end();
    return trail && trail.length > 0 ? Buffer.concat([res, trail]) : res;
};

iconv.decode = (buf, encoding, options) => {
    if (typeof buf === 'string') {
        if (!iconv.skipDecodeWarning) {
            console.error('Iconv-lite warning: decode()-ing strings is deprecated.');
            iconv.skipDecodeWarning = true;
        }
        buf = Buffer.from("" + (buf || ""), "binary");
    }
    const decoder = iconv.getDecoder(encoding, options);
    const res = decoder.write(buf);
    const trail = decoder.end();
    return trail ? res + trail : res;
};

iconv.encodingExists = (enc) => {
    try {
        iconv.getCodec(enc);
        return true;
    } catch {
        return false;
    }
};

iconv.toEncoding = iconv.encode;
iconv.fromEncoding = iconv.decode;

iconv._codecDataCache = {};
iconv.getCodec = (encoding) => {
    if (!iconv.encodings)
        iconv.encodings = require("../encodings");
    
    let enc = iconv._canonicalizeEncoding(encoding);
    let codecOptions = {};
    
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
                codecOptions.encodingName ??= enc;
                enc = codecDef.type;
                break;
            case "function":
                codecOptions.encodingName ??= enc;
                codec = new codecDef(codecOptions, iconv);
                iconv._codecDataCache[codecOptions.encodingName] = codec;
                return codec;
            default:
                throw new Error(`Encoding not recognized: '${encoding}' (searched as: '${enc}')`);
        }
    }
};

iconv._canonicalizeEncoding = (encoding) =>
    ('' + encoding).toLowerCase().replace(/:\d{4}$|[^0-9a-z]/g, "");

iconv.getEncoder = (encoding, options) => {
    const codec = iconv.getCodec(encoding);
    let encoder = new codec.encoder(options, codec);
    if (codec.bomAware && options?.addBOM)
        encoder = new bomHandling.PrependBOM(encoder, options);
    return encoder;
};

iconv.getDecoder = (encoding, options) => {
    const codec = iconv.getCodec(encoding);
    let decoder = new codec.decoder(options, codec);
    if (codec.bomAware && !(options?.stripBOM === false))
        decoder = new bomHandling.StripBOM(decoder, options);
    return decoder;
};

iconv.enableStreamingAPI = (stream_module) => {
    if (iconv.supportsStreams) return;
    const streams = require("./streams")(stream_module);
    iconv.IconvLiteEncoderStream = streams.IconvLiteEncoderStream;
    iconv.IconvLiteDecoderStream = streams.IconvLiteDecoderStream;
    iconv.encodeStream = (encoding, options) =>
        new iconv.IconvLiteEncoderStream(iconv.getEncoder(encoding, options), options);
    iconv.decodeStream = (encoding, options) =>
        new iconv.IconvLiteDecoderStream(iconv.getDecoder(encoding, options), options);
    iconv.supportsStreams = true;
};

try {
    const stream_module = require("stream");
    if (stream_module && stream_module.Transform) {
        iconv.enableStreamingAPI(stream_module);
    } else {
        throw new Error();
    }
} catch {
    iconv.encodeStream = iconv.decodeStream = () => {
        throw new Error("iconv-lite Streaming API is not enabled. Use iconv.enableStreamingAPI(require('stream'));.");
    };
}

if ("Ā" !== "\u0100") {
    console.error("iconv-lite warning: js files use non-utf8 encoding.");
}
