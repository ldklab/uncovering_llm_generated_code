typescript
export interface ParsedDataURI {
    type: string;
    typeFull: string;
    charset: string;
    buffer: ArrayBuffer;
}

export function dataUriToBuffer(uri: string | URL): ParsedDataURI {
    if (typeof uri === 'object') {
        uri = uri.toString();
    }

    const matches = /^data:([^,]*?),?([^#]*)/.exec(uri);
    if (!matches) throw new Error('Invalid data URI');

    const mediaType = matches[1];
    const data = matches[2];

    const isBase64 = /;\s*base64\s*(?:;|$)/i.test(mediaType);

    let type = 'text/plain';
    let typeFull = 'text/plain;charset=US-ASCII';
    let charset = 'US-ASCII';

    if (mediaType) {
        typeFull = mediaType;
        const mediaTypeParts = mediaType.split(';');
        type = mediaTypeParts[0] || type;

        for (const part of mediaTypeParts.slice(1)) {
            if (part.toLowerCase().startsWith('charset=')) {
                charset = part.split('=')[1];
            }
        }
    }

    const buffer = isBase64 ? base64ToArrayBuffer(data) : textToArrayBuffer(decodeURIComponent(data));

    if (!mediaType || (mediaType && !/charset=/i.test(mediaType))) {
        charset = '';
    }

    return { type, typeFull, charset, buffer };
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const length = binaryString.length;
    const bytes = new Uint8Array(length);

    for (let i = 0; i < length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }

    return bytes.buffer;
}

function textToArrayBuffer(text: string): ArrayBuffer {
    const encoder = new TextEncoder();
    return encoder.encode(text).buffer;
}
