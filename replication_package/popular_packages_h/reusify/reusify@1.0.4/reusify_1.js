'use strict';

/**
 * The reusify module exports a function that provides a reusable object pool.
 * It helps manage and optimize object creation and garbage collection by reusing objects.
 * The module maintains a linked list of objects.
 * `Constructor` is a function used to create new objects when the pool is empty.
 * 
 * @param {Function} Constructor - A constructor function used to create new objects.
 * @returns {Object} An object with `get` and `release` methods to manage the object pool.
 */
function reusify(Constructor) {
  let head = new Constructor();
  let tail = head;

  /**
   * Retrieves an object from the pool. If the pool is empty, a new object is created using the constructor.
   * The returned object is detached from the pool (its `next` property is set to null).
   * 
   * @returns {Object} A reusable object from the pool.
   */
  function get() {
    const current = head;

    if (current.next) {  // If there's a next object in the pool, move head to it.
      head = current.next;
    } else {  // Otherwise, create a new object and reset the pool to it.
      head = new Constructor();
      tail = head;
    }

    current.next = null;  // Detach the current object from the pool.

    return current;  // Return the detached object to the caller.
  }

  /**
   * Releases an object back into the pool for later reuse.
   * The released object's `next` property is linked to the pool's tail.
   * 
   * @param {Object} obj - The object to be released back into the pool.
   */
  function release(obj) {
    tail.next = obj;  // Attach the object to the current end of the pool.
    tail = obj;  // Update the pool's tail to the newly released object.
  }

  // The function returns an API with `get` and `release` methods to handle the object pool.
  return {
    get: get,
    release: release
  };
}

module.exports = reusify;
