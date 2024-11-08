'use strict';

function reusify(Constructor) {
  var head = new Constructor();
  var tail = head;

  function get() {
    var current = head;

    if (current.next) {
      head = current.next;
    } else {
      head = new Constructor();
      tail = head;
    }

    current.next = null;
    return current;
  }

  function release(obj) {
    obj.next = null;
    tail.next = obj;
    tail = obj;
  }

  return {
    get: get,
    release: release
  }
}

// Export the reusify function
module.exports = reusify;
