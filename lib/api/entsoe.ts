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

  const hourly = [...chosenPeriod.Point]
    .sort((a, b) => a.position - b.position)
    .map((p) => Number(p["price.amount"]));

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
