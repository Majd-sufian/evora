/**
 * Mutable, non-reactive holder for the rotating globe's current Y rotation.
 * RotatingGlobe writes to it every frame; CameraRig reads it (only while the
 * globe is paused, i.e. not at world view) to project a lat/lon into the
 * globe's current world orientation without needing React state/re-renders.
 */
export const globeRotationRef = { current: 0 };
