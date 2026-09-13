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

// Land brightness is driven by the land/ocean mask (so every country reads
// clearly, regardless of how dark its terrain photographs) with the satellite
// photo layered in only as a subtle relief modulation on top of that floor.
const fragmentShader = `
  uniform sampler2D map;
  uniform sampler2D landMask;
  uniform vec3 darkColor;
  uniform vec3 brightColor;
  uniform float contrast;
  varying vec2 vUv;
  varying vec3 vNormal;
  void main() {
    float oceanAmount = texture2D(landMask, vUv).r;

    vec3 photo = texture2D(map, vUv).rgb;
    float luma = dot(photo, vec3(0.299, 0.587, 0.114));
    float relief = pow(clamp(luma, 0.0, 1.0), contrast);
    float landBrightness = mix(0.55, 0.95, relief);

    vec3 land = brightColor * landBrightness;
    vec3 duotone = mix(land, darkColor, oceanAmount);

    float facing = max(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0)), 0.0);
    float shade = 0.78 + 0.22 * facing;
    gl_FragColor = vec4(duotone * shade, 1.0);
  }
`;

export default function Earth({ onPointerOver, onPointerOut }: EarthProps) {
  const map = useLoader(THREE.TextureLoader, "/textures/earth_atmos_2048.jpg");
  const landMask = useLoader(THREE.TextureLoader, "/textures/earth_specular_2048.jpg");

  return (
    <mesh onPointerOver={onPointerOver} onPointerOut={onPointerOut}>
      <sphereGeometry args={[1, 64, 64]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          map: { value: map },
          landMask: { value: landMask },
          darkColor: { value: new THREE.Color("#0A141F") },
          brightColor: { value: new THREE.Color("#5AC8E0") },
          contrast: { value: 1.1 },
        }}
      />
    </mesh>
  );
}
