const { trace } = require("@opentelemetry/api");
const { BasicTracerProvider, ConsoleSpanExporter, SimpleSpanProcessor } = require("@opentelemetry/sdk-trace-base");

// Initialize a tracing provider and configure it with a processor and exporter
const provider = new BasicTracerProvider();
provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
trace.setGlobalTracerProvider(provider);

// Set up a tracer using the global tracing provider
const name = 'my-application-name';
const version = '0.1.0';
const tracer = trace.getTracer(name, version);

// Function to simulate an operation that is traced
async function simulateOperation() {
  const span = tracer.startSpan("perform operation");

  // Simulate some processing work by pausing for 1 second
  await new Promise((resolve) => setTimeout(resolve, 1000));

  span.end();
}

// Main function to repeatedly execute the traced operation
async function main() {
  while (true) {
    await simulateOperation();
  }
}

main();
