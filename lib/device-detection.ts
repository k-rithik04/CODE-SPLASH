/**
 * Detects if the current device is a mobile phone or tablet based on User-Agent.
 * Uses robust regex matching for industry-grade client-side detection.
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;

  const ua = navigator.userAgent || '';

  // Standard Mobile Regex
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  
  // Tablet detection (iPad OS 13+ spoofing Mac)
  const isIPadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;

  return mobileRegex.test(ua) || isIPadOS;
}
