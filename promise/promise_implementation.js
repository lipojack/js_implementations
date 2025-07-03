// Implemeted promise
class MyPromise {
  constructor(executer) {
    this.state = "pending"; // or "fulfilled" or "rejected"
    this.value = undefined;
    this.thenCallbacks = [];
    this.catchCallbacks = [];
    const resolve = (val) => {
      if (this.state !== "pending") return;
      this.state = "fulfilled";
      this.value = val
      this.thenCallbacks.forEach((cb) => cb(val));
    }
    const reject = (reason) => {
      if (this.state !== "pending") return;
      this.state = "rejected";
      this.value = reason;
      this.catchCallbacks.forEach((cb) => cb(reason));
    }
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
      }
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
      }
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
    })
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
        })
      }
    );
  }
}

