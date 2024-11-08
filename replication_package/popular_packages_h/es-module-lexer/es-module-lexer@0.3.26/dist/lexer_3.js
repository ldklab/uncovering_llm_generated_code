"use strict";

exports.parse = parse;
exports.init = void 0;

const IS_LITTLE_ENDIAN = 1 === new Uint8Array(new Uint16Array([1]).buffer)[0];

function encodeString(string, memoryBufferOffset, isLittleEndian) {
    const length = string.length;
    if (isLittleEndian) {
        for (let i = 0; i < length; i++) {
            memoryBufferOffset[i] = string.charCodeAt(i);
        }
    } else {
        for (let i = 0; i < length; i++) {
            const charCode = string.charCodeAt(i);
            memoryBufferOffset[i] = (charCode & 0xFF) << 8 | charCode >>> 8;
        }
    }
}

let wasmInstance;

async function loadWebAssembly() {
    const wasmBinary = /* Base64 WASM string omitted for brevity */;
    const binaryBuffer = Buffer.from(wasmBinary, "base64");
    const module = await WebAssembly.compile(binaryBuffer);
    const { exports } = await WebAssembly.instantiate(module);
    return exports;
}

const init = loadWebAssembly().then((exports) => {
    wasmInstance = exports;
});

exports.init = init;

async function parse(inputString, marker = "@") {
    if (!wasmInstance) {
        await init;
    }
  
    const inputLength = inputString.length + 1;
    const neededMemory = (wasmInstance.__heap_base.value || wasmInstance.__heap_base) + 4 * inputLength - wasmInstance.memory.buffer.byteLength;

    if (neededMemory > 0) {
        wasmInstance.memory.grow(Math.ceil(neededMemory / 65536));
    }

    const heapAllocationPointer = wasmInstance.sa(inputLength - 1);
    encodeString(inputString, new Uint16Array(wasmInstance.memory.buffer, heapAllocationPointer, inputLength), IS_LITTLE_ENDIAN);

    if (!wasmInstance.parse()) {
        const errorOffset = wasmInstance.e();
        throw Object.assign(new Error(`Parse error ${marker}:${inputString.slice(0, errorOffset).split("\n").length}:${errorOffset - inputString.lastIndexOf("\n", errorOffset - 1)}`), { idx: errorOffset });
    }

    const structuredData = [];
    const textSegments = [];

    while (wasmInstance.ri()) {
        structuredData.push({
            s: wasmInstance.is(),
            e: wasmInstance.ie(),
            ss: wasmInstance.ss(),
            se: wasmInstance.se(),
            d: wasmInstance.id(),
        });
    }

    while (wasmInstance.re()) {
        textSegments.push(inputString.slice(wasmInstance.es(), wasmInstance.ee()));
    }

    return [structuredData, textSegments, !!wasmInstance.f()];
}
