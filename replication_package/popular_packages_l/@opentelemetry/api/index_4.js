const { trace } = require("@opentelemetry/api");
const { BasicTracerProvider, ConsoleSpanExporter, SimpleSpanProcessor } = require("@opentelemetry/sdk-trace-base");

// Create and configure tracing provider
const provider = new BasicTracerProvider();

// Add a processor with a console exporter to the provider
provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));

// Set the provider as the global tracer provider
trace.setGlobalTracerProvider(provider);

// Get a tracer instance with application name and version
const tracer = trace.getTracer('my-application-name', '0.1.0');

// Function to simulate an operation and trace it
async function operation() {
  // Start a new span labeled "do operation"
  const span = tracer.startSpan("do operation");

  // Simulate work by adding a delay of 1 second
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // End the span
  span.end();
}

// Main function to continuously perform the traced operation
async function main() {
  while (true) {
    await operation();
  }
}

main();
