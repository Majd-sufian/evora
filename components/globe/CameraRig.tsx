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
  WORLD_VIEW_DISTANCE,
  WORLD_VIEW_POSITION,
  ZOOM_TRANSITION_MS,
  aspectDistanceMultiplier,
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
  const { camera, size } = useThree();
  const viewLevel = useEvoraStore((s) => s.viewLevel);
  const selectedCountry = useEvoraStore((s) => s.selectedCountry);
  const selectedCityCluster = useEvoraStore((s) => s.selectedCityCluster);
  const selectedStation = useEvoraStore((s) => s.selectedStation);
  const flyToTarget = useEvoraStore((s) => s.flyToTarget);
  const goBack = useEvoraStore((s) => s.goBack);
  const exitStationView = useEvoraStore((s) => s.exitStationView);
  const transitionRef = useRef<Transition | null>(null);
  // Remembers where the camera actually was at World View — including any
  // manual OrbitControls drag — so returning to World View from Country or
  // Station View restores that exact spot instead of resetting to the
  // default framing every time.
  const lastWorldViewPositionRef = useRef<THREE.Vector3 | null>(null);

  useEffect(() => {
    const aspect = size.width / size.height;
    const fit = aspectDistanceMultiplier(aspect);
    let target: THREE.Vector3;

    if (viewLevel === "world") {
      // A previously-saved position already has whatever aspect adjustment
      // was in effect when it was captured — only the fresh default needs
      // `fit` applied here.
      target = lastWorldViewPositionRef.current?.clone() ?? new THREE.Vector3(...WORLD_VIEW_POSITION).multiplyScalar(fit);
    } else if (viewLevel === "station" && (selectedStation || selectedCityCluster || flyToTarget)) {
      const point = selectedStation ?? selectedCityCluster ?? flyToTarget!;
      const local = latLonToVector3(point.lat, point.lon, 1);
      target = local
        .applyAxisAngle(new THREE.Vector3(0, 1, 0), globeRotationRef.current)
        .normalize()
        .multiplyScalar(STATION_VIEW_DISTANCE * fit);
    } else if (viewLevel === "country" && selectedCountry) {
      const country = COUNTRIES.find((c) => c.code === selectedCountry);
      if (!country) return;
      const local = latLonToVector3(country.lat, country.lon, 1);
      target = local
        .applyAxisAngle(new THREE.Vector3(0, 1, 0), globeRotationRef.current)
        .normalize()
        .multiplyScalar(COUNTRY_VIEW_DISTANCE * fit);
    } else {
      return;
    }

    transitionRef.current = {
      from: camera.position.clone(),
      to: target,
      start: performance.now(),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewLevel, selectedCountry, selectedCityCluster, selectedStation, flyToTarget, size.width, size.height]);

  useFrame(() => {
    const transition = transitionRef.current;
    if (transition) {
      const elapsed = performance.now() - transition.start;
      const progress = Math.min(elapsed / ZOOM_TRANSITION_MS, 1);
      const eased = standardEasing(progress);
      camera.position.lerpVectors(transition.from, transition.to, eased);
      controlsRef.current?.update();

      if (progress >= 1) {
        transitionRef.current = null;
      }
    }

    if (!transitionRef.current) {
      // Continuously track the camera's position while settled at World
      // View (never mid-transition, which would capture interpolated
      // values), so a manual orbit/drag there is remembered for next time.
      if (viewLevel === "world") {
        lastWorldViewPositionRef.current = camera.position.clone();
      }

      // Natural zoom-out: OrbitControls lets the camera scroll/drag freely
      // regardless of viewLevel, so without this a user could zoom the
      // camera well past Station or Country View's own distance while the
      // filtered marker set stayed exactly as it was — looking broken/empty.
      // Thresholds scale with the same aspect-fit multiplier as the targets
      // above, so this still triggers at the right relative zoom on phones.
      const fit = aspectDistanceMultiplier(size.width / size.height);
      const stationToCountryThreshold = ((STATION_VIEW_DISTANCE + COUNTRY_VIEW_DISTANCE) / 2) * fit;
      const countryToWorldThreshold = ((COUNTRY_VIEW_DISTANCE + WORLD_VIEW_DISTANCE) / 2) * fit;
      const distance = camera.position.length();
      if (viewLevel === "station" && distance > stationToCountryThreshold) {
        exitStationView();
      } else if (viewLevel === "country" && distance > countryToWorldThreshold) {
        goBack();
      }
    }
  });

  return null;
}
