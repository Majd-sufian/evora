import { Color } from "three";

const GREEN = new Color("#00FF88");
const ORANGE = new Color("#FF6B35");
const RED = new Color("#FF3355");

const MID_THRESHOLD = 300; // gCO2eq/kWh
const MAX_THRESHOLD = 600; // gCO2eq/kWh

/** Maps grid carbon intensity (gCO2eq/kWh) to a green -> orange -> red color. */
export function carbonIntensityColor(gPerKwh: number): string {
  const clamped = Math.max(0, Math.min(MAX_THRESHOLD, gPerKwh));
  if (clamped <= MID_THRESHOLD) {
    return GREEN.clone().lerp(ORANGE, clamped / MID_THRESHOLD).getStyle();
  }
  const t = (clamped - MID_THRESHOLD) / (MAX_THRESHOLD - MID_THRESHOLD);
  return ORANGE.clone().lerp(RED, t).getStyle();
}

const PRICE_MID_THRESHOLD = 100; // EUR/MWh
const PRICE_MAX_THRESHOLD = 250; // EUR/MWh

/** Maps a day-ahead electricity price (EUR/MWh) to a green -> orange -> red color. */
export function gridPriceColor(eurPerMwh: number): string {
  const clamped = Math.max(0, Math.min(PRICE_MAX_THRESHOLD, eurPerMwh));
  if (clamped <= PRICE_MID_THRESHOLD) {
    return GREEN.clone().lerp(ORANGE, clamped / PRICE_MID_THRESHOLD).getStyle();
  }
  const t = (clamped - PRICE_MID_THRESHOLD) / (PRICE_MAX_THRESHOLD - PRICE_MID_THRESHOLD);
  return ORANGE.clone().lerp(RED, t).getStyle();
}
