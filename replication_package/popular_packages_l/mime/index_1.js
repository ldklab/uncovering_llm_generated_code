// mime.js
import mimeDb from 'mime-db';

class Mime {
  constructor(...typeMaps) {
    this.types = {};
    this.extensions = {};

    typeMaps.forEach(typeMap => this.define(typeMap));
  }

  define(typeMap, force = false) {
    for (const type in typeMap) {
      const exts = typeMap[type];
      if (!Array.isArray(exts)) throw new TypeError('Expected array of extensions');

      this.types[type] = exts[0];
      exts.forEach(ext => {
        if (!this.extensions[ext] || force) {
          this.extensions[ext] = type;
        } else {
          throw new Error(`Extension ${ext} is already defined`);
        }
      });
    }
  }

  getType(pathOrExtension) {
    const extension = pathOrExtension.split('.').pop().toLowerCase();
    return this.extensions[extension] || null;
  }

  getExtension(type) {
    return this.types[type.split(';')[0]] || null;
  }

  getAllExtensions(type) {
    const cleanType = type.split(';')[0];
    return new Set(Object.entries(this.extensions)
      .filter(([_, mimeType]) => mimeType === cleanType)
      .map(([ext, _]) => ext));
  }
}

const standardTypes = {};
const otherTypes = {};

for (const type in mimeDb) {
  const entry = mimeDb[type];
  if (entry.extensions) {
    standardTypes[type] = entry.extensions;
  }
}

const defaultMime = new Mime(standardTypes, otherTypes);

function cli(args) {
  if (args.includes('-r')) {
    const type = args[args.indexOf('-r') + 1];
    console.log(defaultMime.getExtension(type));
  } else {
    const extensionOrPath = args[0];
    console.log(defaultMime.getType(extensionOrPath));
  }
}

export default defaultMime;

if (require.main === module) {
  cli(process.argv.slice(2));
}

// mime/lite.js
export const liteMime = new Mime(standardTypes);
