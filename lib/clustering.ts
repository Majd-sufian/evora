import { ChargingStation } from "@/lib/types";

export type StationCluster = {
  id: string;
  lat: number;
  lon: number;
  stationIds: string[];
  count: number;
};

/**
 * Groups stations into coarse grid cells (~cellDegrees wide) so a country's
 * worth of markers reads as a handful of city-scale clusters instead of a
 * wall of overlapping individual pins. Each cluster is positioned at the
 * centroid of its members.
 */
export function clusterStations(stations: ChargingStation[], cellDegrees = 0.4): StationCluster[] {
  const cells = new Map<string, ChargingStation[]>();

  for (const station of stations) {
    const cellLat = Math.round(station.lat / cellDegrees);
    const cellLon = Math.round(station.lon / cellDegrees);
    const key = `${cellLat}:${cellLon}`;
    const bucket = cells.get(key);
    if (bucket) bucket.push(station);
    else cells.set(key, [station]);
  }

  return Array.from(cells.entries()).map(([key, members]) => {
    const lat = members.reduce((sum, s) => sum + s.lat, 0) / members.length;
    const lon = members.reduce((sum, s) => sum + s.lon, 0) / members.length;
    return {
      id: key,
      lat,
      lon,
      stationIds: members.map((s) => s.id),
      count: members.length,
    };
  });
}
