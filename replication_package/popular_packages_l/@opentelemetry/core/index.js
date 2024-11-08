// opentelemetry-core.js

class W3CTraceContextPropagator {
  constructor() {
    // Implementation follows W3C Trace Context specifications for HTTP headers
  }

  inject(context, carrier) {
    // Code to inject trace context into carrier (HTTP headers)
  }

  extract(context, carrier) {
    // Code to extract trace context from carrier (HTTP headers)
  }
}

class W3CBaggagePropagator {
  constructor() {
    // Implementation for baggage using HTTP headers
  }

  inject(context, carrier) {
    // Code to inject baggage into carrier (HTTP headers)
  }

  extract(context, carrier) {
    // Code to extract baggage from carrier (HTTP headers)
  }
}

class CompositePropagator {
  constructor(propagators = []) {
    this.propagators = propagators;
  }

  inject(context, carrier) {
    this.propagators.forEach(propagator => propagator.inject(context, carrier));
  }

  extract(context, carrier) {
    this.propagators.forEach(propagator => propagator.extract(context, carrier));
  }
}

// Usage
const api = { // Simulated OpenTelemetry API object
  propagation: {
    setGlobalPropagator(propagatorInstance) {
      this.globalPropagator = propagatorInstance;
    }
  }
};

// Setting Global Propagator as W3CTraceContextPropagator
api.propagation.setGlobalPropagator(new W3CTraceContextPropagator());

// Setting Global Propagator as CompositePropagator with W3CTraceContext and Baggage
api.propagation.setGlobalPropagator(new CompositePropagator([
  new W3CTraceContextPropagator(),
  new W3CBaggagePropagator()
]));

// Setting Global Propagator as W3CBaggagePropagator
api.propagation.setGlobalPropagator(new W3CBaggagePropagator());
