import { ChargingStation } from "@/lib/types";

export type StationCluster = {
  id: string;
  lat: number;
  lon: number;
  stationIds: string[];
  count: number;
  /** Radius (degrees) from centroid to the farthest member — how much ground this cluster actually covers, not just how many stations it holds. */
  spreadDegrees: number;
};

const MIN_CELL_DEGREES = 0.05;
const MAX_STATIONS_PER_CLUSTER = 8;

function gridKey(lat: number, lon: number, cellDegrees: number) {
  return `${Math.round(lat / cellDegrees)}:${Math.round(lon / cellDegrees)}`;
}

function toCluster(id: string, members: ChargingStation[]): StationCluster {
  const lat = members.reduce((sum, s) => sum + s.lat, 0) / members.length;
  const lon = members.reduce((sum, s) => sum + s.lon, 0) / members.length;
  const spreadDegrees = members.reduce((max, s) => Math.max(max, Math.hypot(s.lat - lat, s.lon - lon)), 0);
  return { id, lat, lon, stationIds: members.map((s) => s.id), count: members.length, spreadDegrees };
}

function subdivide(stations: ChargingStation[], cellDegrees: number, depth: number): StationCluster[] {
  const cells = new Map<string, ChargingStation[]>();
  for (const station of stations) {
    const key = gridKey(station.lat, station.lon, cellDegrees);
    const bucket = cells.get(key);
    if (bucket) bucket.push(station);
    else cells.set(key, [station]);
  }

  const result: StationCluster[] = [];
  Array.from(cells.entries()).forEach(([key, members]) => {
    const tooBig = members.length > MAX_STATIONS_PER_CLUSTER;
    const canGoFiner = cellDegrees / 2 >= MIN_CELL_DEGREES;
    if (tooBig && canGoFiner) {
      // Recurse into a finer grid just for this crowded cell, so a dense
      // metro area naturally resolves into several smaller, more localized
      // clusters instead of one marker standing in for dozens of stations.
      result.push(...subdivide(members, cellDegrees / 2, depth + 1));
    } else if (tooBig) {
      // Hit the grid's minimum resolution and members are still packed
      // tighter than that — geography alone can't separate them any
      // further, so fall back to splitting by count. Keeps the "no cluster
      // stands in for an unreasonable pile of stations" guarantee airtight
      // even for a genuinely hyper-dense cluster of charging points.
      for (let i = 0; i < members.length; i += MAX_STATIONS_PER_CLUSTER) {
        const chunk = members.slice(i, i + MAX_STATIONS_PER_CLUSTER);
        result.push(toCluster(`${depth}:${key}:${i / MAX_STATIONS_PER_CLUSTER}`, chunk));
      }
    } else {
      result.push(toCluster(`${depth}:${key}`, members));
    }
  });
  return result;
}

/**
 * Picks a base grid cell size from how many stations are being clustered,
 * so a sparse country doesn't fragment into a dozen single-station pins
 * while a dense one still starts from a reasonably fine grid.
 */
function adaptiveCellSize(stationCount: number): number {
  if (stationCount > 80) return 0.2;
  if (stationCount > 30) return 0.3;
  return 0.4;
}

/**
 * Groups stations into grid cells so a country's worth of markers reads as
 * a handful of city-scale clusters instead of a wall of overlapping
 * individual pins. Each cluster is positioned at the centroid of its
 * members. Cell size adapts to local density, and any cell that still ends
 * up holding more than MAX_STATIONS_PER_CLUSTER stations is recursively
 * subdivided (down to MIN_CELL_DEGREES) so no single marker ever represents
 * an unreasonably large — or large-area — group of stations.
 */
export function clusterStations(stations: ChargingStation[], baseCellDegrees?: number): StationCluster[] {
  if (stations.length === 0) return [];
  const cellDegrees = baseCellDegrees ?? adaptiveCellSize(stations.length);
  return subdivide(stations, cellDegrees, 0);
}
