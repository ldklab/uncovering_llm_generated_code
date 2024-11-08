'use strict'

// The reusify function is designed to manage a reusable object pool
// for a specific Constructor. It optimizes object instances to avoid
// unnecessary garbage collection by reusing objects.
function reusify(Constructor) {
  // Initialize both head and tail to a new instance of Constructor
  let head = new Constructor();
  let tail = head;

  // Function to acquire an object from the pool
  function get() {
    const current = head;

    // Check if there's an available recycled object
    if (current.next) {
      // Move the head to the next available object
      head = current.next;
    } else {
      // If no next object, create a new instance
      head = new Constructor();
      tail = head;
    }

    // Disconnect the current object from the list
    current.next = null;

    // Return the current object for use
    return current;
  }

  // Function to release an object back into the pool
  function release(obj) {
    // Attach the object at the end of the list
    tail.next = obj;
    // Update the tail to point to the released object
    tail = obj;
  }

  // Return the public API for the object pool
  return {
    get: get,
    release: release
  };
}

// Export the reusify function for use in other modules
module.exports = reusify;
