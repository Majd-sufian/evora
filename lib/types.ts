export type StationStatus = "available" | "in-use" | "unavailable";

export type ChargingStation = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  countryCode: string;
  status: StationStatus;
  operator?: string;
  powerKw?: number;
  address?: string;
  connectorTypes?: string[];
  /** OpenChargeMap's free-text StateOrProvince field — crowdsourced, often
   * missing or messy (a city/district name, an abbreviation, a country name,
   * even unfilled placeholder text). Used as a best-effort region label, not
   * a reliable administrative boundary; see lib/clustering.ts. */
  state?: string;
};

export type ViewLevel = "world" | "country" | "station";

export type LayerState = {
  chargers: boolean;
  gridPrices: boolean;
  carbonIntensity: boolean;
  activityPulses: boolean;
  fastChargersOnly: boolean;
};

export type GeocodeResult = {
  label: string;
  lat: number;
  lon: number;
};
