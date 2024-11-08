// This is a simplified implementation of creating a ZIP archive in Node.js, using zlib to compress files.

const fs = require('fs');
const zlib = require('zlib');

// Define a class to handle creating a simple ZIP structure
class SimpleZip {
    constructor() {
        this.files = {};
        this.folders = {};
    }

    // Add a file with its content
    file(name, content) {
        this.files[name] = content;
    }

    // Create a new folder
    folder(name) {
        const folder = new SimpleZip();
        this.folders[name] = folder;
        return folder;
    }

    // Asynchronously generate the ZIP file and return its content
    async generateAsync(options = { type: 'blob' }) {
        const tempZipPath = './tempzip.zip';
        let output = fs.createWriteStream(tempZipPath);
        let archive = zlib.createGzip(); // Utilize gzip for compression

        // Pipe the gzip content to the output
        archive.pipe(output);

        // Write each individual file's content to the archive
        for (let file in this.files) {
            archive.write(this.files[file]);
        }

        // Handle adding files from nested folders
        for (let folderName in this.folders) {
            let folder = this.folders[folderName];
            for (let file in folder.files) {
                archive.write(folder.files[file]);
            }
        }

        // Finalize the archive
        archive.end();

        // Return a promise which resolves when the output is closed
        return new Promise((resolve, reject) => {
            output.on('close', () => {
                // After closure, read the zip content and clean up
                const zipContent = fs.readFileSync(tempZipPath);
                fs.unlinkSync(tempZipPath);
                resolve(zipContent); // Return the zip content
            });
            archive.on('error', (err) => reject(err)); // Reject on error
        });
    }
}

// Function to save the generated ZIP content as a file
const saveAs = (content, filename) => {
    fs.writeFileSync(filename, content);
    console.log('Saved:', filename);
};

// Example use case: Create zip, add files, and save it
const zip = new SimpleZip();
zip.file("Hello.txt", "Hello World\n");

const img = zip.folder("images");
img.file("smile.gif", Buffer.from('fakebase64data', 'base64'));

zip.generateAsync({ type: "blob" }).then(function(content) {
    saveAs(content, "example.zip");
});
