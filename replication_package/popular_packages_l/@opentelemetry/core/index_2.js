// opentelemetry-core.js

// Classes to implement propagators as per W3C specifications and to manage context propagation

class W3CTraceContextPropagator {
  constructor() {
    // Implements W3C standard for managing trace context in HTTP headers
  }

  // Injects the trace context from the current context into carrier like HTTP headers
  inject(context, carrier) {
    // Implementation details not provided, assume putting trace info into the carrier
  }

  // Extracts the trace context from carrier like HTTP headers to the current context
  extract(context, carrier) {
    // Implementation details not provided, assume retrieving trace info from the carrier
  }
}

class W3CBaggagePropagator {
  constructor() {
    // Manages "baggage" information in headers, as per W3C standards
  }

  // Injects the baggage from the current context into carrier like HTTP headers
  inject(context, carrier) {
    // Implementation details not provided, assume putting baggage info into the carrier
  }

  // Extracts the baggage from carrier like HTTP headers to the current context
  extract(context, carrier) {
    // Implementation details not provided, assume retrieving baggage info from the carrier
  }
}

class CompositePropagator {
  constructor(propagators = []) {
    // Initializes with a list of propagators to use in sequence for operations
    this.propagators = propagators;
  }

  // Sequentially injects using each propagator in the array
  inject(context, carrier) {
    this.propagators.forEach(propagator => propagator.inject(context, carrier));
  }

  // Sequentially extracts using each propagator in the array
  extract(context, carrier) {
    this.propagators.forEach(propagator => propagator.extract(context, carrier));
  }
}

// Example usage by defining a simulated OpenTelemetry API
const api = {
  propagation: {
    // Method allows setting of the global propagator instance for the OpenTelemetry system
    setGlobalPropagator(propagatorInstance) {
      this.globalPropagator = propagatorInstance;
    }
  }
};

// Set global propagator with different propagators for context management

// Use only trace context propagator
api.propagation.setGlobalPropagator(new W3CTraceContextPropagator());

// Use a composite propagator combining trace context and baggage
api.propagation.setGlobalPropagator(new CompositePropagator([
  new W3CTraceContextPropagator(),
  new W3CBaggagePropagator()
]));

// Use only baggage propagator
api.propagation.setGlobalPropagator(new W3CBaggagePropagator());
