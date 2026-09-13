import { ChargingStation, StationStatus } from "@/lib/types";
import { COUNTRIES } from "@/lib/data/countries";

const OCM_BASE_URL = "https://api.openchargemap.io/v3/poi/";
const MAX_RESULTS_PER_COUNTRY = 30;

/** Maps OpenChargeMap's StatusType IDs (see /v3/referencedata/) to our simplified status. */
function mapStatus(statusTypeId: number | null | undefined): StationStatus {
  switch (statusTypeId) {
    case 20: // Currently In Use (Automated Status)
      return "in-use";
    case 30: // Temporarily Unavailable
    case 100: // Not Operational
    case 150: // Planned For Future Date
    case 200: // Removed (Decommissioned)
    case 210: // Removed (Duplicate Listing)
      return "unavailable";
    default: // Operational, Currently Available, Partly Operational, Unknown
      return "available";
  }
}

type OcmConnection = { PowerKW?: number | null };
type OcmPoi = {
  ID: number;
  AddressInfo?: {
    Title?: string;
    Latitude: number;
    Longitude: number;
    Town?: string;
    AddressLine1?: string;
    Country?: { ISOCode?: string };
  };
  Connections?: OcmConnection[];
  StatusType?: { ID: number };
  StatusTypeID?: number;
  OperatorInfo?: { Title?: string };
};

function mapPoiToStation(poi: OcmPoi, fallbackCountryCode: string): ChargingStation | null {
  const addr = poi.AddressInfo;
  if (!addr || typeof addr.Latitude !== "number" || typeof addr.Longitude !== "number") {
    return null;
  }

  const maxPower = (poi.Connections ?? []).reduce(
    (max, c) => (c.PowerKW && c.PowerKW > max ? c.PowerKW : max),
    0
  );

  return {
    id: `ocm-${poi.ID}`,
    name: addr.Title ?? "Charging Station",
    lat: addr.Latitude,
    lon: addr.Longitude,
    countryCode: addr.Country?.ISOCode ?? fallbackCountryCode,
    status: mapStatus(poi.StatusType?.ID ?? poi.StatusTypeID),
    operator: poi.OperatorInfo?.Title,
    powerKw: maxPower || undefined,
    address: [addr.AddressLine1, addr.Town].filter(Boolean).join(", ") || undefined,
  };
}

async function fetchStationsForCountry(countryCode: string, apiKey: string): Promise<ChargingStation[]> {
  const url = new URL(OCM_BASE_URL);
  url.searchParams.set("output", "json");
  url.searchParams.set("countrycode", countryCode);
  url.searchParams.set("maxresults", String(MAX_RESULTS_PER_COUNTRY));
  url.searchParams.set("compact", "false");
  url.searchParams.set("verbose", "false");
  url.searchParams.set("key", apiKey);

  const res = await fetch(url.toString(), { next: { revalidate: 300 } });
  if (!res.ok) {
    console.warn(`OpenChargeMap request failed for ${countryCode}: ${res.status}`);
    return [];
  }

  const data = (await res.json()) as OcmPoi[];
  return data
    .map((poi) => mapPoiToStation(poi, countryCode))
    .filter((s): s is ChargingStation => s !== null);
}

export async function fetchAllStations(): Promise<ChargingStation[]> {
  const apiKey = process.env.OPENCHARGEMAP_API_KEY;
  if (!apiKey) {
    throw new Error("OPENCHARGEMAP_API_KEY is not set");
  }

  const results = await Promise.allSettled(
    COUNTRIES.map((country) => fetchStationsForCountry(country.code, apiKey))
  );

  return results.flatMap((result) => (result.status === "fulfilled" ? result.value : []));
}
