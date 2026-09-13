export const GLOBE_RADIUS = 1;

export const WORLD_VIEW_DISTANCE = 2.5;

// The spec's literal Country (1.4) / Station (0.8) distances assume a globe
// radius smaller than ours; at GLOBE_RADIUS=1 a distance of 0.8 puts the
// camera inside the sphere. Since World View's framing (radius 1, distance
// 2.5) is already tuned and approved, these two are rescaled to sit safely
// outside the surface while preserving the same relative zoom-in progression
// (each level ~1.47x closer than the last, matching the spec's ~1.75-1.79x
// step ratio) rather than reworking the whole scene around a smaller globe.
export const COUNTRY_VIEW_DISTANCE = 1.7;
export const STATION_VIEW_DISTANCE = 1.15;

// Camera kept at the spec'd 2.5-unit distance for World View, angled up just
// enough that Europe centers in frame instead of Africa.
export const WORLD_VIEW_POSITION: [number, number, number] = [0, 1.35, 2.09];

export const ZOOM_TRANSITION_MS = 1500;
