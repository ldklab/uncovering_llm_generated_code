// index.js
const protobuf = require('protobufjs');

class ProtoLoader {
    static async load(filePath, options = {}) {
        const root = new protobuf.Root();
        if (options.includeDirs) {
            options.includeDirs.forEach(dir => {
                root.resolvePath = (origin, target) => protobuf.util.path.resolve(dir, target);
            });
        }
        return protobuf.load(filePath, root, options);
    }

    static loadSync(filePath, options = {}) {
        const root = new protobuf.Root();
        if (options.includeDirs) {
            options.includeDirs.forEach(dir => {
                root.resolvePath = (origin, target) => protobuf.util.path.resolve(dir, target);
            });
        }
        const loadedRoot = protobuf.loadSync(filePath, root, options);
        return protobuf.Root.toDescriptor(loadedRoot);
    }
}

module.exports = ProtoLoader;

// proto-loader-gen-types.js
const yargs = require('yargs');
const protobuf = require('protobufjs');
const fs = require('fs');
const path = require('path');

function generateTypeScriptDefinitions(protoFile, options) {
    const root = new protobuf.Root();
    
    if (options.includeDirs) {
        protobuf.util.path.resolvePath = (origin, target) => {
            const searchPaths = [path.dirname(origin), ...options.includeDirs];
            for (const dir of searchPaths) {
                const potentialPath = path.join(dir, target);
                if (fs.existsSync(potentialPath)) {
                    return potentialPath;
                }
            }
            return null;
        };
    }
    
    protobuf.loadSync(protoFile, root);
    
    const outputDir = options.outDir || 'types';
    const outputFileName = path.basename(protoFile, path.extname(protoFile)) + '.d.ts';
    const outputFilePath = path.join(outputDir, outputFileName);
    
    let typeScriptContent = `// Auto-generated TypeScript definitions for ${outputFileName}\n\n`;
    
    root.nestedArray.forEach(element => {
        if (element instanceof protobuf.Type) {
            typeScriptContent += element.toDescriptor(element).toString();
        }
    });

    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(outputFilePath, typeScriptContent);
}

const args = yargs
    .option('includeDirs', {
        alias: 'I',
        type: 'array',
        description: 'Directories to include for protos',
    })
    .option('outDir', {
        alias: 'O',
        type: 'string',
        default: 'types',
        describe: 'Output directory for TypeScript definitions',
    })
    .argv;

args._.forEach(protobufFile => generateTypeScriptDefinitions(protobufFile, args));
