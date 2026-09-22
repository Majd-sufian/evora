import { ChargingStation, StationStatus } from "@/lib/types";
import { COUNTRIES } from "@/lib/data/countries";

const OCM_BASE_URL = "https://api.openchargemap.io/v3/poi/";
const OCM_REFERENCE_URL = "https://api.openchargemap.io/v3/referencedata/";
// OpenChargeMap's default per-country ordering isn't geographically
// balanced — verified live that a 30-result cap returned zero stations
// within 30km of Munich (a city that genuinely has ~25 in the full data).
// 200 (paired with compact=true below) was chosen as a balance: it
// surfaces 14 real Munich-area stations (vs 0 before) while keeping the
// total /api/stations payload in the ~1MB range rather than 500's ~2.5MB —
// a real per-station lazy-load-per-country architecture would scale
// better still, but is a larger change than this fix warrants right now.
const MAX_RESULTS_PER_COUNTRY = 200;

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

type OcmConnection = {
  PowerKW?: number | null;
  ConnectionTypeID?: number;
  ConnectionType?: { Title?: string };
};
type OcmPoi = {
  ID: number;
  AddressInfo?: {
    Title?: string;
    Latitude: number;
    Longitude: number;
    Town?: string;
    StateOrProvince?: string;
    AddressLine1?: string;
    Country?: { ISOCode?: string };
  };
  Connections?: OcmConnection[];
  StatusType?: { ID: number };
  StatusTypeID?: number;
  OperatorID?: number;
  OperatorInfo?: { Title?: string };
};

/** ID -> display name lookups, built once from /v3/referencedata/ — needed
 * because the per-country POI fetch below runs with compact=true (a ~75%
 * smaller payload than the verbose form), which drops the nested
 * OperatorInfo/ConnectionType objects and leaves only their numeric IDs. */
export type OcmReferenceData = {
  connectionTypeNames: Map<number, string>;
  operatorNames: Map<number, string>;
};

export async function fetchReferenceData(apiKey: string): Promise<OcmReferenceData> {
  const url = new URL(OCM_REFERENCE_URL);
  url.searchParams.set("output", "json");
  url.searchParams.set("key", apiKey);

  const res = await fetch(url.toString(), { next: { revalidate: 86400 } });
  if (!res.ok) {
    console.warn(`OpenChargeMap reference data request failed: ${res.status}`);
    return { connectionTypeNames: new Map(), operatorNames: new Map() };
  }

  const data = (await res.json()) as {
    ConnectionTypes?: { ID: number; Title: string }[];
    Operators?: { ID: number; Title: string }[];
  };

  return {
    connectionTypeNames: new Map((data.ConnectionTypes ?? []).map((c) => [c.ID, c.Title])),
    operatorNames: new Map((data.Operators ?? []).map((o) => [o.ID, o.Title])),
  };
}

function mapPoiToStation(
  poi: OcmPoi,
  fallbackCountryCode: string,
  reference: OcmReferenceData
): ChargingStation | null {
  const addr = poi.AddressInfo;
  if (!addr || typeof addr.Latitude !== "number" || typeof addr.Longitude !== "number") {
    return null;
  }

  const connections = poi.Connections ?? [];
  const maxPower = connections.reduce((max, c) => (c.PowerKW && c.PowerKW > max ? c.PowerKW : max), 0);
  const connectorTypes = Array.from(
    new Set(
      connections
        .map((c) => c.ConnectionType?.Title ?? (c.ConnectionTypeID && reference.connectionTypeNames.get(c.ConnectionTypeID)))
        .filter((t): t is string => !!t)
    )
  );

  return {
    id: `ocm-${poi.ID}`,
    name: addr.Title ?? "Charging Station",
    lat: addr.Latitude,
    lon: addr.Longitude,
    countryCode: addr.Country?.ISOCode ?? fallbackCountryCode,
    status: mapStatus(poi.StatusType?.ID ?? poi.StatusTypeID),
    operator: poi.OperatorInfo?.Title ?? (poi.OperatorID ? reference.operatorNames.get(poi.OperatorID) : undefined),
    powerKw: maxPower || undefined,
    address: [addr.AddressLine1, addr.Town].filter(Boolean).join(", ") || undefined,
    state: addr.StateOrProvince?.trim() || undefined,
    connectorTypes: connectorTypes.length > 0 ? connectorTypes : undefined,
  };
}

async function fetchRawPoisForCountry(countryCode: string, apiKey: string): Promise<OcmPoi[]> {
  const url = new URL(OCM_BASE_URL);
  url.searchParams.set("output", "json");
  url.searchParams.set("countrycode", countryCode);
  url.searchParams.set("maxresults", String(MAX_RESULTS_PER_COUNTRY));
  // compact=true cuts the payload by ~75% (verified: 960KB -> 235KB for a
  // 300-result Germany request) by dropping nested OperatorInfo/
  // ConnectionType objects in favor of their bare IDs — reconstructed in
  // mapPoiToStation via the reference data fetched alongside this.
  url.searchParams.set("compact", "true");
  url.searchParams.set("verbose", "false");
  url.searchParams.set("key", apiKey);

  const res = await fetch(url.toString(), { next: { revalidate: 300 } });
  if (!res.ok) {
    console.warn(`OpenChargeMap request failed for ${countryCode}: ${res.status}`);
    return [];
  }
  return (await res.json()) as OcmPoi[];
}

export async function fetchAllStations(): Promise<ChargingStation[]> {
  const apiKey = process.env.OPENCHARGEMAP_API_KEY;
  if (!apiKey) {
    throw new Error("OPENCHARGEMAP_API_KEY is not set");
  }

  // Reference data (for operator/connector names) and every country's raw
  // POI list run in parallel — the reference lookup is only needed once all
  // the raw data is in hand for mapping, not before the fetches can start.
  const [reference, countryResults] = await Promise.all([
    fetchReferenceData(apiKey),
    Promise.allSettled(COUNTRIES.map((country) => fetchRawPoisForCountry(country.code, apiKey))),
  ]);

  return countryResults.flatMap((result, i) => {
    if (result.status !== "fulfilled") return [];
    const countryCode = COUNTRIES[i].code;
    return result.value
      .map((poi) => mapPoiToStation(poi, countryCode, reference))
      .filter((s): s is ChargingStation => s !== null);
  });
}
