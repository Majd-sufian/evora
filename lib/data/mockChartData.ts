/**
 * Static placeholder series for the HUD charts. The price series is replaced by
 * real ENTSO-E hourly data in a later build step; the activity series stays
 * simulated by design (there is no real "network activity" data source).
 */
export const MOCK_PRICE_SERIES_EUR_MWH = [
  62, 58, 54, 51, 49, 48, 52, 61, 74, 82, 88, 91, 93, 90, 85, 79, 81, 89, 97,
  102, 95, 84, 73, 66,
];

export const SIMULATED_ACTIVITY_SERIES = [
  12, 18, 15, 22, 30, 28, 35, 42, 55, 68, 74, 80, 76, 82, 90, 85, 79, 71, 64,
  58, 47, 38, 26, 19,
];
