"use strict";

// Export parse function and init variable
exports.parse = parse;
exports.init = void 0;

// Detect endianness
const isLittleEndian = 1 === new Uint8Array(new Uint16Array([1]).buffer)[0];

// Exported parse function
function parse(inputString, context = "@") {
  if (!wasmExports) {
    return init.then(() => parse(inputString));
  }

  const inputLength = inputString.length + 1;
  const memoryOffset = (wasmExports.__heap_base.value || wasmExports.__heap_base) + 4 * inputLength - wasmExports.memory.buffer.byteLength;
  
  if (memoryOffset > 0) {
    wasmExports.memory.grow(Math.ceil(memoryOffset / 65536));
  }
  
  const address = wasmExports.sa(inputLength - 1);
  (isLittleEndian ? writeToMemoryLittleEndian : writeToMemoryBigEndian)(inputString, new Uint16Array(wasmExports.memory.buffer, address, inputLength));
  
  if (!wasmExports.parse()) {
    const errorIndex = wasmExports.e();
    const lineLength = inputString.slice(0, errorIndex).split("\n").length;
    throw Object.assign(new Error(`Parse error ${context}:${lineLength}:${errorIndex - inputString.lastIndexOf("\n", errorIndex - 1)}`), { idx: errorIndex });
  }
  
  const segments = [], errors = [];
  while (wasmExports.ri()) {
    segments.push({
      s: wasmExports.is(),
      e: wasmExports.ie(),
      ss: wasmExports.ss(),
      se: wasmExports.se(),
      d: wasmExports.id()
    });
  }
  
  while (wasmExports.re()) {
    errors.push(inputString.slice(wasmExports.es(), wasmExports.ee()));
  }
  
  return [segments, errors, !!wasmExports.f()];
}

// Write as big-endian
function writeToMemoryBigEndian(inputString, memory) {
  const length = inputString.length;
  for (let i = 0; i < length; i++) {
    const charCode = inputString.charCodeAt(i);
    memory[i] = (charCode & 255) << 8 | charCode >>> 8;
  }
}

// Write as little-endian
function writeToMemoryLittleEndian(inputString, memory) {
  const length = inputString.length;
  for (let i = 0; i < length; i++) {
    memory[i] = inputString.charCodeAt(i);
  }
}

let wasmExports;

// WebAssembly initialization
const init = WebAssembly.compile(
  typeof atob === "function"
    ? Uint8Array.from(atob(
      "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"
    ), char => char.charCodeAt(0))
    : Buffer.from(
      "AGFzbQEAAAABWAxgAX8Bf2AEf39/fwBgAn9/AGAAAX9gAABgBn9/f39/fwF/YAR/f39/AX9gA39/fwF/YAd/f39/f39/AX9gBX9/f39/AX9gAn9/AX9gCH9/f39/f39/AX8DLy4AAQIDAwMDAwMDAwMDAwAEBAAFBAQAAAAABAQEBAQABQYHCAkKCwMCAAAKAwgLBAUBcAEBAQUDAQABBg8CfwFB8PAAC38AQfDwAAsHWg8GbWVtb3J5AgACc2EAAAFlAAMCaXMABAJpZQAFAnNzAAYCc2UABwJpZAAIAmVzAAkCZWUACgJyaQALAnJlAAwBZgANBXBhcnNlAA4LX19oZWFwX2Jhc2UDAQqjMy5oAQF/QQAgADYCtAhBACgCkAgiASAAQQF0aiIAQQA7AQBBACAAQQJqIgA2ArgIQQAgADYCvAhBAEEANgKUCEEAQQA2AqQIQQBBADYCnAhBAEEANgKYCEEAQQA2AqwIQQBBADYCoAggAQudAQECf0EAKAKkCCIEQRRqQZQIIAQbQQAoArwIIgU2AgBBACAFNgKkCEEAIAQ2AqgIQQAgBUEYajYCvAggBSAANgIIAkACQEEAKAKICCADRw0AIAUgAjYCDAwBCwJAQQAoAoQIIANHDQAgBSACQQJqNgIMDAELIAVBACgCkAg2AgwLIAVBADYCFCAFIAM2AhAgBSACNgIEIAUgATYCAAtIAQF/QQAoAqwIIgJBCGpBmAggAhtBACgCvAgiAjYCAEEAIAI2AqwIQQAgAkEMajYCvAggAkEANgIIIAIgATYCBCACIAA2AgALCABBACgCwAgLFQBBACgCnAgoAgBBACgCkAhrQQF1CxUAQQAoApwIKAIEQQAoApAIa0EBdQsVAEEAKAKcCCgCCEEAKAKQCGtBAXULFQBBACgCnAgoAgxBACgCkAhrQQF1CzsBAX8CQEEAKAKcCCgCECIAQQAoAoQIRw0AQX8PCwJAIABBACgCiAhHDQBBfg8LIABBACgCkAhrQQF1CxUAQQAoAqAIKAIAQQAoApAIa0EBdQsVAEEAKAKgCCgCBEEAKAKQCGtBAXULJQEBf0EAQQAoApwIIgBBFGpBlAggABsoAgAiADYCnAggAEEARwslAQF/QQBBACgCoAgiAEEIakGYCCAAGygCACIANgKgCCAAQQBHCwgAQQAtAMQIC4UMAQV/IwBBgPAAayIBJABBAEEBOgDECEEAQf//AzsByghBAEEAKAKMCDYCzAhBAEEAKAKQCEF+aiICNgLgCEEAIAJBACgCtAhBAXRqIgM2AuQIQQBBADsBxghBAEEAOwHICEEAQQA6ANAIQQBBADYCwAhBAEEAOgCwCEEAIAFBgNAAajYC1AhBACABQYAQajYC2AhBAEEAOgDcCAJAAkACQANAQQAgAkECaiIENgLgCAJAAkACQAJAIAIgA08NACAELwEAIgNBd2pBBUkNAyADQZt/aiIFQQRNDQEgA0EgRg0DAkAgA0EvRg0AIANBO0YNAwwGCwJAIAIvAQQiBEEqRg0AIARBL0cNBhAPDAQLEBAMAwtBACEDIAQhAkEALQCwCA0GDAULAkACQCAFDgUBBQUFAAELIAQQEUUNASACQQRqQe0AQfAAQe8AQfIAQfQAEBJFDQEQEwwBC0EALwHICA0AIAQQEUUNACACQQRqQfgAQfAAQe8AQfIAQfQAEBJFDQAQFEEALQDECA0AQQBBACgC4AgiAjYCzAgMBAtBAEEAKALgCDYCzAgLQQAoAuQIIQNBACgC4AghAgwACwtBACACNgLgCEEAQQA6AMQICwNAQQAgAkECaiIDNgLgCAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQCACQQAoAuQITw0AIAMvAQAiBEF3akEFSQ0OIARBYGoiBUEJTQ0BIARBoH9qIgVBCU0NAgJAAkACQCAEQYV/aiIDQQJNDQAgBEEvRw0QIAIvAQQiAkEqRg0BIAJBL0cNAhAPDBELAkACQCADDgMAEQEACwJAQQAoAswIIgQvAQBBKUcNAEEAKAKkCCICRQ0AIAIoAgQgBEcNAEEAQQAoAqgIIgI2AqQIAkAgAkUNACACQQA2AhQMAQtBAEEANgKUCAsgAUEALwHICCICakEALQDcCDoAAEEAIAJBAWo7AcgIQQAoAtgIIAJBAnRqIAQ2AgBBAEEAOgDcCAwQC0EALwHICCICRQ0JQQAgAkF/aiIDOwHICAJAIAJBAC8ByggiBEcNAEEAQQAvAcYIQX9qIgI7AcYIQQBBACgC1AggAkH//wNxQQF0ai8BADsByggMCAsgBEH//wNGDQ8gA0H//wNxIARJDQkMDwsQEAwPCwJAAkACQAJAQQAoAswIIgQvAQAiAhAVRQ0AIAJBVWoiA0EDSw0CAkACQAJAIAMOBAEFAgABCyAEQX5qLwEAQVBqQf//A3FBCkkNAwwECyAEQX5qLwEAQStGDQIMAwsgBEF+ai8BAEEtRg0BDAILAkAgAkH9AEYNACACQSlHDQFBACgC2AhBAC8ByAhBAnRqKAIAEBZFDQEMAgtBACgC2AhBAC8ByAgiA0ECdGooAgAQFw0BIAEgA2otAAANAQsgBBAYDQAgAkUNAEEBIQQgAkEvRkEALQDQCEEAR3FFDQELEBlBACEEC0EAIAQ6ANAIDA0LQQAvAcoIQf//A0ZBAC8ByAhFcUEALQCwCEVxIQMMDwsgBQ4KDAsBCwsLCwIHBAwLIAUOCgIKCgcKCQoKCggCCxAaDAkLEBsMCAsQHAwHC0EALwHICCICDQELEB1BACEDDAgLQQAgAkF/aiIEOwHICEEAKAKkCCICRQ0EIAIoAhBBACgC2AggBEH//wNxQQJ0aigCAEcNBCACIAM2AgQMBAtBAEEALwHICCICQQFqOwHICEEAKALYCCACQQJ0akEAKALMCDYCAAwDCyADEBFFDQIgAi8BCkHzAEcNAiACLwEIQfMARw0CIAIvAQZB4QBHDQIgAi8BBEHsAEcNAgJAAkAgAi8BDCIEQXdqIgJBF0sNAEEBIAJ0QZ+AgARxDQELIARBoAFHDQMLQQBBAToA3AgMAgsgAxARRQ0BIAJBBGpB7QBB8ABB7wBB8gBB9AAQEkUNARATDAELQQAvAcgIDQAgAxARRQ0AIAJBBGpB+ABB8ABB7wBB8gBB9AAQEkUNABAUC0EAQQAoAuAINgLMCAtBACgC4AghAgwACwsgAUGA8ABqJAAgAwtQAQR/QQAoAuAIQQJqIQBBACgC5AghAQJAA0AgACICQX5qIAFPDQEgAkECaiEAIAIvAQBBdmoiA0EDSw0AIAMOBAEAAAEBCwtBACACNgLgCAt3AQJ/QQBBACgC4AgiAEECajYC4AggAEEGaiEAQQAoAuQIIQEDQAJAAkACQCAAQXxqIAFPDQAgAEF+ai8BAEEqRw0CIAAvAQBBL0cNAkEAIABBfmo2AuAIDAELIABBfmohAAtBACAANgLgCA8LIABBAmohAAwACwsdAAJAQQAoApAIIABHDQBBAQ8LIABBfmovAQAQHgs/AQF/QQAhBgJAIAAvAQggBUcNACAALwEGIARHDQAgAC8BBCADRw0AIAAvAQIgAkcNACAALwEAIAFGIQYLIAYL6QIBBH9BAEEAKALgCCIAQQxqIgE2AuAIAkACQAJAAkACQBAmIgJBWWoiA0EHTQ0AIAJBIkYNAiACQfsARg0CDAELAkACQCADDggDAQIDAgICAAMLQQBBACgC4AhBAmo2AuAIECZB7QBHDQNBACgC4AgiAy8BBkHhAEcNAyADLwEEQfQARw0DIAMvAQJB5QBHDQNBACgCzAgvAQBBLkYNAyAAIAAgA0EIakEAKAKICBABDwtBACgC2AhBAC8ByAgiA0ECdGogADYCAEEAIANBAWo7AcgIQQAoAswILwEAQS5GDQIgAEEAKALgCEECakEAIAAQAQ8LQQAoAuAIIAFGDQELQQAvAcgIDQFBACgC4AghA0EAKALkCCEBAkADQCADIAFPDQECQAJAIAMvAQAiAkEnRg0AIAJBIkcNAQsgACACECcPC0EAIANBAmoiAzYC4AgMAAsLEB0LDwtBAEEAKALgCEF+ajYC4AgLiAYBBH9BAEEAKALgCCIAQQxqIgE2AuAIECYhAgJAAkACQAJAAkACQEEAKALgCCIDIAFHDQAgAhAoRQ0BCwJAAkACQAJAIAJBn39qIgFBC00NAAJAAkAgAkEqRg0AIAJB9gBGDQUgAkH7AEcNA0EAIANBAmo2AuAIECYhA0EAKALgCCEBA0AgA0H//wNxECkaQQAoAuAIIQIQJhoCQCABIAIQKiIDQSxHDQBBAEEAKALgCEECajYC4AgQJiEDC0EAKALgCCECAkAgA0H9AEYNACACIAFGDQwgAiEBIAJBACgC5AhNDQEMDAsLQQAgAkECajYC4AgMAQtBACADQQJqNgLgCBAmGkEAKALgCCICIAIQKhoLECYhAgwBCyABDgwEAAEGAAUAAAAAAAIEC0EAKALgCCEDAkAgAkHmAEcNACADLwEGQe0ARw0AIAMvAQRB7wBHDQAgAy8BAkHyAEcNAEEAIANBCGo2AuAIIAAQJhAnDwtBACADQX5qNgLgCAwCCwJAIAMvAQhB8wBHDQAgAy8BBkHzAEcNACADLwEEQeEARw0AIAMvAQJB7ABHDQAgAy8BChAeRQ0AQQAgA0EKajYC4AgQJiECQQAoAuAIIQMgAhApGiADQQAoAuAIEAJBAEEAKALgCEF+ajYC4AgPC0EAIANBBGoiAzYC4AgLQQAgA0EEaiICNgLgCEEAQQA6AMQIA0BBACACQQJqNgLgCBAmIQJBACgC4AghAwJAAkAgAhApIgJBPUYNACACQfsARg0AIAJB2wBHDQELQQBBACgC4AhBfmo2AuAIDwtBACgC4AgiAiADRg0BIAMgAhACECYhA0EAKALgCCECIANBLEYNAAtBACACQX5qNgLgCA8LDwtBACADQQpqNgLgCBAmGkEAKALgCCEDC0EAIANBEGo2AuAIAkAQJiICQSpHDQBBAEEAKALgCEECajYC4AgQJiECC0EAKALgCCEDIAIQKRogA0EAKALgCBACQQBBACgC4AhBfmo2AuAIDwsgAyADQQ5qEAIPCxAdC3UBAX8CQAJAIABBX2oiAUEFSw0AQQEgAXRBMXENAQsgAEFGakH//wNxQQZJDQAgAEFYakH//wNxQQdJIABBKUdxDQACQCAAQaV/aiIBQQNLDQAgAQ4EAQAAAQELIABB/QBHIABBhX9qQf//A3FBBElxDwtBAQs9AQF/QQEhAQJAIABB9wBB6ABB6QBB7ABB5QAQHw0AIABB5gBB7wBB8gAQIA0AIABB6QBB5gAQISEBCyABC60BAQN/QQEhAQJAAkACQAJAAkACQAJAIAAvAQAiAkFFaiIDQQNNDQAgAkGbf2oiA0EDTQ0BIAJBKUYNAyACQfkARw0CIABBfmpB5gBB6QBB7gBB4QBB7ABB7AAQIg8LIAMOBAIBAQUCCyADDgQCAAADAgtBACEBCyABDwsgAEF+akHlAEHsAEHzABAgDwsgAEF+akHjAEHhAEH0AEHjABAjDwsgAEF+ai8BAEE9RgvtAwECf0EAIQECQCAALwEAQZx/aiICQRNLDQACQAJAAkACQAJAAkACQAJAIAIOFAABAggICAgICAgDBAgIBQgGCAgHAAsgAEF+ai8BAEGXf2oiAkEDSw0HAkACQCACDgQACQkBAAsgAEF8akH2AEHvABAhDwsgAEF8akH5AEHpAEHlABAgDwsgAEF+ai8BAEGNf2oiAkEBSw0GAkACQCACDgIAAQALAkAgAEF8ai8BACICQeEARg0AIAJB7ABHDQggAEF6akHlABAkDwsgAEF6akHjABAkDwsgAEF8akHkAEHlAEHsAEHlABAjDwsgAEF+ai8BAEHvAEcNBSAAQXxqLwEAQeUARw0FAkAgAEF6ai8BACICQfAARg0AIAJB4wBHDQYgAEF4akHpAEHuAEHzAEH0AEHhAEHuABAiDwsgAEF4akH0AEH5ABAhDwtBASEBIABBfmoiAEHpABAkDQQgAEHyAEHlAEH0AEH1AEHyABAfDwsgAEF+akHkABAkDwsgAEF+akHkAEHlAEHiAEH1AEHnAEHnAEHlABAlDwsgAEF+akHhAEH3AEHhAEHpABAjDwsCQCAAQX5qLwEAIgJB7wBGDQAgAkHlAEcNASAAQXxqQe4AECQPCyAAQXxqQfQAQegAQfIAECAhAQsgAQuDAQEDfwNAQQBBACgC4AgiAEECaiIBNgLgCAJAAkACQCAAQQAoAuQITw0AIAEvAQAiAUGlf2oiAkEBTQ0CAkAgAUF2aiIAQQNNDQAgAUEvRw0EDAILIAAOBAADAwAACxAdCw8LAkACQCACDgIBAAELQQAgAEEEajYC4AgMAQsQKxoMAAsLkQEBBH9BACgC4AghAEEAKALkCCEBAkADQCAAIgJBAmohACACIAFPDQECQCAALwEAIgNB3ABGDQACQCADQXZqIgJBA00NACADQSJHDQJBACAANgLgCA8LIAIOBAIBAQICCyACQQRqIQAgAi8BBEENRw0AIAJBBmogACACLwEGQQpGGyEADAALC0EAIAA2AuAIEB0LkQEBBH9BACgC4AghAEEAKALkCCEBAkADQCAAIgJBAmohACACIAFPDQECQCAALwEAIgNB3ABGDQACQCADQXZqIgJBA00NACADQSdHDQJBACAANgLgCA8LIAIOBAIBAQICCyACQQRqIQAgAi8BBEENRw0AIAJBBmogACACLwEGQQpGGyEADAALC0EAIAA2AuAIEB0LyQEBBX9BACgC4AghAEEAKALkCCEBA0AgACICQQJqIQACQAJAIAIgAU8NACAALwEAIgNBpH9qIgRBBE0NASADQSRHDQIgAi8BBEH7AEcNAkEAQQAvAcYIIgBBAWo7AcYIQQAoAtQIIABBAXRqQQAvAcoIOwEAQQAgAkEEajYC4AhBAEEALwHICEEBaiIAOwHKCEEAIAA7AcgIDwtBACAANgLgCBAdDwsCQAJAIAQOBQECAgIAAQtBACAANgLgCA8LIAJBBGohAAwACws1AQF/QQBBAToAsAhBACgC4AghAEEAQQAoAuQIQQJqNgLgCEEAIABBACgCkAhrQQF1NgLACAs0AQF/QQEhAQJAIABBd2pB//8DcUEFSQ0AIABBgAFyQaABRg0AIABBLkcgABAocSEBCyABC0kBA39BACEGAkAgAEF4aiIHQQAoApAIIghJDQAgByABIAIgAyAEIAUQEkUNAAJAIAcgCEcNAEEBDwsgAEF2ai8BABAeIQYLIAYLWQEDf0EAIQQCQCAAQXxqIgVBACgCkAgiBkkNACAALwEAIANHDQAgAEF+ai8BACACRw0AIAUvAQAgAUcNAAJAIAUgBkcNAEEBDwsgAEF6ai8BABAeIQQLIAQLTAEDf0EAIQMCQCAAQX5qIgRBACgCkAgiBUkNACAALwEAIAJHDQAgBC8BACABRw0AAkAgBCAFRw0AQQEPCyAAQXxqLwEAEB4hAwsgAwtLAQN/QQAhBwJAIABBdmoiCEEAKAKQCCIJSQ0AIAggASACIAMgBCAFIAYQLEUNAAJAIAggCUcNAEEBDwsgAEF0ai8BABAeIQcLIAcLZgEDf0EAIQUCQCAAQXpqIgZBACgCkAgiB0kNACAALwEAIARHDQAgAEF+ai8BACADRw0AIABBfGovAQAgAkcNACAGLwEAIAFHDQACQCAGIAdHDQBBAQ8LIABBeGovAQAQHiEFCyAFCz0BAn9BACECAkBBACgCkAgiAyAASw0AIAAvAQAgAUcNAAJAIAMgAEcNAEEBDwsgAEF+ai8BABAeIQILIAILTQEDf0EAIQgCQCAAQXRqIglBACgCkAgiCkkNACAJIAEgAiADIAQgBSAGIAcQLUUNAAJAIAkgCkcNAEEBDwsgAEFyai8BABAeIQgLIAgLdgEDf0EAKALgCCEAAkADQAJAIAAvAQAiAUF3akEFSQ0AIAFBIEYNACABQaABRg0AIAFBL0cNAgJAIAAvAQIiAEEqRg0AIABBL0cNAxAPDAELEBALQQBBACgC4AgiAkECaiIANgLgCCACQQAoAuQISQ0ACwsgAQtYAAJAAkAgAUEiRg0AIAFBJ0cNAUEAKALgCCEBEBsgACABQQJqQQAoAuAIQQAoAoQIEAEPC0EAKALgCCEBEBogACABQQJqQQAoAuAIQQAoAoQIEAEPCxAdC2gBAn9BASEBAkACQCAAQV9qIgJBBUsNAEEBIAJ0QTFxDQELIABB+P8DcUEoRg0AIABBRmpB//8DcUEGSQ0AAkAgAEGlf2oiAkEDSw0AIAJBAUcNAQsgAEGFf2pB//8DcUEESSEBCyABC20BAn8CQAJAA0ACQCAAQf//A3EiAUF3aiICQRdLDQBBASACdEGfgIAEcQ0CCyABQaABRg0BIAAhAiABECgNAkEAIQJBAEEAKALgCCIAQQJqNgLgCCAALwECIgANAAwCCwsgACECCyACQf//A3ELXAECfwJAQQAoAuAIIgIvAQAiA0HhAEcNAEEAIAJBBGo2AuAIECYhAkEAKALgCCEAIAIQKRpBACgC4AghARAmIQNBACgC4AghAgsCQCACIABGDQAgACABEAILIAMLiQEBBX9BACgC4AghAEEAKALkCCEBA38gAEECaiECAkACQCAAIAFPDQAgAi8BACIDQaR/aiIEQQFNDQEgAiEAIANBdmoiA0EDSw0CIAIhACADDgQAAgIAAAtBACACNgLgCBAdQQAPCwJAAkAgBA4CAQABC0EAIAI2AuAIQd0ADwsgAEEEaiEADAALC0kBAX9BACEHAkAgAC8BCiAGRw0AIAAvAQggBUcNACAALwEGIARHDQAgAC8BBCADRw0AIAAvAQIgAkcNACAALwEAIAFGIQcLIAcLUwEBf0EAIQgCQCAALwEMIAdHDQAgAC8BCiAGRw0AIAAvAQggBUcNACAALwEGIARHDQAgAC8BBCADRw0AIAAvAQIgAkcNACAALwEAIAFGIQgLIAgL"
    , "base64"))
).then(WebAssembly.instantiate).then(({exports}) => {
  wasmExports = exports;
});

exports.init = init;

var wasmExports;