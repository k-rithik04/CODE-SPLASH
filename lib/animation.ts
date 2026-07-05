export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  const clamped = Math.max(inMin, Math.min(value, inMax));
  return ((clamped - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}
