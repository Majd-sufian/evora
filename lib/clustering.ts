import { ChargingStation } from "@/lib/types";

export type StationCluster = {
  id: string;
  lat: number;
  lon: number;
  stationIds: string[];
  count: number;
  /** Radius (degrees) from centroid to the farthest member ... how much ground this cluster actually covers, not just how many stations it holds. */
  spreadDegrees: number;
};

const MIN_CELL_DEGREES = 0.05;
// Raised from an earlier 8 ... verified against real Romania data (200
// stations, genuinely scattered with one dense pocket) that an 8-station cap
// mathematically forces at least 25 clusters even in the best case, which is
// exactly the "overwhelming, overlapping badges" bug reported live. 20
// brings the floor down to 10, and Station View's spiderfy layout now
// spreads a cluster across multiple concentric rings (see lib/geo.ts) so a
// 20-station cluster is still legible there, not just theoretically allowed.
const MAX_STATIONS_PER_CLUSTER = 20;
// A country with hundreds of real stations can still resolve into dozens of
// small clusters even with adaptive cell sizing and the relaxed per-cluster
// cap above ... fine per-cluster, but as a simultaneously-visible set it reads
// as an overwhelming, overlapping mess. Capping the visible count and
// coarsening the grid until clusters fit under it keeps Country View
// legible; each cluster just represents more ground when there's genuinely
// a lot of it, which is what the size-by-spread visual already communicates.
//
// 28 (not a rounder, more aspirational number) was chosen empirically:
// tested against real Romania data (200 genuinely unevenly-scattered
// stations, one dense pocket) at base cell sizes from 1 to 30 degrees ...
// geographic recursive subdivision plateaus around 26-31 clusters no matter
// how coarse the starting grid gets, because it keeps respecting real
// geographic shape at each split rather than arbitrarily chunking by count.
// Getting meaningfully lower (the original 16 target) would need giving up
// on that geographic coherence, or a proper screen-space decluttering pass
// ... see PROJECT_STATUS.md's map-detail section for why that's better solved
// by migrating to a real vector-tile clustering library than hand-rolled
// here.
const MAX_VISIBLE_CLUSTERS = 28;
const MAX_BASE_CELL_DEGREES = 10;

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
      // tighter than that ... geography alone can't separate them any
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
 * an unreasonably large ... or large-area ... group of stations.
 *
 * When called with the default (density-adaptive) cell size, the result is
 * also capped to MAX_VISIBLE_CLUSTERS: if clustering still produces more
 * than that many simultaneously-visible badges, the base cell size doubles
 * (up to MAX_BASE_CELL_DEGREES) and clustering re-runs, so a very dense
 * country still reads as a legible handful of clusters rather than an
 * overlapping crowd. An explicitly-passed baseCellDegrees is respected
 * exactly, with no auto-coarsening ... used where deterministic, uncapped
 * output matters (e.g. tests).
 */
export function clusterStations(stations: ChargingStation[], baseCellDegrees?: number): StationCluster[] {
  if (stations.length === 0) return [];

  let cellDegrees = baseCellDegrees ?? adaptiveCellSize(stations.length);
  let result = subdivide(stations, cellDegrees, 0);

  if (baseCellDegrees === undefined) {
    while (result.length > MAX_VISIBLE_CLUSTERS && cellDegrees < MAX_BASE_CELL_DEGREES) {
      cellDegrees *= 1.6;
      result = subdivide(stations, cellDegrees, 0);
    }
  }

  return result;
}
