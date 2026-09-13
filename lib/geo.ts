import { Vector3 } from "three";

/**
 * Converts geographic coordinates to a position on a sphere of the given
 * radius, using the standard three.js sphere UV convention (texture seam
 * at lon = -180/180, pole at +Y).
 */
export function latLonToVector3(lat: number, lon: number, radius: number): Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  return new Vector3(x, y, z);
}
