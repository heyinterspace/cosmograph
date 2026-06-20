import { useRef } from "react";
import { useAppState } from "@/lib/store";
import { Cockpit } from "./Cockpit";

// Renders the cockpit canopy during free-fly. Mounted as its own layer between
// the 3D Scene (z-0) and the Overlay UI (z-10) so the canopy always sits above
// the canvas yet below the interactive controls.
export function FlyCockpit() {
  const { cameraMode, tourActive, introFinished } = useAppState();
  const warpRef = useRef<HTMLDivElement>(null);
  const active = introFinished && !tourActive && cameraMode === "spaceship";
  if (!active) return null;
  return <Cockpit warpRef={warpRef} className="z-[5]" />;
}
