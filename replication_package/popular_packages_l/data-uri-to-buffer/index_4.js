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

    const [ , mediaType = '', data = '' ] = matches;
    const isBase64 = /;\s*base64\s*(?:;|$)/i.test(mediaType);

    let type = 'text/plain';
    let typeFull = 'text/plain;charset=US-ASCII';
    let charset = 'US-ASCII';

    if (mediaType) {
        typeFull = mediaType;
        const [typeCandidate, ...params] = mediaType.split(';');
        type = typeCandidate || type;

        params.forEach(param => {
            if (param.includes('charset=')) {
                charset = param.split('=')[1];
            }
        });
    }

    const buffer = isBase64 
        ? base64ToArrayBuffer(data) 
        : textToArrayBuffer(decodeURIComponent(data));

    if (!/charset=/.test(typeFull)) {
        charset = '';
    }

    return { type, typeFull, charset, buffer };
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);

    for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
    }

    return bytes.buffer;
}

function textToArrayBuffer(text: string): ArrayBuffer {
    return new TextEncoder().encode(text).buffer;
}
