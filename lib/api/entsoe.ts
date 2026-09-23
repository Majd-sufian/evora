import { XMLParser } from "fast-xml-parser";
import { COUNTRIES } from "@/lib/data/countries";

const ENTSOE_BASE_URL = "https://web-api.tp.entsoe.eu/api";

export type CountryDayAheadPrices = {
  countryCode: string;
  /** EUR/MWh, one entry per hour starting at periodStart. */
  hourly: number[];
  periodStart: string;
};

type EntsoePoint = { position: number; "price.amount": number };
type EntsoePeriod = {
  timeInterval?: { start?: string };
  resolution?: string;
  Point?: EntsoePoint[];
};
type EntsoeTimeSeries = { Period?: EntsoePeriod[] };
type EntsoeDocument = {
  Publication_MarketDocument?: { TimeSeries?: EntsoeTimeSeries[] };
  Acknowledgement_MarketDocument?: { Reason?: { text?: string } };
};

const parser = new XMLParser({
  ignoreAttributes: true,
  isArray: (name) => ["TimeSeries", "Period", "Point"].includes(name),
});

/** Parses an ISO 8601 duration like "PT15M", "PT30M", "PT60M", "PT1H" into minutes. */
function resolutionToMinutes(resolution: string | undefined): number {
  if (!resolution) return 60;
  const hourMatch = resolution.match(/PT(\d+)H/);
  if (hourMatch) return Number(hourMatch[1]) * 60;
  const minuteMatch = resolution.match(/PT(\d+)M/);
  if (minuteMatch) return Number(minuteMatch[1]);
  return 60;
}

/**
 * Downstream code (getCurrentHourPrice, getSmartChargingRecommendation)
 * treats array index as hour-of-day directly, assuming one entry per hour.
 * ENTSO-E's actual publication resolution varies by bidding zone and has
 * shifted to sub-hourly for several countries — verified live that Germany
 * currently publishes PT15M (15-minute) data with no PT60M series
 * available at all, which the old code would have used as-is, producing
 * indices like 55 that don't correspond to any real hour ("Wait until
 * 55:00"). Averaging same-hour points down to one value per hour keeps the
 * "index = hour" contract true regardless of the source resolution.
 */
function resampleToHourly(points: EntsoePoint[], resolutionMinutes: number): number[] {
  if (resolutionMinutes >= 60) {
    return points.map((p) => Number(p["price.amount"]));
  }
  const pointsPerHour = 60 / resolutionMinutes;
  const hourly: number[] = [];
  for (let i = 0; i < points.length; i += pointsPerHour) {
    const group = points.slice(i, i + pointsPerHour);
    const avg = group.reduce((sum, p) => sum + Number(p["price.amount"]), 0) / group.length;
    hourly.push(avg);
  }
  return hourly;
}

function formatPeriodTimestamp(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}${pad(
    date.getUTCHours()
  )}${pad(date.getUTCMinutes())}`;
}

async function fetchDayAheadPrices(areaCode: string, token: string): Promise<CountryDayAheadPrices | null> {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);

  const url = new URL(ENTSOE_BASE_URL);
  url.searchParams.set("securityToken", token);
  url.searchParams.set("documentType", "A44");
  url.searchParams.set("in_Domain", areaCode);
  url.searchParams.set("out_Domain", areaCode);
  url.searchParams.set("periodStart", formatPeriodTimestamp(start));
  url.searchParams.set("periodEnd", formatPeriodTimestamp(end));

  let res: Response;
  try {
    res = await fetch(url.toString(), { next: { revalidate: 900 } });
  } catch (error) {
    console.warn(`ENTSO-E request threw for ${areaCode}:`, error);
    return null;
  }
  if (!res.ok) {
    console.warn(`ENTSO-E request failed for ${areaCode}: ${res.status}`);
    return null;
  }

  const xml = await res.text();
  let parsed: EntsoeDocument;
  try {
    parsed = parser.parse(xml) as EntsoeDocument;
  } catch (error) {
    console.warn(`ENTSO-E response for ${areaCode} was not valid XML`, error);
    return null;
  }

  if (parsed.Acknowledgement_MarketDocument) {
    console.warn(
      `ENTSO-E rejected request for ${areaCode}: ${parsed.Acknowledgement_MarketDocument.Reason?.text}`
    );
    return null;
  }

  const timeSeries = parsed.Publication_MarketDocument?.TimeSeries;
  if (!timeSeries || timeSeries.length === 0) return null;

  let chosenPeriod: EntsoePeriod | null = null;
  for (const series of timeSeries) {
    for (const period of series.Period ?? []) {
      if (!chosenPeriod) chosenPeriod = period;
      if (period.resolution === "PT60M") {
        chosenPeriod = period;
        break;
      }
    }
    if (chosenPeriod?.resolution === "PT60M") break;
  }
  if (!chosenPeriod?.Point) return null;

  const sortedPoints = [...chosenPeriod.Point].sort((a, b) => a.position - b.position);
  const hourly = resampleToHourly(sortedPoints, resolutionToMinutes(chosenPeriod.resolution));

  if (hourly.length === 0 || hourly.some((v) => Number.isNaN(v))) return null;

  return {
    countryCode: "",
    hourly,
    periodStart: chosenPeriod.timeInterval?.start ?? start.toISOString(),
  };
}

export async function fetchAllDayAheadPrices(): Promise<CountryDayAheadPrices[]> {
  const token = process.env.ENTSOE_API_TOKEN;
  if (!token) {
    throw new Error("ENTSOE_API_TOKEN is not set");
  }

  const results = await Promise.allSettled(
    COUNTRIES.map(async (country) => {
      const result = await fetchDayAheadPrices(country.entsoeAreaCode, token);
      return result ? { ...result, countryCode: country.code } : null;
    })
  );

  return results
    .filter(
      (r): r is PromiseFulfilledResult<CountryDayAheadPrices | null> => r.status === "fulfilled"
    )
    .map((r) => r.value)
    .filter((v): v is CountryDayAheadPrices => v !== null);
}
