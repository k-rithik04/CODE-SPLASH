self.onmessage = async function (e) {
  const { firstCount, totalFrames, mobileSkip = 1 } = e.data;

  const pad = (n) => n >= 1000 ? String(n).padStart(4, "0") : String(n).padStart(3, "0");

  const WORKER_URL = self.location.pathname;
  const BASE_PATH = WORKER_URL.substring(0, WORKER_URL.lastIndexOf("/"));
  const folder = "frames";

  const PHASE1_CONCURRENCY = mobileSkip > 1 ? 4 : 16;
  const PHASE2_CONCURRENCY = mobileSkip > 1 ? 3 : 12;
  const MAX_RETRIES = 2;
  const RETRY_DELAY = 300;

  async function loadSingleFrame(frameNum, retries = 0) {
    const url = `${BASE_PATH}/assets/${folder}/frame_${pad(frameNum)}.webp`;
    try {
      const resp = await fetch(url);
      if (resp && resp.ok) {
        const blob = await resp.blob();
        const bitmap = await createImageBitmap(blob);
        return { frame: frameNum, bitmap };
      }
    } catch {
      if (retries < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY));
        return loadSingleFrame(frameNum, retries + 1);
      }
    }
    return null;
  }

  async function loadFramesBatch(frames, concurrency, onProgress) {
    let idx = 0;
    let loaded = 0;
    const total = frames.length;

    async function worker() {
      while (idx < frames.length) {
        const i = idx++;
        const frameNum = frames[i];

        const result = await loadSingleFrame(frameNum);
        if (result) {
          self.postMessage(
            { type: "bitmap", frame: result.frame, bitmap: result.bitmap },
            [result.bitmap]
          );
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
  }

  try {
    // PRIORITY LOAD: Frame 1 first, immediately, for instant display
    const frame1Result = await loadSingleFrame(1);
    if (frame1Result) {
      self.postMessage(
        { type: "firstFrameBitmap", frame: 1, bitmap: frame1Result.bitmap },
        [frame1Result.bitmap]
      );
    }

    // Phase 1: Load frames 2 to firstCount
    const firstTargets = [];
    for (let i = 2; i <= firstCount; i += mobileSkip) firstTargets.push(i);

    await loadFramesBatch(firstTargets, PHASE1_CONCURRENCY, (loaded) => {
      self.postMessage({ type: "progress", loaded: loaded + 1, total: firstTargets.length + 1, phase: 1 });
    });

    self.postMessage({ type: "firstBatchComplete", loaded: firstTargets.length + 1, total: firstTargets.length + 1 });

    // Phase 2: Load remaining frames in background
    const remainingTargets = [];
    for (let i = firstCount + 1; i <= totalFrames; i += mobileSkip) remainingTargets.push(i);

    await loadFramesBatch(remainingTargets, PHASE2_CONCURRENCY, (loaded) => {
      self.postMessage({
        type: "backgroundProgress",
        loaded: firstTargets.length + 1 + loaded,
        total: firstTargets.length + 1 + remainingTargets.length,
      });
    });

    self.postMessage({ type: "complete" });
  } catch (err) {
    self.postMessage({ type: "error", message: err.message });
  }
};
