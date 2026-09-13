import { COUNTRIES } from "@/lib/data/countries";

const EM_BASE_URL = "https://api.electricitymap.org/v3/carbon-intensity/latest";

export type CountryCarbonIntensity = {
  countryCode: string;
  carbonIntensity: number;
  datetime: string;
};

async function fetchCarbonIntensityForZone(
  zone: string,
  apiKey: string
): Promise<CountryCarbonIntensity | null> {
  const url = new URL(EM_BASE_URL);
  url.searchParams.set("zone", zone);

  const res = await fetch(url.toString(), {
    headers: { "auth-token": apiKey },
    next: { revalidate: 600 },
  });

  if (!res.ok) {
    console.warn(`Electricity Maps request failed for ${zone}: ${res.status}`);
    return null;
  }

  const data = (await res.json()) as { carbonIntensity?: number; datetime?: string };
  if (typeof data.carbonIntensity !== "number") return null;

  return {
    countryCode: zone,
    carbonIntensity: data.carbonIntensity,
    datetime: data.datetime ?? new Date().toISOString(),
  };
}

export async function fetchAllCarbonIntensity(): Promise<CountryCarbonIntensity[]> {
  const apiKey = process.env.ELECTRICITYMAPS_API_KEY;
  if (!apiKey) {
    throw new Error("ELECTRICITYMAPS_API_KEY is not set");
  }

  const results = await Promise.allSettled(
    COUNTRIES.map((country) => fetchCarbonIntensityForZone(country.code, apiKey))
  );

  return results
    .filter(
      (r): r is PromiseFulfilledResult<CountryCarbonIntensity | null> => r.status === "fulfilled"
    )
    .map((r) => r.value)
    .filter((v): v is CountryCarbonIntensity => v !== null);
}
