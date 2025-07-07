// Implemeted promise
export class MyPromise {
  constructor(executer) {
    this.state = "pending"; // or "fulfilled" or "rejected"
    this.value = undefined;
    this.thenCallbacks = [];
    this.catchCallbacks = [];
    const resolve = (val) => {
      if (this.state !== "pending") return;
      this.state = "fulfilled";
      this.value = val;
      this.thenCallbacks.forEach((cb) => cb(val));
    };
    const reject = (reason) => {
      if (this.state !== "pending") return;
      this.state = "rejected";
      this.value = reason;
      this.catchCallbacks.forEach((cb) => cb(reason));
    };
    try {
      executer(resolve, reject);
    } catch (err) {
      reject(err);
    }
  }
  // handling chained then()
  then(onFulfilled, onRejected) {
    return new MyPromise((resolve, reject) => {
      const handleFulfill = (val) => {
        try {
          if (onFulfilled) { // exist a onFulfilled callback
            const res = onFulfilled(val);
            if (res instanceof MyPromise) {
              res.then(resolve, reject);
            } else {
              resolve(res);
            }
          } else { // No onFulfilled callback
            resolve(val);
          }
        } catch (err) {
          reject(err);
        }
      };
      const handleReject = (reason) => {
        try {
          if (onRejected) {
            const res = onRejected(reason);
            if (res instanceof MyPromise) {
              res.then(resolve, reject);
            } else {
              // the res return a value, which mean the state is fulfilled and we pass it to resolve()
              // ex
              // .catch((err) => {
              //   return "Something went wrong, but let's keep going";
              // })
              // 
              // the res throw new error will be passed to the later catch(err)
              // ex
              // .catch((err) => {
              //   throw new Error("still broken");
              // })
              resolve(res);
            }
          } else {
            reject(reason);
          }
        } catch (err) {
          reject(err);
        }
      };
      switch (this.state) {
      case "fulfilled":
        handleFulfill(this.value);
        break;
      case "rejected":
        handleReject(this.value);
        break;
      default:
        this.thenCallbacks.push(handleFulfill);
        this.catchCallbacks.push(handleReject);
      }
    });
  }
  // the this refers to current promise, which is "p"
  // p.catch(onRejected) implies p.then(null, onRejected)
  
  catch(onRejected) {
    return this.then(null, onRejected);
  }
  // the this refers to current promise, which is "p"
  // p.finally(finalCallback) implies p.then(() => {}, ()=> {})
  finally(finalCallback) {
    return this.then(
      (val) => {
        return MyPromise.resolve(finalCallback()).then(() => val);
      },
      (err) => {
        return MyPromise.resolve(finalCallback()).then(() => {
          throw err;
        });
      }
    );
  }

  static all(promises) {
    return new MyPromise((resolve, reject) => {
      // .all([]) should resolve [], since no promise to be waited
      if (promises.length == 0) return resolve([]);
      const results = new Array(promises.length);
      let completed = 0;
      promises.forEach((promise, index) => {
        MyPromise.resolve(promise)
          .then(
            (res) => {
              results[index] = res;
              completed++;
              if (completed == promises.length) resolve(results);
            },
            (err) => {
              reject(err);
            }
          );
      });
    });
  }

  static race(promises) {
    // .race([]) should return a non-fulfilled promise, since no first finished promise
    return new MyPromise((resolve, reject) => {
      promises.forEach((promise) => {
        MyPromise.resolve(promise)
          .then(
            (res) => resolve(res),
            (err) => reject(err)
          );
      });
    });
  }

  static allSettled(promises) {
    return new MyPromise((resolve) => {
      if (promises.length == 0) return resolve([]);
      const results = new Array(promises.length);
      let completed = 0;

      promises.forEach((promise, index) => {
        MyPromise.resolve(promise)
          .then(
            (res) => {
              // allSettled expect the object with status and value/reason
              results[index] = { status: "fulfilled", value: res};
              completed++;
              if (completed == promises.length) resolve(results);
            },
            (err) => {
              results[index] = { status: "rejected", reason: err};
              completed++;
              if (completed == promises.length) resolve(results);
            }
          );
      });
    });
  }

  static any(promises) {
    return new MyPromise((resolve, reject) => {
      if (promises.length == 0) return reject(new AggregateError([])); 
      const reasons = new Array(promises.length);
      let failed = 0;
      promises.forEach((promise, index) => {
        MyPromise.resolve(promise)
          .then(
            (res) => resolve(res),
            (err) => {
              reasons[index] = err;
              failed++;
              if (failed == promises.length) reject(new AggregateError(reasons));
            }
          );
      });
    });
  }
}

