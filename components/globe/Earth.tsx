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

// Duotone the satellite texture by luminance into a near-black base and the
// app's cyan accent, so the globe reads as part of the same design system as
// the HUD panels instead of clashing with its own color language.
const fragmentShader = `
  uniform sampler2D map;
  uniform vec3 darkColor;
  uniform vec3 brightColor;
  uniform float contrast;
  varying vec2 vUv;
  varying vec3 vNormal;
  void main() {
    vec3 color = texture2D(map, vUv).rgb;
    float luma = dot(color, vec3(0.299, 0.587, 0.114));
    float shaped = pow(clamp(luma, 0.0, 1.0), contrast);
    vec3 duotone = mix(darkColor, brightColor, shaped);
    float facing = max(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0)), 0.0);
    float shade = 0.65 + 0.35 * facing;
    gl_FragColor = vec4(duotone * shade, 1.0);
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
          darkColor: { value: new THREE.Color("#050A0F") },
          brightColor: { value: new THREE.Color("#00D4FF") },
          contrast: { value: 1.6 },
        }}
      />
    </mesh>
  );
}
