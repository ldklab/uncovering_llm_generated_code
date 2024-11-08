const fs = require('fs');
const zlib = require('zlib');

class SimpleZip {
    constructor() {
        this.entries = {};
    }

    file(name, content) {
        this.entries[name] = content;
    }

    folder(name) {
        if (!this.entries[name]) {
            this.entries[name] = new SimpleZip();
        }
        return this.entries[name];
    }

    async generateAsync(options = { type: 'blob' }) {
        const tempFilePath = 'temp.zip';
        const output = fs.createWriteStream(tempFilePath);
        const archive = zlib.createGzip();

        archive.pipe(output);

        for (const [name, content] of Object.entries(this.entries)) {
            if (content instanceof SimpleZip) {
                for (const [subName, subContent] of Object.entries(content.entries)) {
                    archive.write(subContent);
                }
            } else {
                archive.write(content);
            }
        }

        archive.end();

        return new Promise((resolve, reject) => {
            output.on('close', () => {
                const zipContent = fs.readFileSync(tempFilePath);
                fs.unlinkSync(tempFilePath);
                resolve(new Blob([zipContent]));
            });
            archive.on('error', reject);
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

zip.generateAsync({ type: "blob" }).then(content => {
    saveAs(content, "example.zip");
});
