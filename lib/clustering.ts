import { ChargingStation } from "@/lib/types";

export type StationCluster = {
  id: string;
  lat: number;
  lon: number;
  stationIds: string[];
  count: number;
  /** Radius (degrees) from centroid to the farthest member — how much ground this cluster actually covers, not just how many stations it holds. */
  spreadDegrees: number;
  /** Best-effort region name (see pickRegionLabel below), or undefined if no
   * member station had a usable one — callers should fall back to a generic
   * label rather than leaving this blank in the UI. */
  label?: string;
};

// Country names in various languages/cases that occasionally show up in
// OpenChargeMap's StateOrProvince field standing in for a real region — a
// contributor filling in the country instead of the state. Not exhaustive,
// just the ones observed in our 20 countries' real data.
const REGION_LABEL_BLOCKLIST = new Set([
  "czech republic",
  "česká republika",
  "germany",
  "deutschland",
  "france",
  "netherlands",
  "nederland",
  "spain",
  "italy",
  "poland",
  "austria",
  "switzerland",
  "belgium",
  "denmark",
  "portugal",
  "ireland",
  "finland",
  "greece",
  "hungary",
  "romania",
  "sweden",
  "norway",
  "united kingdom",
]);

// A tiny seed list for abbreviations observed in real data — not a
// comprehensive gazetteer, just improves the specific cases we've actually
// seen without taking on a full alias table as scope.
const REGION_ALIASES: Record<string, string> = {
  bw: "Baden-Württemberg",
  nb: "Noord-Brabant",
};

function looksLikePlaceholder(value: string): boolean {
  const lower = value.toLowerCase();
  return lower.includes("select") || lower.includes("sélectionnez") || lower.includes("choose") || REGION_LABEL_BLOCKLIST.has(lower);
}

/**
 * Cleans one station's raw StateOrProvince value into a usable region name,
 * or null if it isn't one. OpenChargeMap's field is free-text and
 * crowdsourced — real examples seen: "bw" (an abbreviation), "Kreis Unna"
 * (a district, not a state), "Plzeň-Sever,Plzeňský kraj." (a comma-packed
 * district+region with trailing punctuation), "Czech republic" (the
 * country, not a region), "Sélectionnez un département / état" (a literal
 * unfilled form placeholder). Best-effort cleanup, not a correctness
 * guarantee — see pickRegionLabel below.
 */
function cleanRegionValue(raw: string): string | null {
  // When multiple names are packed into one comma-separated value, the last
  // segment is consistently the actual region/kraj name in the samples
  // we've seen — the earlier segments are finer-grained sub-district
  // qualifiers.
  const segments = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const candidate = segments[segments.length - 1] ?? raw;
  const trimmed = candidate.replace(/\.+$/, "").trim();
  if (trimmed.length < 2 || looksLikePlaceholder(trimmed)) return null;
  return REGION_ALIASES[trimmed.toLowerCase()] ?? trimmed;
}

/**
 * Picks the most common cleaned StateOrProvince value among a region
 * cluster's member stations as its display label. Real fill rates for this
 * field range from ~17% (Netherlands) to ~96% (France) across our 20
 * countries, so this can legitimately return undefined for a cluster where
 * no member has usable data — callers should fall back to a generic label
 * ("Region N") rather than a blank one. A precise fix would assign
 * stations to regions via real administrative-boundary polygons instead of
 * trusting this crowdsourced field; that's a larger follow-up, not done
 * here.
 */
function pickRegionLabel(members: ChargingStation[]): string | undefined {
  const counts = new Map<string, number>();
  for (const station of members) {
    if (!station.state) continue;
    const cleaned = cleanRegionValue(station.state);
    if (!cleaned) continue;
    counts.set(cleaned, (counts.get(cleaned) ?? 0) + 1);
  }
  let best: string | undefined;
  let bestCount = 0;
  Array.from(counts.entries()).forEach(([value, count]) => {
    if (count > bestCount) {
      best = value;
      bestCount = count;
    }
  });
  return best;
}

function gridKey(lat: number, lon: number, cellDegrees: number) {
  return `${Math.round(lat / cellDegrees)}:${Math.round(lon / cellDegrees)}`;
}

function toCluster(id: string, members: ChargingStation[]): StationCluster {
  const lat = members.reduce((sum, s) => sum + s.lat, 0) / members.length;
  const lon = members.reduce((sum, s) => sum + s.lon, 0) / members.length;
  const spreadDegrees = members.reduce((max, s) => Math.max(max, Math.hypot(s.lat - lat, s.lon - lon)), 0);
  return {
    id,
    lat,
    lon,
    stationIds: members.map((s) => s.id),
    count: members.length,
    spreadDegrees,
    label: pickRegionLabel(members),
  };
}

function bucketByGrid(stations: ChargingStation[], cellDegrees: number): StationCluster[] {
  const cells = new Map<string, ChargingStation[]>();
  for (const station of stations) {
    const key = gridKey(station.lat, station.lon, cellDegrees);
    const bucket = cells.get(key);
    if (bucket) bucket.push(station);
    else cells.set(key, [station]);
  }
  return Array.from(cells.entries()).map(([key, members]) => toCluster(key, members));
}

// Chosen to land in the same ballpark as a country's real number of
// first-level administrative regions (Germany has 16 states, France 13
// regions, Czechia 14 regions, the Netherlands 12 provinces) rather than
// the much denser city-level grouping this module used to produce.
const REGION_MAX_VISIBLE = 14;
const REGION_BASE_CELL_DEGREES = 1.2;
const REGION_MAX_CELL_DEGREES = 14;

/**
 * The grid bucketing is purely geographic, so a large state can straddle
 * two adjacent cells and come out as two same-named clusters (verified
 * against real data: Bavaria and Occitanie both split this way at the
 * default cell size). Since the label is exactly the signal that two
 * clusters are "the same place," merge any clusters that share one — this
 * only ever reduces the cluster count, so it can't push the result back
 * over REGION_MAX_VISIBLE. Clusters with no usable label are left alone:
 * merging unrelated unlabeled areas under a shared "unnamed" bucket would
 * hide real geographic separation rather than fix a duplicate.
 */
function mergeByLabel(clusters: StationCluster[]): StationCluster[] {
  const byLabel = new Map<string, StationCluster[]>();
  const unlabeled: StationCluster[] = [];
  for (const cluster of clusters) {
    if (!cluster.label) {
      unlabeled.push(cluster);
      continue;
    }
    const key = cluster.label.toLowerCase();
    const group = byLabel.get(key);
    if (group) group.push(cluster);
    else byLabel.set(key, [cluster]);
  }

  const merged: StationCluster[] = [];
  Array.from(byLabel.values()).forEach((group: StationCluster[]) => {
    if (group.length === 1) {
      merged.push(group[0]);
      return;
    }
    const totalCount = group.reduce((sum, c) => sum + c.count, 0);
    const lat = group.reduce((sum, c) => sum + c.lat * c.count, 0) / totalCount;
    const lon = group.reduce((sum, c) => sum + c.lon * c.count, 0) / totalCount;
    const spreadDegrees = group.reduce(
      (max, c) => Math.max(max, Math.hypot(c.lat - lat, c.lon - lon) + c.spreadDegrees),
      0
    );
    merged.push({
      id: group.map((c) => c.id).join("+"),
      lat,
      lon,
      stationIds: group.flatMap((c) => c.stationIds),
      count: totalCount,
      spreadDegrees,
      label: group[0].label,
    });
  });
  return [...merged, ...unlabeled];
}

/**
 * Groups a country's stations into a handful of region-scale clusters
 * (roughly state/province granularity) instead of a dense city-level grid.
 * Unlike a finer clustering, a cluster here is never split just for holding
 * "too many" stations — at this granularity a cluster's members are meant
 * to be browsed as a scrollable list (see RegionStationList), not
 * individually plotted on the globe, so there's no per-cluster cap. If the
 * initial grid still produces more than REGION_MAX_VISIBLE clusters, the
 * cell size coarsens (doubling until it fits) up to REGION_MAX_CELL_DEGREES,
 * then same-labeled clusters are merged (see mergeByLabel).
 */
export function clusterIntoRegions(stations: ChargingStation[]): StationCluster[] {
  if (stations.length === 0) return [];

  let cellDegrees = REGION_BASE_CELL_DEGREES;
  let result = bucketByGrid(stations, cellDegrees);

  while (result.length > REGION_MAX_VISIBLE && cellDegrees < REGION_MAX_CELL_DEGREES) {
    cellDegrees *= 1.6;
    result = bucketByGrid(stations, cellDegrees);
  }

  return mergeByLabel(result);
}
