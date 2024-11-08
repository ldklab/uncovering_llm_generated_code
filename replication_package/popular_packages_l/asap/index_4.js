// asap.js
let queue = [];
let isFlushing = false;
let index = 0;

function asap(task) {
  queue.push(task);
  initiateFlush();
}

function rawAsap(task) {
  queue.push(task);
  initiateFlush();
}

function initiateFlush() {
  if (!isFlushing) {
    isFlushing = true;
    requestFlush();
  }
}

function flush() {
  while (index < queue.length) {
    const currentTask = queue[index++];
    try {
      currentTask();
    } catch (error) {
      setTimeout(() => { throw error; }, 0);
    }
  }
  clearQueue();
}

function clearQueue() {
  index = 0;
  queue.length = 0;
  isFlushing = false;
}

function requestFlush() {
  if (typeof MutationObserver !== 'undefined') {
    // Using MutationObserver to schedule flush.
    const node = document.createTextNode('');
    const observer = new MutationObserver(flush);
    observer.observe(node, { characterData: true });
    node.data = '1'; // Trigger the observer.
  } else if (typeof MessageChannel !== 'undefined') {
    // Using MessageChannel to schedule flush.
    const channel = new MessageChannel();
    channel.port1.onmessage = flush;
    channel.port2.postMessage(0);
  } else {
    // Fallback to setTimeout.
    setTimeout(flush, 0);
  }
}

module.exports = asap;
module.exports.raw = rawAsap;
