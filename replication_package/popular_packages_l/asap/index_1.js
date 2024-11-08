// asap.js
const taskQueue = [];
let isFlushing = false;
let currentIndex = 0;

function asap(task) {
  taskQueue.push(task);
  if (!isFlushing) {
    isFlushing = true;
    initiateFlush();
  }
}

function rawAsap(task) {
  taskQueue.push(task);
  if (!isFlushing) {
    isFlushing = true;
    initiateFlush();
  }
}

function flushTasks() {
  while (currentIndex < taskQueue.length) {
    const task = taskQueue[currentIndex];
    currentIndex++;
    try {
      task();
    } catch (error) {
      setTimeout(() => { throw error; }, 0);
    }
  }
  currentIndex = 0;
  taskQueue.length = 0;
  isFlushing = false;
}

function initiateFlush() {
  if (typeof MutationObserver !== 'undefined') {
    let count = 0;
    const observerTarget = document.createTextNode('');
    const observer = new MutationObserver(flushTasks);
    observer.observe(observerTarget, { characterData: true });
    observerTarget.data = (count = ++count % 2);
  } else if (typeof MessageChannel !== 'undefined') {
    const messageChannel = new MessageChannel();
    messageChannel.port1.onmessage = flushTasks;
    messageChannel.port2.postMessage(0);
  } else {
    setTimeout(flushTasks, 0);
  }
}

module.exports = asap;
module.exports.raw = rawAsap;
