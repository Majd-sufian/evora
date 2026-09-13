"use client";

import { useMemo } from "react";
import * as THREE from "three";

const vertexShader = `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  varying vec3 vNormal;
  uniform vec3 glowColor;
  uniform float power;
  uniform float bias;
  uniform float strength;
  void main() {
    float intensity = pow(bias - dot(vNormal, vec3(0.0, 0.0, 1.0)), power);
    gl_FragColor = vec4(glowColor, 1.0) * intensity * strength;
  }
`;

type GlowShellProps = {
  radius: number;
  scale: number;
  power: number;
  bias: number;
  strength: number;
  color: string;
};

function GlowShell({ radius, scale, power, bias, strength, color }: GlowShellProps) {
  const uniforms = useMemo(
    () => ({
      glowColor: { value: new THREE.Color(color) },
      power: { value: power },
      bias: { value: bias },
      strength: { value: strength },
    }),
    [color, power, bias, strength]
  );

  return (
    <mesh scale={[scale, scale, scale]}>
      <sphereGeometry args={[radius, 64, 64]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        blending={THREE.AdditiveBlending}
        side={THREE.BackSide}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

export default function Atmosphere({ radius = 1 }: { radius?: number }) {
  return (
    <>
      {/* Thin, soft limb right at the globe's edge. */}
      <GlowShell radius={radius} scale={1.015} power={2.2} bias={0.82} strength={0.7} color="#9FE0F0" />
      {/* Faint, soft outer haze — subtle, not a glowing halo. */}
      <GlowShell radius={radius} scale={1.1} power={4.5} bias={0.6} strength={0.2} color="#5AC8E0" />
    </>
  );
}
