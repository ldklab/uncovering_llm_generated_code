'use strict';

function reusablePool(Constructor) {
  let poolHead = new Constructor();
  let poolTail = poolHead;

  function acquire() {
    let current;
    if (poolHead.next) {
      current = poolHead;
      poolHead = poolHead.next;
    } else {
      current = new Constructor();
    }

    current.next = null;
    return current;
  }

  function recycle(obj) {
    obj.next = null;
    poolTail.next = obj;
    poolTail = obj;
  }

  return {
    acquire: acquire,
    recycle: recycle
  };
}

module.exports = reusablePool;
