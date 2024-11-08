markdown
// asap.js
let queue = [];
let flushing = false;
let index = 0;

function asap(task) {
  queue.push(task);
  if (!flushing) {
    flushing = true;
    requestFlush();
  }
}

function rawAsap(task) {
  queue.push(task);
  if (!flushing) {
    flushing = true;
    requestFlush();
  }
}

function flush() {
  while (index < queue.length) {
    let currentTask = queue[index];
    index++;
    try {
      currentTask();
    } catch (e) {
      setTimeout(() => { throw e; }, 0); // In browsers, rethrow caught exceptions later.
    }
  }
  index = 0;
  queue.length = 0;
  flushing = false;
}

function requestFlush() {
  if (typeof MutationObserver !== 'undefined') {
    let iterations = 0;
    let node = document.createTextNode('');
    new MutationObserver(flush).observe(node, { characterData: true });
    node.data = (iterations = ++iterations % 2);
  } else if (typeof MessageChannel !== 'undefined') {
    const channel = new MessageChannel();
    channel.port1.onmessage = flush;
    channel.port2.postMessage(0);
  } else {
    setTimeout(flush, 0); // Fallback to setTimeout in non-supporting environments.
  }
}

module.exports = asap;
module.exports.raw = rawAsap;
