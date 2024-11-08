// chrome-trace-event.js

const fs = require('fs');
const { Writable } = require('stream');

// Tracer class definition
class Tracer {
  constructor(options = {}) {
    this.noStream = options.noStream || false;
    this.events = [];
    this.stream = null;
    
    if (!this.noStream) {
      this.stream = new Writable({
        write(chunk, encoding, callback) {
          process.stdout.write(chunk);
          callback();
        }
      });
    }
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

// Sample usage of Tracer
const trace = new Tracer({
  noStream: true
});

trace.addEvent({
  ph: 'X', // Event type
  pid: 1234, // Process ID
  tid: 5678, // Thread ID
  ts: Date.now(), // Timestamp
  dur: 5, // Duration
  name: 'Sample Event' // Name of the event
});

// Pipe output only works if streaming is enabled (noStream is false)
const outPath = 'trace_output.json';
trace.pipe(fs.createWriteStream(outPath));

// Write events to 'trace.json' since noStream is true
trace.flush();

module.exports = { Tracer };
