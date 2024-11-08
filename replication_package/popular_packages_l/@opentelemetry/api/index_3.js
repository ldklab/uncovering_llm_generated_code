const { trace } = require("@opentelemetry/api");
const { BasicTracerProvider, ConsoleSpanExporter, SimpleSpanProcessor } = require("@opentelemetry/sdk-trace-base");

// Instantiate and configure the tracing provider
const provider = new BasicTracerProvider();
provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
trace.setGlobalTracerProvider(provider);

// Create a tracer with application-specific details
const applicationName = 'my-application-name';
const applicationVersion = '0.1.0';
const tracer = trace.getTracer(applicationName, applicationVersion);

// Function to perform a traced operation with a simulated delay
async function performTracedOperation() {
  const operationSpan = tracer.startSpan("do operation");

  // Simulate work with a 1-second delay
  await new Promise(res => setTimeout(res, 1000));

  operationSpan.end();
}

// Continuously perform the traced operation
async function runApplication() {
  while (true) {
    await performTracedOperation();
  }
}

runApplication();
