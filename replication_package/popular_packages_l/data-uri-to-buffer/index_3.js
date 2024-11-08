typescript
export interface ParsedDataURI {
    type: string;
    typeFull: string;
    charset: string;
    buffer: ArrayBuffer;
}

export function dataUriToBuffer(uri: string | URL): ParsedDataURI {
    uri = typeof uri === 'string' ? uri : uri.toString();

    const pattern = /^data:([^,]*?),([^#]*)/;
    const matches = pattern.exec(uri);
    if (!matches) throw new Error('Invalid data URI');

    const mediaType = matches[1] || '';
    const data = matches[2];

    const isBase64 = /;\s*base64\s*(;|$)/i.test(mediaType);

    let type = 'text/plain';
    let typeFull = 'text/plain;charset=US-ASCII';
    let charset = 'US-ASCII';

    if (mediaType) {
        typeFull = mediaType;
        const parts = mediaType.split(';');
        type = parts[0] || type;
        const charsetPart = parts.find(part => /charset=/i.test(part));
        if (charsetPart) {
            charset = charsetPart.split('=')[1] || charset;
        }
    }

    const buffer = isBase64 ? base64ToArrayBuffer(data) : textToArrayBuffer(decodeURIComponent(data));

    if (!/charset=/i.test(mediaType)) {
        charset = '';
    }

    return { type, typeFull, charset, buffer };
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryStr = atob(base64);
    const len = binaryStr.length;
    const bytes = new Uint8Array(len);

    for (let i = 0; i < len; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
    }

    return bytes.buffer;
}

function textToArrayBuffer(text: string): ArrayBuffer {
    const encoder = new TextEncoder();
    return encoder.encode(text).buffer;
}
