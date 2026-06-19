import { useFrame } from "@react-three/fiber";
import { OrbitControls, PointerLockControls } from "@react-three/drei";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useAppState } from "@/lib/store";
import { planetRefs, sunRefs, planetOrbits, sunRadii } from "./GalaxySystem";

const HOME_POS = new THREE.Vector3(0, 1100, 1700);

export function CameraController() {
  const { cameraMode, selectedObject } = useAppState();
  const orbitRef = useRef<any>(null);

  const targetPosition = useRef(new THREE.Vector3().copy(HOME_POS));
  const targetLookAt = useRef(new THREE.Vector3());

  // Fly-to animation runs only briefly after a selection changes; afterwards we
  // hand control back to OrbitControls so scroll-to-zoom and orbit work freely.
  const focusing = useRef(false);
  const focusElapsed = useRef(0);

  useEffect(() => {
    if (cameraMode !== "god") return;
    focusing.current = true;
    focusElapsed.current = 0;
    if (orbitRef.current) orbitRef.current.enabled = false;
  }, [cameraMode, selectedObject?.type, selectedObject?.id]);

  const keys = useRef({ forward: false, backward: false, left: false, right: false });
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());

  useEffect(() => {
    const isTyping = () => {
      const el = document.activeElement;
      return !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || (el as HTMLElement).isContentEditable);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (cameraMode !== "spaceship" || isTyping()) return;
      switch (e.code) {
        case "ArrowUp":
        case "KeyW": keys.current.forward = true; break;
        case "ArrowLeft":
        case "KeyA": keys.current.left = true; break;
        case "ArrowDown":
        case "KeyS": keys.current.backward = true; break;
        case "ArrowRight":
        case "KeyD": keys.current.right = true; break;
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (cameraMode !== "spaceship") return;
      switch (e.code) {
        case "ArrowUp":
        case "KeyW": keys.current.forward = false; break;
        case "ArrowLeft":
        case "KeyA": keys.current.left = false; break;
        case "ArrowDown":
        case "KeyS": keys.current.backward = false; break;
        case "ArrowRight":
        case "KeyD": keys.current.right = false; break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [cameraMode]);

  useFrame((state, delta) => {
    if (cameraMode === "god") {
      const orbit = orbitRef.current;
      const worldPos = new THREE.Vector3();
      let hasTarget = false;
      let offset = new THREE.Vector3(0, 30, 60);

      if (selectedObject) {
        if (selectedObject.type === "sun") {
          const sun = sunRefs[selectedObject.id];
          if (sun) {
            sun.getWorldPosition(worldPos);
            hasTarget = worldPos.lengthSq() > 0;
          }
          const r = sunRadii[selectedObject.id] || 20;
          offset = new THREE.Vector3(0, r * 4 + 30, r * 9 + 60);
        } else if (selectedObject.type === "planet") {
          const planet = planetRefs[selectedObject.id];
          if (planet) {
            planet.getWorldPosition(worldPos);
            hasTarget = worldPos.lengthSq() > 0;
          }
          const pr = planetOrbits[selectedObject.id]?.planetRadius || 1;
          offset = new THREE.Vector3(0, pr * 6 + 8, pr * 16 + 16);
        }
      }

      const lookAt = hasTarget ? worldPos : new THREE.Vector3(0, 0, 0);

      if (focusing.current) {
        // Brief fly-to: drive both camera and pivot toward the framed target.
        targetLookAt.current.copy(lookAt);
        targetPosition.current.copy(hasTarget ? worldPos.clone().add(offset) : HOME_POS);
        state.camera.position.lerp(targetPosition.current, delta * 3);
        if (orbit) orbit.target.lerp(targetLookAt.current, delta * 3);
        focusElapsed.current += delta;
        if (focusElapsed.current > 1.3) {
          focusing.current = false;
          if (orbit) orbit.enabled = true;
        }
      } else if (hasTarget && orbit) {
        // Keep the selected object centered, but let the user zoom/orbit freely.
        orbit.target.lerp(lookAt, delta * 2);
      }
      if (orbit) orbit.update();
    } else if (cameraMode === "spaceship") {
      const speed = 600.0 * delta;

      direction.current.z = Number(keys.current.forward) - Number(keys.current.backward);
      direction.current.x = Number(keys.current.right) - Number(keys.current.left);
      direction.current.normalize();

      if (keys.current.forward || keys.current.backward) velocity.current.z -= direction.current.z * speed;
      if (keys.current.left || keys.current.right) velocity.current.x -= direction.current.x * speed;

      state.camera.translateZ(velocity.current.z);
      state.camera.translateX(velocity.current.x);

      velocity.current.multiplyScalar(0.9);
    }
  });

  if (cameraMode === "spaceship") {
    return <PointerLockControls selector="#root" />;
  }

  return (
    <OrbitControls
      ref={orbitRef}
      makeDefault
      enableDamping
      dampingFactor={0.05}
      maxDistance={9000}
      minDistance={12}
      maxPolarAngle={Math.PI / 1.4}
    />
  );
}
