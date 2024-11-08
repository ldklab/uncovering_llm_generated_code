// Create a Node.js package implementing basic RxJS-like functionality

// observable.js
class Observable {
  constructor(subscribe) {
    this._subscribe = subscribe;
  }

  subscribe(observer) {
    const safeObserver = {
      next: (v) => {
        if (observer.next) observer.next(v);
      },
      error: (e) => {
        if (observer.error) observer.error(e);
        else throw e;
      },
      complete: () => {
        if (observer.complete) observer.complete();
      }
    };
    this._subscribe(safeObserver);
  }

  // pipe method for changing operators
  pipe(...operators) {
    return operators.reduce((prev, fn) => fn(prev), this);
  }
}

// operators.js
const filter = (predicate) => (source) => {
  return new Observable((observer) => {
    return source.subscribe({
      next: (value) => {
        if (predicate(value)) observer.next(value);
      },
      error: (err) => observer.error(err),
      complete: () => observer.complete()
    });
  });
};

const map = (transform) => (source) => {
  return new Observable((observer) => {
    return source.subscribe({
      next: (value) => observer.next(transform(value)),
      error: (err) => observer.error(err),
      complete: () => observer.complete()
    });
  });
};

// range.js
function range(start, count) {
  return new Observable((observer) => {
    for (let i = start; i < start + count; i++) {
      observer.next(i);
    }
    observer.complete();
  });
}

// index.js
const { Observable } = require('./observable');
const { filter, map } = require('./operators');
const { range } = require('./range');

const example = range(1, 200)
  .pipe(
    filter(x => x % 2 === 1),
    map(x => x + x)
  )
  .subscribe({
    next: x => console.log(x),
    error: err => console.error('Error:', err),
    complete: () => console.log('Complete!')
  });

