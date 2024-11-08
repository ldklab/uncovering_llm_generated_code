"use strict";

exports.parse = parse;
exports.init = void 0;

// Check if the system is little-endian
const isLittleEndian = 1 === new Uint8Array(new Uint16Array([1]).buffer)[0];

let wasmExports;

// WebAssembly initialization
const init = WebAssembly.compile(
  Uint8Array.from(
    typeof atob === "function"
      ? atob("AGFzbQEAAAABWAxgAX8Bf2AEf39/fwBgAn9/AGAAAX9gAABgBn9/f39/fwF/YAR/f39/AX8...")
      : Buffer.from("AGFzbQEAAAABWAxgAX8Bf2AEf39/fwBgAn9/AGAAAX9gAABgBn9/f39/fwF/YAR/f39/AX8...", "base64"),
    char => char.charCodeAt(0)
  )
).then(WebAssembly.instantiate).then(({ exports }) => {
  wasmExports = exports;
});

exports.init = init;

function parse(input, locationHint = "@") {
  if (!wasmExports) {
    // If WebAssembly not ready, initialize and retry
    return init.then(() => parse(input));
  }

  const inputLength = input.length + 1;
  const memoryOffset = (wasmExports.__heap_base.value || wasmExports.__heap_base) + 4 * inputLength - wasmExports.memory.buffer.byteLength;

  // Grow memory as needed
  if (memoryOffset > 0) {
    wasmExports.memory.grow(Math.ceil(memoryOffset / 65536));
  }

  // Allocate memory for the input
  const inputPointer = wasmExports.sa(inputLength - 1);

  // Write the input into memory, considering system endianness
  (isLittleEndian ? writeLE : writeBE)(input, new Uint16Array(wasmExports.memory.buffer, inputPointer, inputLength));

  // Execute parsing using the WebAssembly module
  if (!wasmExports.parse()) {
    const errorPosition = wasmExports.e();
    const errorLine = input.slice(0, errorPosition).split("\n").length;
    throw Object.assign(new Error(`Parse error ${locationHint}:${errorLine}:${errorPosition - input.lastIndexOf("\n", errorPosition - 1)}`), { idx: errorPosition });
  }

  // Collect parse results
  const segments = [], remnants = [];
  while (wasmExports.ri()) {
    segments.push({ s: wasmExports.is(), e: wasmExports.ie(), ss: wasmExports.ss(), se: wasmExports.se(), d: wasmExports.id() });
  }
  while (wasmExports.re()) {
    remnants.push(input.slice(wasmExports.es(), wasmExports.ee()));
  }

  return [segments, remnants, !!wasmExports.f()];
}

// Copy input string to memory in little-endian order
function writeLE(input, memoryArray) {
  let i = 0;
  while (i < input.length) {
    const code = input.charCodeAt(i);
    memoryArray[i] = code;
    i++;
  }
}

// Copy input string to memory in big-endian order
function writeBE(input, memoryArray) {
  let i = 0;
  while (i < input.length) {
    const code = input.charCodeAt(i);
    memoryArray[i] = ((code & 255) << 8) | (code >>> 8);
    i++;
  }
}
