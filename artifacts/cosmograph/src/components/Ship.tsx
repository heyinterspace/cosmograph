import { useMemo } from "react";
import * as THREE from "three";

// A small low-poly cosmonaut craft. The model is built so its NOSE points along
// local +Z, which lets callers orient it with
// `quaternion.setFromUnitVectors(FORWARD, dir)` for any heading.
export const SHIP_FORWARD = new THREE.Vector3(0, 0, 1);

// Shared geometries — one set for every ship in the scene (peers + self), built
// lazily on first use and kept for the app's lifetime. Nose baked toward +Z.
let geos: {
  body: THREE.ConeGeometry;
  wing: THREE.BoxGeometry;
  fin: THREE.BoxGeometry;
  cockpit: THREE.SphereGeometry;
} | null = null;

function getGeometries() {
  if (geos) return geos;
  const body = new THREE.ConeGeometry(2.4, 10, 16);
  body.rotateX(Math.PI / 2); // tip from +Y to +Z
  const wing = new THREE.BoxGeometry(12, 0.5, 3.4);
  const fin = new THREE.BoxGeometry(0.5, 3.4, 3);
  const cockpit = new THREE.SphereGeometry(1.3, 12, 12);
  geos = { body, wing, fin, cockpit };
  return geos;
}

// Soft radial glow sprite for the engine plume / distance halo.
let glowTexture: THREE.Texture | null = null;
export function getGlowTexture(): THREE.Texture {
  if (glowTexture) return glowTexture;
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  );
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.35, "rgba(255,255,255,0.5)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  glowTexture = new THREE.CanvasTexture(canvas);
  glowTexture.colorSpace = THREE.SRGBColorSpace;
  return glowTexture;
}

/**
 * A single ship. Nose points local +Z. `opacity` < 1 makes it semi-transparent
 * (used for the viewer's own chase ship so it never occludes the UI); `glow`
 * adds an additive engine halo so distant peers still read as a point of light.
 */
export function ShipModel({
  color = "#9ec5ff",
  opacity = 1,
  glow = true,
}: {
  color?: string;
  opacity?: number;
  glow?: boolean;
}) {
  const g = getGeometries();
  const semi = opacity < 1;

  const hullMat = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({
      color,
      metalness: 0.35,
      roughness: 0.45,
      emissive: new THREE.Color(color),
      emissiveIntensity: 0.35,
      transparent: semi,
      opacity,
      depthWrite: !semi,
    });
    return m;
  }, [color, opacity, semi]);

  const glassMat = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({
      color: "#bfe8ff",
      emissive: new THREE.Color("#bfe8ff"),
      emissiveIntensity: 0.5,
      metalness: 0.1,
      roughness: 0.2,
      transparent: semi,
      opacity: semi ? opacity * 1.1 : 1,
      depthWrite: !semi,
    });
    return m;
  }, [opacity, semi]);

  return (
    <group>
      <mesh geometry={g.body} material={hullMat} />
      <mesh geometry={g.wing} material={hullMat} position={[0, -0.2, -2]} />
      <mesh geometry={g.fin} material={hullMat} position={[0, 1.4, -3.2]} />
      <mesh geometry={g.cockpit} material={glassMat} position={[0, 0.5, 1.4]} />
      {glow && (
        <sprite position={[0, 0, -5.5]} scale={[9, 9, 9]}>
          <spriteMaterial
            map={getGlowTexture()}
            color={color}
            transparent
            opacity={0.85 * opacity}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </sprite>
      )}
    </group>
  );
}
