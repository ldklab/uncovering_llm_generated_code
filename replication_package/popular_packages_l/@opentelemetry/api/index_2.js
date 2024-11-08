const { trace } = require("@opentelemetry/api");
const { BasicTracerProvider, ConsoleSpanExporter, SimpleSpanProcessor } = require("@opentelemetry/sdk-trace-base");

// Initialize the tracer provider
const provider = new BasicTracerProvider();
provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));

// Set the global tracer provider
trace.setGlobalTracerProvider(provider);

// Create a tracer instance with application metadata
const tracer = trace.getTracer('my-application-name', '0.1.0');

// Function to simulate an operation with tracing
async function simulateWork() {
  const span = tracer.startSpan("executing operation");

  // Simulate work by delaying for 1 second
  await new Promise(resolve => setTimeout(resolve, 1000));

  // End the span
  span.end();
}

// Continuously perform the operation
async function execute() {
  while (true) {
    await simulateWork();
  }
}

// Start executing
execute();
