const fs = require('fs');
const zlib = require('zlib');

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
        const output = fs.createWriteStream(tempZipPath);
        const gzip = zlib.createGzip();

        gzip.pipe(output);

        for (const name in this.files) {
            gzip.write(this.files[name]);
        }

        for (const folderName in this.folders) {
            const folder = this.folders[folderName];
            for (const file in folder.files) {
                gzip.write(folder.files[file]);
            }
        }

        gzip.end();

        return new Promise((resolve, reject) => {
            output.on('close', () => {
                const zipContent = fs.readFileSync(tempZipPath);
                fs.unlinkSync(tempZipPath);
                resolve(new Blob([zipContent]));
            });
            gzip.on('error', (err) => reject(err));
        });
    }
}

const saveAs = (content, filename) => {
    fs.writeFileSync(filename, content);
    console.log('Saved:', filename);
};

const zip = new SimpleZip();
zip.file("Hello.txt", "Hello World\n");

const imgFolder = zip.folder("images");
imgFolder.file("smile.gif", Buffer.from('fakebase64data', 'base64'));

zip.generateAsync({ type: "blob" }).then((content) => {
    saveAs(content, "example.zip");
});
