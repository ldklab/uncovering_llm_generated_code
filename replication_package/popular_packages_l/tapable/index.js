class SyncHook {
  constructor(args = []) {
    this.args = args;
    this.taps = [];
    this.interceptors = [];
  }

  tap(name, fn) {
    this.taps.push({ name, fn });
  }

  call(...args) {
    this.interceptors.forEach(interceptor => {
      if (interceptor.call) interceptor.call(...args);
    });
    this.taps.forEach(tap => {
      tap.fn(...args);
    });
  }

  intercept(interceptor) {
    if (interceptor) {
      this.interceptors.push(interceptor);
    }
  }
}

class AsyncParallelHook {
  constructor(args = []) {
    this.args = args;
    this.taps = [];
    this.interceptors = [];
  }

  tapAsync(name, fn) {
    this.taps.push({ name, fn, type: 'async' });
  }

  tapPromise(name, fn) {
    this.taps.push({ name, fn, type: 'promise' });
  }

  callAsync(...args) {
    const callback = args.pop();
    const tapFns = this.taps.map(tap => (cb) => {
      if (tap.type === 'async') {
        tap.fn(...args, cb);
      } else if (tap.type === 'promise') {
        tap.fn(...args).then(() => cb()).catch(err => cb(err));
      }
    });
  
    let count = tapFns.length;
    const done = err => {
      if (err) {
        callback(err);
        callback = () => {}; // prevent calling after error
      } else if (--count === 0) {
        callback();
      }
    };

    this.interceptors.forEach(interceptor => {
      if (interceptor.call) interceptor.call(...args);
    });

    tapFns.forEach(fn => fn(done));
  }

  intercept(interceptor) {
    if (interceptor) {
      this.interceptors.push(interceptor);
    }
  }
}

class Car {
  constructor() {
    this.hooks = {
      accelerate: new SyncHook(['newSpeed']),
      brake: new SyncHook([]),
      calculateRoutes: new AsyncParallelHook(['source', 'target', 'routesList']),
    };
  }

  setSpeed(newSpeed) {
    this.hooks.accelerate.call(newSpeed);
  }

  useNavigationSystemPromise(source, target) {
    const routesList = new Set();
    return new Promise((resolve, reject) => {
      this.hooks.calculateRoutes.callAsync(source, target, routesList, (err) => {
        if (err) reject(err);
        else resolve(routesList);
      });
    });
  }
}

// Example usage
const myCar = new Car();
myCar.hooks.brake.tap("WarningLampPlugin", () => console.log("Warning lamp on!"));
myCar.hooks.accelerate.tap("LoggerPlugin", newSpeed => console.log(`Accelerating to ${newSpeed}`));

myCar.setSpeed(60);

