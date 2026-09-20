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

/**
 * Spreads `count` markers that would otherwise sit on the exact same sphere
 * position (e.g. several real stations at one parking lot/depot) into a
 * small ring around that shared point, tangent to the sphere surface, so
 * each stays visually distinct and individually clickable instead of
 * stacking into one unclickable blob. Returns `count` positions in a fixed,
 * deterministic order (no randomness, so re-renders don't jitter).
 */
export function spiderfyPositions(center: Vector3, count: number, ringRadius: number): Vector3[] {
  if (count <= 1) return [center.clone()];

  const normal = center.clone().normalize();
  const arbitrary = Math.abs(normal.y) < 0.99 ? new Vector3(0, 1, 0) : new Vector3(1, 0, 0);
  const tangentA = new Vector3().crossVectors(normal, arbitrary).normalize();
  const tangentB = new Vector3().crossVectors(normal, tangentA).normalize();

  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2;
    const offset = tangentA
      .clone()
      .multiplyScalar(Math.cos(angle) * ringRadius)
      .add(tangentB.clone().multiplyScalar(Math.sin(angle) * ringRadius));
    return center.clone().add(offset);
  });
}
