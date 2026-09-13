"use client";

import { useLoader } from "@react-three/fiber";
import * as THREE from "three";

type EarthProps = {
  onPointerOver?: () => void;
  onPointerOut?: () => void;
};

const vertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// The raw satellite composite reads dark and muted; boost saturation and
// brightness so it reads closer to a vivid, map-style globe (Apple Maps-like)
// instead of a literal photographic render, then shade gently toward the limb.
const fragmentShader = `
  uniform sampler2D map;
  uniform float saturation;
  uniform float brightness;
  varying vec2 vUv;
  varying vec3 vNormal;
  void main() {
    vec3 color = texture2D(map, vUv).rgb;
    float luma = dot(color, vec3(0.299, 0.587, 0.114));
    vec3 vivid = mix(vec3(luma), color, saturation) * brightness;
    float facing = max(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0)), 0.0);
    float shade = 0.6 + 0.4 * facing;
    gl_FragColor = vec4(vivid * shade, 1.0);
  }
`;

export default function Earth({ onPointerOver, onPointerOut }: EarthProps) {
  const map = useLoader(THREE.TextureLoader, "/textures/earth_atmos_2048.jpg");

  return (
    <mesh onPointerOver={onPointerOver} onPointerOut={onPointerOut}>
      <sphereGeometry args={[1, 64, 64]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          map: { value: map },
          saturation: { value: 1.7 },
          brightness: { value: 1.55 },
        }}
      />
    </mesh>
  );
}
