const fs = require('fs');
const zlib = require('zlib');

// Simple utility class for creating a zip archive
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
        const tempZipPath = './temp.zip';
        const output = fs.createWriteStream(tempZipPath);
        const archive = zlib.createGzip();

        archive.pipe(output);

        // Add files to the archive
        Object.values(this.files).forEach(content => archive.write(content));

        // Add files from folders to the archive
        Object.values(this.folders).forEach(folder => {
            Object.values(folder.files).forEach(content => archive.write(content));
        });

        archive.end();

        return new Promise((resolve, reject) => {
            output.on('close', () => {
                const zipContent = fs.readFileSync(tempZipPath);
                fs.unlinkSync(tempZipPath);
                resolve(new Blob([zipContent]));
            });
            archive.on('error', err => reject(err));
        });
    }
}

// Util function to save the blob to a file
const saveAs = (blob, filename) => {
    fs.writeFileSync(filename, blob);
    console.log(`Saved: ${filename}`);
};

// Example usage of the SimpleZip class
const zip = new SimpleZip();
zip.file("Hello.txt", "Hello World\n");

const imgFolder = zip.folder("images");
imgFolder.file("smile.gif", Buffer.from('fakebase64data', 'base64'));

zip.generateAsync({ type: 'blob' }).then(content => {
    saveAs(content, "example.zip");
});
