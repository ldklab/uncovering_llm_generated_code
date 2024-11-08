"use strict";

const { Buffer } = require("safer-buffer");
const bomHandling = require("./bom-handling");
const iconv = module.exports;

iconv.encodings = null;
iconv.defaultCharUnicode = '�';
iconv.defaultCharSingleByte = '?';

iconv.encode = function(str, encoding, options) {
    str = "" + (str || "");

    const encoder = iconv.getEncoder(encoding, options);
    const res = encoder.write(str);
    const trail = encoder.end();
    
    return (trail && trail.length > 0) ? Buffer.concat([res, trail]) : res;
};

iconv.decode = function(buf, encoding, options) {
    if (typeof buf === 'string') {
        if (!iconv.skipDecodeWarning) {
            console.error('Iconv-lite warning: decode()-ing strings is deprecated. Refer to https://github.com/ashtuchkin/iconv-lite/wiki/Use-Buffers-when-decoding');
            iconv.skipDecodeWarning = true;
        }

        buf = Buffer.from("" + (buf || ""), "binary");
    }

    const decoder = iconv.getDecoder(encoding, options);
    const res = decoder.write(buf);
    const trail = decoder.end();

    return trail ? (res + trail) : res;
};

iconv.encodingExists = function(enc) {
    try {
        iconv.getCodec(enc);
        return true;
    } catch (e) {
        return false;
    }
};

iconv.toEncoding = iconv.encode;
iconv.fromEncoding = iconv.decode;

iconv._codecDataCache = {};
iconv.getCodec = function(encoding) {
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
                if (!codecOptions.encodingName)
                    codecOptions.encodingName = enc;
                
                enc = codecDef.type;
                break;

            case "function":
                if (!codecOptions.encodingName)
                    codecOptions.encodingName = enc;

                codec = new codecDef(codecOptions, iconv);
                iconv._codecDataCache[codecOptions.encodingName] = codec;
                return codec;

            default:
                throw new Error(`Encoding not recognized: '${encoding}' (searched as: '${enc}')`);
        }
    }
};

iconv._canonicalizeEncoding = function(encoding) {
    return ('' + encoding).toLowerCase().replace(/:\d{4}$|[^0-9a-z]/g, "");
};

iconv.getEncoder = function(encoding, options) {
    const codec = iconv.getCodec(encoding);
    let encoder = new codec.encoder(options, codec);

    if (codec.bomAware && options && options.addBOM)
        encoder = new bomHandling.PrependBOM(encoder, options);

    return encoder;
};

iconv.getDecoder = function(encoding, options) {
    const codec = iconv.getCodec(encoding);
    let decoder = new codec.decoder(options, codec);

    if (codec.bomAware && !(options && options.stripBOM === false))
        decoder = new bomHandling.StripBOM(decoder, options);

    return decoder;
};

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

if ("Ā" != "\u0100") {
    console.error("iconv-lite warning: js files use non-utf8 encoding. See https://github.com/ashtuchkin/iconv-lite/wiki/Javascript-source-file-encodings for more info.");
}
