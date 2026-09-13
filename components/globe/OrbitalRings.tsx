"use client";

const RINGS: { radius: number; tube: number; rotation: [number, number, number]; opacity: number }[] = [
  { radius: 1.5, tube: 0.004, rotation: [Math.PI / 2.3, 0.2, 0], opacity: 0.28 },
  { radius: 1.75, tube: 0.003, rotation: [Math.PI / 3, Math.PI / 5, 0.3], opacity: 0.18 },
  { radius: 2.0, tube: 0.0025, rotation: [Math.PI / 1.7, -Math.PI / 4, 0.6], opacity: 0.12 },
];

export default function OrbitalRings() {
  return (
    <>
      {RINGS.map((ring, i) => (
        <mesh key={i} rotation={ring.rotation}>
          <torusGeometry args={[ring.radius, ring.tube, 8, 128]} />
          <meshBasicMaterial color="#00D4FF" transparent opacity={ring.opacity} />
        </mesh>
      ))}
    </>
  );
}
