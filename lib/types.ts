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
};

export type ViewLevel = "world" | "country" | "station";

export type LayerState = {
  chargers: boolean;
  gridPrices: boolean;
  carbonIntensity: boolean;
  activityPulses: boolean;
  fastChargersOnly: boolean;
};
