// opentelemetry-core.js

class W3CTraceContextPropagator {
  constructor() {
    // Implementation for handling trace context propagation based on W3C specs.
  }

  inject(context, carrier) {
    // Inserts trace context into the carrier, typically used for HTTP headers.
  }

  extract(context, carrier) {
    // Retrieves trace context from the carrier, typically used for HTTP headers.
  }
}

class W3CBaggagePropagator {
  constructor() {
    // Implementation for handling baggage propagation via HTTP headers.
  }

  inject(context, carrier) {
    // Inserts baggage data into the carrier, typically used for HTTP headers.
  }

  extract(context, carrier) {
    // Retrieves baggage data from the carrier, typically used for HTTP headers.
  }
}

class CompositePropagator {
  constructor(propagators = []) {
    // Composite to combine multiple propagation strategies.
    this.propagators = propagators;
  }

  inject(context, carrier) {
    // Sequentially apply inject on all propagators.
    this.propagators.forEach(propagator => propagator.inject(context, carrier));
  }

  extract(context, carrier) {
    // Sequentially apply extract on all propagators.
    this.propagators.forEach(propagator => propagator.extract(context, carrier));
  }
}

// Simulated OpenTelemetry API object to manage global propagation settings
const api = {
  propagation: {
    setGlobalPropagator(propagatorInstance) {
      // Sets the chosen propagator as the global propagator for all OpenTelemetry context operations.
      this.globalPropagator = propagatorInstance;
    }
  }
};

// Global propagation setup examples
api.propagation.setGlobalPropagator(new W3CTraceContextPropagator());

api.propagation.setGlobalPropagator(new CompositePropagator([
  new W3CTraceContextPropagator(),
  new W3CBaggagePropagator()
]));

api.propagation.setGlobalPropagator(new W3CBaggagePropagator());
