// asyncScheduler.js
let taskQueue = [];
let isFlushing = false;
let currentIndex = 0;

function scheduleTask(task) {
  taskQueue.push(task);
  if (!isFlushing) {
    isFlushing = true;
    triggerFlush();
  }
}

function scheduleRawTask(task) {
  taskQueue.push(task);
  if (!isFlushing) {
    isFlushing = true;
    triggerFlush();
  }
}

function executeTasks() {
  while (currentIndex < taskQueue.length) {
    const task = taskQueue[currentIndex++];
    try {
      task();
    } catch (error) {
      setTimeout(() => { throw error; }, 0);
    }
  }
  currentIndex = 0;
  taskQueue = [];
  isFlushing = false;
}

function triggerFlush() {
  if (typeof MutationObserver !== 'undefined') {
    let node = document.createTextNode('');
    new MutationObserver(executeTasks).observe(node, { characterData: true });
    node.data = 'toggle';
  } else if (typeof MessageChannel !== 'undefined') {
    const channel = new MessageChannel();
    channel.port1.onmessage = executeTasks;
    channel.port2.postMessage(0);
  } else {
    setTimeout(executeTasks, 0);
  }
}

module.exports = scheduleTask;
module.exports.raw = scheduleRawTask;
