export type CountryCluster = {
  code: string;
  name: string;
  lat: number;
  lon: number;
  /** Placeholder station count, replaced by real OpenChargeMap aggregates in a later step. */
  stationCount: number;
  /** ENTSO-E bidding-zone EIC code used for day-ahead price queries. */
  entsoeAreaCode: string;
};

export const COUNTRIES: CountryCluster[] = [
  { code: "DE", name: "Germany", lat: 51.1657, lon: 10.4515, stationCount: 2400, entsoeAreaCode: "10Y1001A1001A82H" },
  { code: "FR", name: "France", lat: 46.6034, lon: 1.8883, stationCount: 1800, entsoeAreaCode: "10YFR-RTE------C" },
  { code: "GB", name: "United Kingdom", lat: 55.3781, lon: -3.436, stationCount: 2000, entsoeAreaCode: "10YGB----------A" },
  { code: "ES", name: "Spain", lat: 40.4637, lon: -3.7492, stationCount: 900, entsoeAreaCode: "10YES-REE------0" },
  { code: "IT", name: "Italy", lat: 41.8719, lon: 12.5674, stationCount: 1100, entsoeAreaCode: "10Y1001A1001A73I" },
  { code: "NL", name: "Netherlands", lat: 52.1326, lon: 5.2913, stationCount: 1500, entsoeAreaCode: "10YNL----------L" },
  { code: "NO", name: "Norway", lat: 60.472, lon: 8.4689, stationCount: 2600, entsoeAreaCode: "10YNO-1--------2" },
  { code: "SE", name: "Sweden", lat: 60.1282, lon: 18.6435, stationCount: 1300, entsoeAreaCode: "10Y1001A1001A46L" },
  { code: "PL", name: "Poland", lat: 51.9194, lon: 19.1451, stationCount: 400, entsoeAreaCode: "10YPL-AREA-----S" },
  { code: "AT", name: "Austria", lat: 47.5162, lon: 14.5501, stationCount: 700, entsoeAreaCode: "10YAT-APG------L" },
  { code: "CH", name: "Switzerland", lat: 46.8182, lon: 8.2275, stationCount: 900, entsoeAreaCode: "10YCH-SWISSGRIDZ" },
  { code: "BE", name: "Belgium", lat: 50.5039, lon: 4.4699, stationCount: 650, entsoeAreaCode: "10YBE----------2" },
  { code: "DK", name: "Denmark", lat: 56.2639, lon: 9.5018, stationCount: 750, entsoeAreaCode: "10YDK-1--------W" },
  { code: "PT", name: "Portugal", lat: 39.3999, lon: -8.2245, stationCount: 350, entsoeAreaCode: "10YPT-REN------W" },
  { code: "IE", name: "Ireland", lat: 53.1424, lon: -7.6921, stationCount: 300, entsoeAreaCode: "10Y1001A1001A59C" },
  { code: "FI", name: "Finland", lat: 61.9241, lon: 25.7482, stationCount: 550, entsoeAreaCode: "10YFI-1--------U" },
  { code: "CZ", name: "Czechia", lat: 49.8175, lon: 15.473, stationCount: 300, entsoeAreaCode: "10YCZ-CEPS-----N" },
  { code: "GR", name: "Greece", lat: 39.0742, lon: 21.8243, stationCount: 200, entsoeAreaCode: "10YGR-HTSO-----Y" },
  { code: "HU", name: "Hungary", lat: 47.1625, lon: 19.5033, stationCount: 250, entsoeAreaCode: "10YHU-MAVIR----U" },
  { code: "RO", name: "Romania", lat: 45.9432, lon: 24.9668, stationCount: 200, entsoeAreaCode: "10YRO-TEL------P" },
];
