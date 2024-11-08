// observable.js
class Observable {
  constructor(subscribe) {
    this._subscribe = subscribe;
  }

  subscribe(observer) {
    const safeObserver = {
      next: (v) => observer.next && observer.next(v),
      error: (e) => {
        if (observer.error) observer.error(e);
        else throw e;
      },
      complete: () => observer.complete && observer.complete()
    };
    this._subscribe(safeObserver);
  }

  pipe(...operators) {
    return operators.reduce((prev, fn) => fn(prev), this);
  }
}

// operators.js
const filter = (predicate) => (source) =>
  new Observable((observer) => source.subscribe({
    next: (value) => predicate(value) && observer.next(value),
    error: (err) => observer.error(err),
    complete: () => observer.complete()
  }));

const map = (transform) => (source) =>
  new Observable((observer) => source.subscribe({
    next: (value) => observer.next(transform(value)),
    error: (err) => observer.error(err),
    complete: () => observer.complete()
  }));

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
const example = range(1, 200)
  .pipe(
    filter(x => x % 2 === 1),
    map(x => x * 2)
  )
  .subscribe({
    next: x => console.log(x),
    error: err => console.error('Error:', err),
    complete: () => console.log('Complete!')
  });
