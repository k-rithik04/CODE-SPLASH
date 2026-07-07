/**
 * Resolves the correct frame URL based on device type.
 * Uses /assets/frames/ for desktop and /assets/frames_mobile/ for mobile.
 */
export function getFrameUrl(frameNum: number, isMobile: boolean): string {
  const pad = (n: number) => (n >= 1000 ? String(n).padStart(4, "0") : String(n).padStart(3, "0"));
  const folder = "frames";
  return `/assets/${folder}/frame_${pad(frameNum)}.webp`;
}
