self.onmessage = async function (e) {
  const { firstCount, lastCount, totalFrames } = e.data;

  const pad = (n) => String(n).padStart(3, '0');

  const targets = new Set();
  for (let i = 1; i <= firstCount; i++) targets.add(i);
  for (let i = totalFrames - lastCount + 1; i <= totalFrames; i++) targets.add(i);

  const sorted = [...targets].sort((a, b) => a - b);
  const total = sorted.length;
  let loaded = 0;

  try {
    const cache = await caches.open('code-splash-frames');

    for (const frameNum of sorted) {
      const url = `/assets/frames/frame_${pad(frameNum)}.webp`;

      let resp = await cache.match(url);
      if (!resp) {
        resp = await fetch(url);
        if (resp.ok) {
          await cache.put(url, resp.clone());
        }
      }

      loaded++;
      self.postMessage({ type: 'progress', loaded, total });
    }

    self.postMessage({ type: 'complete' });
  } catch (err) {
    self.postMessage({ type: 'error', message: err.message });
  }
};
