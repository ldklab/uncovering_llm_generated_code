// opentelemetry-core.js

class W3CTraceContextPropagator {
  constructor() {
    // Initializes a propagator to handle W3C Trace Context specifications for HTTP headers
  }

  inject(context, carrier) {
    // Injects trace context information into the HTTP headers (carrier)
  }

  extract(context, carrier) {
    // Extracts trace context information from the HTTP headers (carrier)
  }
}

class W3CBaggagePropagator {
  constructor() {
    // Initializes a propagator to manage W3C Baggage propagation via HTTP headers
  }

  inject(context, carrier) {
    // Injects baggage information into the HTTP headers (carrier)
  }

  extract(context, carrier) {
    // Extracts baggage information from the HTTP headers (carrier)
  }
}

class CompositePropagator {
  constructor(propagators = []) {
    this.propagators = propagators; // Holds a collection of propagators for coordinated operations
  }

  inject(context, carrier) {
    // Invokes the inject method of each encapsulated propagator on the context and carrier
    this.propagators.forEach(propagator => propagator.inject(context, carrier));
  }

  extract(context, carrier) {
    // Invokes the extract method of each encapsulated propagator on the context and carrier
    this.propagators.forEach(propagator => propagator.extract(context, carrier));
  }
}

// Simulated OpenTelemetry API object
const api = {
  propagation: {
    setGlobalPropagator(propagatorInstance) {
      // Sets a global propagator instance for the application
      this.globalPropagator = propagatorInstance;
    }
  }
};

// Example usage of different propagators
// Set the global propagator as W3CTraceContextPropagator
api.propagation.setGlobalPropagator(new W3CTraceContextPropagator());

// Set the global propagator as CompositePropagator with both W3CTraceContext and Baggage
api.propagation.setGlobalPropagator(
  new CompositePropagator([
    new W3CTraceContextPropagator(),
    new W3CBaggagePropagator()
  ])
);

// Set the global propagator as W3CBaggagePropagator
api.propagation.setGlobalPropagator(new W3CBaggagePropagator());
