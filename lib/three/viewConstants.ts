export const GLOBE_RADIUS = 1;

export const WORLD_VIEW_DISTANCE = 2.5;

// The spec's literal Country (1.4) / Station (0.8) distances assume a globe
// radius smaller than ours; at GLOBE_RADIUS=1 a distance of 0.8 puts the
// camera inside the sphere. Since World View's framing (radius 1, distance
// 2.5) is already tuned and approved, these two are rescaled to sit safely
// outside the surface while preserving the same relative zoom-in progression
// (each level ~1.47x closer than the last, matching the spec's ~1.75-1.79x
// step ratio) rather than reworking the whole scene around a smaller globe.
export const COUNTRY_VIEW_DISTANCE = 1.4;
export const STATION_VIEW_DISTANCE = 1.15;

// Camera kept at the spec'd 2.5-unit distance for World View, angled up just
// enough that Europe centers in frame instead of Africa.
export const WORLD_VIEW_POSITION: [number, number, number] = [0, 1.35, 2.09];

export const ZOOM_TRANSITION_MS = 1500;

// All three view distances above were tuned against a landscape-ish aspect
// ratio. A PerspectiveCamera's `fov` is its VERTICAL field of view (60°,
// matching the Canvas prop in Globe.tsx), so on a narrower (portrait,
// aspect < 1) viewport the horizontal FOV shrinks well below what these
// distances assume — the globe (which needs equal clearance in both
// directions) ends up overflowing left/right. Backing the camera further
// away on narrow aspects compensates without touching `fov` (which would
// otherwise introduce fisheye-style vertical distortion).
//
// This is computed from the actual FOV/aspect geometry (how far back the
// camera must sit for the globe's angular size to clear the *horizontal*
// half-FOV) rather than the flat `1.2 / aspect` approximation this used to
// be — the approximation was backing the camera off far more than the
// geometry actually requires (a flat 2.2x multiplier on a typical phone's
// ~0.46 aspect, vs. the ~1.7x the math calls for), rendering the globe
// noticeably smaller on mobile than necessary.
const VERTICAL_FOV_DEG = 60;
// Extra breathing room beyond the bare mathematical minimum, so the globe's
// edge doesn't sit exactly at the viewport boundary.
const HORIZONTAL_FIT_MARGIN = 1.08;
// Sanity ceiling for pathologically narrow/tall aspects, so the camera
// never backs off so far the globe becomes tiny regardless of viewport shape.
const ASPECT_FIT_MAX_MULTIPLIER = 1.9;

export function aspectDistanceMultiplier(aspect: number): number {
  const verticalHalfFovRad = (VERTICAL_FOV_DEG / 2) * (Math.PI / 180);
  const horizontalHalfFovRad = Math.atan(Math.tan(verticalHalfFovRad) * aspect);
  const requiredDistance = (GLOBE_RADIUS / Math.sin(horizontalHalfFovRad)) * HORIZONTAL_FIT_MARGIN;
  const required = requiredDistance / WORLD_VIEW_DISTANCE;
  return Math.max(1, Math.min(required, ASPECT_FIT_MAX_MULTIPLIER));
}

// OrbitControls must allow at least this much distance, or its own internal
// clamping (reapplied every controls.update() call) would immediately undo
// a camera position backed off for a narrow aspect via the multiplier above.
export const MAX_ORBIT_DISTANCE = WORLD_VIEW_DISTANCE * ASPECT_FIT_MAX_MULTIPLIER;
