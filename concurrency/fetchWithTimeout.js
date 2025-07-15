export async function fetchWithRetryAndTimeout (url, options, attempt = 1) {
  const {timeout = 3000, retries = 5, retryDelay = 500} = options;

  const controller = new AbortController();
  let abortTimer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(abortTimer);

    if (!response.ok) throw new Error(`${response.status}`);
    return await response.json();
  } catch (err) {
    clearTimeout(abortTimer);
    const isLastAttempt = attempt === retries;
    const isAborted = err.name === 'AbortError';
    if (isLastAttempt || !isAborted) throw err;
    await new Promise((resolve) => setTimeout(resolve, retryDelay));
    return fetchWithRetryAndTimeout(url, options, attempt + 1);
  } finally {
    clearTimeout(abortTimer);
  }
  
}


export function fetchWithTimeout(url, timeout) {
  const controller = new AbortController;
  const abortTimer = setTimeout(() => controller.abort, timeout);

  return fetch(url, {
    signal: controller.singnal
  })
    .finally(() => clearTimeout(abortTimer));
}


// usage

// fetchWithTimeout('url', 3000)
//   .then((response) => {
//     if (!response.ok) throw new Error('Network not ok');
//     return response.json;
//   })
//   .then(data => console.log(data))
//   .catch(err => {
//     if (err.name === 'AbortError') console.error('Aborted');
//     else console.error('Fetch error');
//   });