// chrome-trace-event-refactored.js

const fs = require('fs');
const { Writable } = require('stream');

// Tracer class definition
class Tracer {
  constructor(options = {}) {
    this.noStream = options.noStream || false;
    this.events = [];
    this.stream = this.createStream();
  }

  createStream() {
    if (!this.noStream) {
      // Create a Writable stream that writes to stdout
      return new Writable({
        write(chunk, encoding, callback) {
          process.stdout.write(chunk);
          callback();
        }
      });
    }
    return null;
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
      // Write data to 'trace.json' if no stream is provided
      fs.writeFileSync('trace.json', data);
    }
  }
}

// Sample usage of Tracer with noStream option enabled
const trace = new Tracer({ noStream: true });

trace.addEvent({
  ph: 'X', // Event type
  pid: 1234, // Process ID
  tid: 5678, // Thread ID
  ts: Date.now(), // Timestamp
  dur: 5, // Duration in milliseconds
  name: 'Sample Event' // Name of the event
});

// Specify output file path and flush the events
const outPath = 'trace_output.json';
trace.pipe(fs.createWriteStream(outPath));
trace.flush();

module.exports = { Tracer };
