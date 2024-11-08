json
// package.json
{
  "name": "sharp-image-processor",
  "version": "1.0.0",
  "description": "A high-speed Node.js image processing package using libvips",
  "main": "index.js",
  "dependencies": {
    "sharp": "^0.31.3"
  },
  "devDependencies": {},
  "scripts": {
    "start": "node index.js"
  },
  "author": "Your Name",
  "license": "Apache-2.0"
}

// index.js
const sharp = require('sharp');

// Resize image using callback
function resizeImageCallback(inputBuffer) {
  sharp(inputBuffer)
    .resize(320, 240)
    .toFile('output.webp', (err, info) => {
      if (err) console.error('Error during resizing:', err);
      else console.log('Image successfully resized:', info);
    });
}

// Resize image using promises
function resizeImagePromise(filePath) {
  return sharp(filePath)
    .rotate()
    .resize(200)
    .jpeg({ mozjpeg: true })
    .toBuffer()
    .then(data => console.log('Promise-based resize complete'))
    .catch(err => console.error('Error in Promise-based resize:', err));
}

// Create semi-transparent image using async/await
async function createSemiTransparentImage() {
  try {
    const buffer = await sharp({
      create: {
        width: 48,
        height: 48,
        channels: 4,
        background: { r: 255, g: 0, b: 0, alpha: 0.5 }
      }
    })
      .png()
      .toBuffer();
    console.log('Async/await image created:', buffer);
  } catch (err) {
    console.error('Error creating image:', err);
  }
}

// Stream processing with rounded corners
function processImageStream(readableStream, writableStream) {
  const roundedCorners = Buffer.from(
    '<svg><rect x="0" y="0" width="200" height="200" rx="50" ry="50"/></svg>'
  );

  const roundedCornerResizer = sharp()
    .resize(200, 200)
    .composite([{
      input: roundedCorners,
      blend: 'dest-in'
    }])
    .png();

  readableStream
    .pipe(roundedCornerResizer)
    .pipe(writableStream);
}

// Example usage
resizeImageCallback(Buffer.from('inputBufferData'));
resizeImagePromise('input.jpg');
createSemiTransparentImage();
