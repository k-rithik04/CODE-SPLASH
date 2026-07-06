self.onmessage = async function (e) {
  const { firstCount, totalFrames } = e.data;

  const pad = (n) => n >= 1000 ? String(n).padStart(4, "0") : String(n).padStart(3, "0");

  const WORKER_URL = self.location.pathname;
  const BASE_PATH = WORKER_URL.substring(0, WORKER_URL.lastIndexOf("/"));

  const PHASE1_CONCURRENCY = 16;
  const PHASE2_CONCURRENCY = 12;
  const MAX_RETRIES = 2;
  const RETRY_DELAY = 300;

  async function loadSingleFrame(frameNum, cache, retries = 0) {
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
        return { frame: frameNum, bitmap };
      }
    } catch {
      if (retries < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY));
        return loadSingleFrame(frameNum, cache, retries + 1);
      }
    }
    return null;
  }

  async function loadFramesBatch(frames, cache, concurrency, onProgress, onFrameReady) {
    let idx = 0;
    let loaded = 0;
    const total = frames.length;
    const bitmapBatch = [];

    async function worker() {
      while (idx < frames.length) {
        const i = idx++;
        const frameNum = frames[i];

        const result = await loadSingleFrame(frameNum, cache);
        if (result) {
          bitmapBatch.push(result);

          if (bitmapBatch.length >= 5) {
            const batch = bitmapBatch.splice(0, 5);
            self.postMessage(
              { type: "bitmaps", items: batch.map((b) => ({ frame: b.frame, bitmap: b.bitmap })) },
              batch.map((b) => b.bitmap)
            );
          }

          if (onFrameReady) {
            onFrameReady(result.frame, result.bitmap);
          }
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

  try {
    let cache = null;
    try {
      cache = await caches.open("code-splash-frames-v1");
    } catch {
      // Cache API unavailable
    }

    // PRIORITY LOAD: Frame 1 first, immediately, for instant display
    const frame1Result = await loadSingleFrame(1, cache);
    if (frame1Result) {
      // Send firstFrameReady with transfer ownership of the bitmap
      self.postMessage({ type: "firstFrameReady", bitmap: frame1Result.bitmap }, [frame1Result.bitmap]);
    }

    // Phase 1: Load frames 2 to firstCount (2-600), skipping frame 1 (already loaded)
    const firstTargets = [];
    for (let i = 2; i <= firstCount; i++) firstTargets.push(i);

    await loadFramesBatch(firstTargets, cache, PHASE1_CONCURRENCY, (loaded) => {
      self.postMessage({ type: "progress", loaded: loaded + 1, total: firstCount, phase: 1 });
    });

    self.postMessage({ type: "firstBatchComplete", loaded: firstCount, total: firstCount });

    // Phase 2: Load frames 601-1265 in background
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
