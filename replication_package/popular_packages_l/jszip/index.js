// Mock implementation of the JSZip functionality and usage in pure Node.js

const fs = require('fs');
const zlib = require('zlib');

// Simple utility to compress a file and add it to a zip archive
class SimpleZip {
    constructor() {
        this.files = {};
        this.folders = {};
    }

    file(name, content) {
        this.files[name] = content;
    }

    folder(name) {
        const folder = new SimpleZip();
        this.folders[name] = folder;
        return folder;
    }

    async generateAsync(options = { type: 'blob' }) {
        const tempZipPath = './tempzip.zip';
        let output = fs.createWriteStream(tempZipPath);
        let archive = zlib.createGzip();

        archive.pipe(output);

        for (let file in this.files) {
            archive.write(this.files[file]);
        }

        for (let folderName in this.folders) {
            let folder = this.folders[folderName];
            for (let file in folder.files) {
                archive.write(folder.files[file]);
            }
        }

        archive.end();

        return new Promise((resolve, reject) => {
            output.on('close', () => {
                // Read the file and convert it to a blob-like structure
                const zipContent = fs.readFileSync(tempZipPath);
                fs.unlinkSync(tempZipPath); // clean up
                resolve(new Blob([zipContent]));
            });
            archive.on('error', (err) => reject(err));
        });
    }
}

// Usage
const saveAs = (content, filename) => {
    // Save the blob content to a file in Node.js
    fs.writeFileSync(filename, content);
    console.log('Saved:', filename);
};

// Example usage
const zip = new SimpleZip();
zip.file("Hello.txt", "Hello World\n");

const img = zip.folder("images");
img.file("smile.gif", Buffer.from('fakebase64data', 'base64'));

zip.generateAsync({type: "blob"}).then(function(content) {
    saveAs(content, "example.zip");
});
