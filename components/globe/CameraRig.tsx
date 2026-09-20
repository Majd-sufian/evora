"use client";

import { RefObject, useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { useEvoraStore } from "@/lib/store";
import { COUNTRIES } from "@/lib/data/countries";
import { latLonToVector3 } from "@/lib/geo";
import { globeRotationRef } from "@/lib/three/globeRotation";
import { standardEasing } from "@/lib/easing";
import {
  COUNTRY_VIEW_DISTANCE,
  STATION_VIEW_DISTANCE,
  WORLD_VIEW_POSITION,
  ZOOM_TRANSITION_MS,
} from "@/lib/three/viewConstants";

type Transition = {
  from: THREE.Vector3;
  to: THREE.Vector3;
  start: number;
};

/** Animates the camera between World/Country/Station view targets on a 1.5s cubic-bezier ease. */
export default function CameraRig({
  controlsRef,
}: {
  controlsRef: RefObject<OrbitControlsImpl | null>;
}) {
  const { camera } = useThree();
  const viewLevel = useEvoraStore((s) => s.viewLevel);
  const selectedCountry = useEvoraStore((s) => s.selectedCountry);
  const selectedCityCluster = useEvoraStore((s) => s.selectedCityCluster);
  const selectedStation = useEvoraStore((s) => s.selectedStation);
  const transitionRef = useRef<Transition | null>(null);

  useEffect(() => {
    let target: THREE.Vector3;

    if (viewLevel === "world") {
      target = new THREE.Vector3(...WORLD_VIEW_POSITION);
    } else if (viewLevel === "station" && (selectedStation || selectedCityCluster)) {
      const point = selectedStation ?? selectedCityCluster!;
      const local = latLonToVector3(point.lat, point.lon, 1);
      target = local
        .applyAxisAngle(new THREE.Vector3(0, 1, 0), globeRotationRef.current)
        .normalize()
        .multiplyScalar(STATION_VIEW_DISTANCE);
    } else if (viewLevel === "country" && selectedCountry) {
      const country = COUNTRIES.find((c) => c.code === selectedCountry);
      if (!country) return;
      const local = latLonToVector3(country.lat, country.lon, 1);
      target = local
        .applyAxisAngle(new THREE.Vector3(0, 1, 0), globeRotationRef.current)
        .normalize()
        .multiplyScalar(COUNTRY_VIEW_DISTANCE);
    } else {
      return;
    }

    transitionRef.current = {
      from: camera.position.clone(),
      to: target,
      start: performance.now(),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewLevel, selectedCountry, selectedCityCluster, selectedStation]);

  useFrame(() => {
    const transition = transitionRef.current;
    if (!transition) return;

    const elapsed = performance.now() - transition.start;
    const progress = Math.min(elapsed / ZOOM_TRANSITION_MS, 1);
    const eased = standardEasing(progress);
    camera.position.lerpVectors(transition.from, transition.to, eased);
    controlsRef.current?.update();

    if (progress >= 1) {
      transitionRef.current = null;
    }
  });

  return null;
}
