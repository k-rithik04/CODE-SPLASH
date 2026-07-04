self.onmessage = async function (e) {
  const { firstCount, lastCount, totalFrames } = e.data;

  const pad = (n) => String(n).padStart(3, '0');

  const WORKER_URL = self.location.pathname;
  const BASE_PATH = WORKER_URL.substring(0, WORKER_URL.lastIndexOf('/'));

  const firstTargets = [];
  for (let i = 1; i <= firstCount; i++) firstTargets.push(i);

  const lastTargets = [];
  for (let i = totalFrames - lastCount + 1; i <= totalFrames; i++) lastTargets.push(i);

  const total = firstTargets.length + lastTargets.length;
  let loaded = 0;

  const CONCURRENCY = 8;

  async function loadFrames(frames, cache, onProgress) {
    let idx = 0;
    async function worker() {
      while (idx < frames.length) {
        const i = idx++;
        const frameNum = frames[i];
        const url = `${BASE_PATH}/assets/frames/frame_${pad(frameNum)}.webp`;

        try {
          let resp = await cache.match(url);
          if (!resp) {
            resp = await fetch(url);
            if (resp.ok) {
              await cache.put(url, resp.clone());
            }
          }
        } catch {
          // skip failed frame — will retry on scroll
        }

        loaded++;
        onProgress();
      }
    }

    const workers = [];
    for (let i = 0; i < Math.min(CONCURRENCY, frames.length); i++) {
      workers.push(worker());
    }
    await Promise.all(workers);
  }

  try {
    const cache = await caches.open('code-splash-frames');

    // Phase 1: Load first 400 frames — no progress updates to main thread
    // (main thread is running its own 0→20-40 animation)
    await loadFrames(firstTargets, cache, () => {});

    // Signal first batch done — main thread can now start counting from baseProgress
    self.postMessage({ type: 'firstBatchComplete', loaded, total });

    // Phase 2: Load tail frames — report progress so main thread maps baseProgress→100
    await loadFrames(lastTargets, cache, () => {
      self.postMessage({ type: 'progress', loaded, total });
    });

    self.postMessage({ type: 'complete' });
  } catch (err) {
    self.postMessage({ type: 'error', message: err.message });
  }
};
