'use strict';

function createReusablePool(Constructor) {
  let head = new Constructor();
  let tail = head;

  function acquire() {
    const current = head;

    if (current.next) {
      head = current.next;
    } else {
      head = new Constructor();
      tail = head;
    }

    current.next = null;
    return current;
  }

  function recycle(obj) {
    obj.next = null;
    tail.next = obj;
    tail = obj;
  }

  return {
    acquire,
    recycle
  };
}

module.exports = createReusablePool;
