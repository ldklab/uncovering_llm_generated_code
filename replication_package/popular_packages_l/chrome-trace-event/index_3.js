const fs = require('fs');
const { Writable } = require('stream');

class Tracer {
  constructor(options = {}) {
    this.noStream = options.noStream || false;
    this.events = [];
    this.stream = this.noStream ? null : new Writable({
      write(chunk, encoding, callback) {
        process.stdout.write(chunk);
        callback();
      }
    });
  }

  pipe(destination) {
    if (this.stream) {
      this.stream.pipe(destination);
    }
  }

  addEvent(event) {
    this.events.push(event);
  }

  flush() {
    const data = JSON.stringify(this.events, null, 2);
    if (this.stream) {
      this.stream.write(data);
    } else {
      fs.writeFileSync('trace.json', data);
    }
  }
}

// Demonstration of Tracer's functionality
const trace = new Tracer({
  noStream: true
});

trace.addEvent({
  ph: 'X',
  pid: 1234,
  tid: 5678,
  ts: Date.now(),
  dur: 5,
  name: 'Sample Event'
});

const outPath = 'trace_output.json';
trace.pipe(fs.createWriteStream(outPath));
trace.flush();

module.exports = { Tracer };
