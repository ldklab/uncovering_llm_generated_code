import http from 'node:http';
import formidable from 'formidable';

const server = http.createServer((req, res) => {
  if (req.url === '/upload' && req.method.toLowerCase() === 'post') {
    const form = new formidable.IncomingForm();

    form.parse(req, (err, fields, files) => {
      if (err) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Error in file upload');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ fields, files }, null, 2));
    });
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <form action="/upload" method="post" enctype="multipart/form-data">
        <input type="text" name="title"><br>
        <input type="file" name="upload" multiple="multiple"><br>
        <button type="submit">Upload</button>
      </form>
    `);
  }
});

server.listen(8080, () => {
  console.log('Server listening on http://localhost:8080...');
});