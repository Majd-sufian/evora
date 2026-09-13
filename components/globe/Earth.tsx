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

// Recolors the black-land/white-ocean specular mask into glowing cyan
// continents on a dark ocean, with soft camera-facing shading so the globe
// always reads bright instead of falling into photographic, cold shadow.
const fragmentShader = `
  uniform sampler2D landMask;
  uniform vec3 landColor;
  uniform vec3 oceanColor;
  varying vec2 vUv;
  varying vec3 vNormal;
  void main() {
    float oceanAmount = texture2D(landMask, vUv).r;
    vec3 base = mix(landColor, oceanColor, oceanAmount);
    float facing = max(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0)), 0.0);
    float shade = 0.55 + 0.45 * facing;
    gl_FragColor = vec4(base * shade, 1.0);
  }
`;

export default function Earth({ onPointerOver, onPointerOut }: EarthProps) {
  const landMask = useLoader(THREE.TextureLoader, "/textures/earth_specular_2048.jpg");

  return (
    <mesh onPointerOver={onPointerOver} onPointerOut={onPointerOut}>
      <sphereGeometry args={[1, 64, 64]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          landMask: { value: landMask },
          landColor: { value: new THREE.Color("#5FD9FF") },
          oceanColor: { value: new THREE.Color("#050E1C") },
        }}
      />
    </mesh>
  );
}
