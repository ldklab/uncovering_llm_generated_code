typescript
export interface ParsedDataURI {
    type: string;
    typeFull: string;
    charset: string;
    buffer: ArrayBuffer;
}

export function dataUriToBuffer(uri: string | URL): ParsedDataURI {
    const uriStr = typeof uri === 'object' ? uri.toString() : uri;

    const matches = uriStr.match(/^data:([^,]*?),?([^#]*)/);
    if (!matches) throw new Error('Invalid data URI');

    const [_, mediaType = '', data = ''] = matches;
    const isBase64 = /;\s*base64\s*(?:;|$)/i.test(mediaType);

    let type = 'text/plain';
    let typeFull = 'text/plain;charset=US-ASCII';
    let charset = 'US-ASCII';

    if (mediaType) {
        typeFull = mediaType;
        const mediaTypeParts = mediaType.split(';');
        type = mediaTypeParts[0] || type;

        mediaTypeParts.slice(1).forEach(part => {
            if (part.startsWith('charset=')) charset = part.split('=')[1];
        });
    }

    const buffer = isBase64 ? base64ToArrayBuffer(data) : textToArrayBuffer(decodeURIComponent(data));
    if (!mediaType || !/charset=/i.test(mediaType)) charset = '';

    return { type, typeFull, charset, buffer };
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

function textToArrayBuffer(text: string): ArrayBuffer {
    return new TextEncoder().encode(text).buffer;
}
