// index.js
const protobuf = require('protobufjs');
const fs = require('fs');
const path = require('path');

class GRPCProtoLoader {
    static async load(filePath, options = {}) {
        const root = new protobuf.Root();
        if (options.includeDirs) {
            options.includeDirs.forEach(dir => root.resolvePath = protobuf.util.path.resolvePath);
        }
        return protobuf.load(filePath, root, options);
    }

    static loadSync(filePath, options = {}) {
        const root = new protobuf.Root();
        if (options.includeDirs) {
            options.includeDirs.forEach(dir => root.resolvePath = protobuf.util.path.resolvePath);
        }
        const rootLoaded = protobuf.loadSync(filePath, root, options);
        return protobuf.toDescriptor(rootLoaded);
    }
}

module.exports = GRPCProtoLoader;

// proto-loader-gen-types.js
const yargs = require('yargs');
const protobuf = require('protobufjs');
const fs = require('fs');
const path = require('path');

function generateTypeScript(filePath, options) {
    const root = new protobuf.Root();
    
    if (options.includeDirs) {
        protobuf.util.path.resolvePath = (origin, target) => {
            const paths = [path.join(process.cwd(), origin), ...options.includeDirs];
            for (const p of paths) {
                const resolved = path.join(p, target);
                if (fs.existsSync(resolved)) return resolved;
            }
            return null;
        };
    }
    
    protobuf.loadSync(filePath, root);

    const outputDir = options.outDir || 'proto';
    const fileName = path.basename(filePath, '.proto') + '.ts';
    const outputPath = path.join(outputDir, fileName);

    const writeFileContent = (namespace) => {
        let typescriptCode = '// Generated TypeScript for ' + fileName + '\n';
        namespace.nestedArray.forEach(child => {
            if (child instanceof protobuf.Type) {
                typescriptCode += protobuf.Type.toDescriptor(child).toString();
            }
        });

        if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
        fs.writeFileSync(outputPath, typescriptCode);
    };

    writeFileContent(root);
}

const argv = yargs
    .option('includeDirs', {
        alias: 'I',
        type: 'array',
    })
    .option('outDir', {
        alias: 'O',
        type: 'string',
        demandOption: true,
    })
    .argv;

argv._.forEach(filePath => generateTypeScript(filePath, argv));
