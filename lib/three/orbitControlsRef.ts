import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

/**
 * Mutable, non-reactive holder for the scene's single OrbitControls
 * instance, mirroring globeRotationRef's pattern — lets components deep in
 * the scene graph (e.g. RegionStationList) reach the controls directly
 * (e.g. to disable zoom while the pointer is over a floating overlay)
 * without prop-drilling a ref from Globe.tsx through every intermediate
 * component.
 */
export const orbitControlsRef: { current: OrbitControlsImpl | null } = { current: null };
