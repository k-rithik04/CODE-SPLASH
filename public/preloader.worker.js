self.onmessage = async function (e) {
  const { firstCount, totalFrames } = e.data;

  const pad = (n) => String(n).padStart(3, "0");

  const WORKER_URL = self.location.pathname;
  const BASE_PATH = WORKER_URL.substring(0, WORKER_URL.lastIndexOf("/"));

  const PHASE1_CONCURRENCY = 16;
  const PHASE2_CONCURRENCY = 12;

  async function loadFramesBatch(frames, cache, concurrency, onProgress) {
    let idx = 0;
    let loaded = 0;
    const total = frames.length;
    const bitmapBatch = [];

    async function worker() {
      while (idx < frames.length) {
        const i = idx++;
        const frameNum = frames[i];
        const url = `${BASE_PATH}/assets/frames/frame_${pad(frameNum)}.webp`;

        try {
          let resp = null;
          if (cache) {
            resp = await cache.match(url);
          }
          if (!resp) {
            resp = await fetch(url);
            if (resp.ok && cache) {
              await cache.put(url, resp.clone());
            }
          }

          if (resp && resp.ok) {
            const blob = await resp.blob();
            const bitmap = await createImageBitmap(blob);
            bitmapBatch.push({ frame: frameNum, bitmap });

            if (bitmapBatch.length >= 5) {
              const batch = bitmapBatch.splice(0, 5);
              self.postMessage(
                { type: "bitmaps", items: batch.map((b) => ({ frame: b.frame, bitmap: b.bitmap })) },
                batch.map((b) => b.bitmap)
              );
            }
          }
        } catch {
          // skip failed frame
        }

        loaded++;
        onProgress(loaded, total);
      }
    }

    const workers = [];
    for (let i = 0; i < Math.min(concurrency, frames.length); i++) {
      workers.push(worker());
    }
    await Promise.all(workers);

    if (bitmapBatch.length > 0) {
      const batch = bitmapBatch.splice(0);
      self.postMessage(
        { type: "bitmaps", items: batch.map((b) => ({ frame: b.frame, bitmap: b.bitmap })) },
        batch.map((b) => b.bitmap)
      );
    }
  }

  // TODO: Re-enable to preload creator card images from Supabase storage

  try {
    let cache = null;
    try {
      cache = await caches.open("code-splash-frames-v1");
    } catch {
      // Cache API unavailable — fetch without caching
    }

    // Phase 1: Load frames 1 to firstCount (1-600)
    const firstTargets = [];
    for (let i = 1; i <= firstCount; i++) firstTargets.push(i);

    await loadFramesBatch(firstTargets, cache, PHASE1_CONCURRENCY, (loaded) => {
      self.postMessage({ type: "progress", loaded: loaded, total: firstCount, phase: 1 });
    });

    self.postMessage({ type: "firstBatchComplete", loaded: firstCount, total: firstCount });

    // Phase 2: Load frames firstCount+1 to totalFrames (601-1265) in background
    const remainingTargets = [];
    for (let i = firstCount + 1; i <= totalFrames; i++) remainingTargets.push(i);

    await loadFramesBatch(remainingTargets, cache, PHASE2_CONCURRENCY, (loaded) => {
      self.postMessage({
        type: "backgroundProgress",
        loaded: firstCount + loaded,
        total: totalFrames,
      });
    });

    self.postMessage({ type: "complete" });
  } catch (err) {
    self.postMessage({ type: "error", message: err.message });
  }
};
