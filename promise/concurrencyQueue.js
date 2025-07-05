const MAX_CONCURRENCY = 5;
let activeRunning = 0;
const queue = [];

const enqueueReq = (fn) => {
  return new Promise((resolve, reject) => {
    const run = async () => {
      activeRunning++;
      try {
        const res = await fn();
        resolve(res);
      } catch (err) {
        reject(err);
      } finally {
        activeRunning--;
        if (queue.length > 0) {
          const next = queue.shift();
          next();
        }
      }
    };
    if (activeRunning < MAX_CONCURRENCY) {
      run();
    } else {
      queue.push(run);
    }
  })
};

// usage

const fetchUser = (id) => {
  return enqueueReq(() => {
    fetch(`/api/user/${id}`).then(res => res.json());
  });
};

const ids = ["1", "2", "3"];

Promise.all(ids.map((id) =>fetchUser(id)));