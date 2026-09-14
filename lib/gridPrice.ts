/**
 * Approximates "now" as an index into an hourly day-ahead price series using
 * the UTC hour (the series' exact start offset isn't tracked once flattened
 * into the store, so this is a reasonable approximation rather than an exact
 * local-time lookup).
 */
export function getCurrentHourPrice(hourly: number[] | undefined): number | undefined {
  if (!hourly || hourly.length === 0) return undefined;
  const hour = new Date().getUTCHours();
  return hourly[Math.min(hour, hourly.length - 1)];
}
