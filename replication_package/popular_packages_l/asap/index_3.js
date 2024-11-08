// asap.js
let taskQueue = [];
let isFlushing = false;
let currentIndex = 0;

function asap(task) {
  scheduleTask(task);
}

function rawAsap(task) {
  scheduleTask(task);
}

function scheduleTask(task) {
  taskQueue.push(task);
  if (!isFlushing) {
    isFlushing = true;
    initiateFlush();
  }
}

function flushQueue() {
  while (currentIndex < taskQueue.length) {
    let currentTask = taskQueue[currentIndex++];
    try {
      currentTask();
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
    let observerCounter = 0;
    let observerNode = document.createTextNode('');
    new MutationObserver(flushQueue).observe(observerNode, { characterData: true });
    observerNode.data = (++observerCounter % 2).toString();
  } else if (typeof MessageChannel !== 'undefined') {
    let messageChannel = new MessageChannel();
    messageChannel.port1.onmessage = flushQueue;
    messageChannel.port2.postMessage(0);
  } else {
    setTimeout(flushQueue, 0);
  }
}

module.exports = asap;
module.exports.raw = rawAsap;
