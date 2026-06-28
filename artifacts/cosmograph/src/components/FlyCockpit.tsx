import { useRef } from "react";
import { useAppState } from "@/lib/store";
import { useIsMobile } from "@/hooks/use-mobile";
import { Cockpit } from "./Cockpit";

// Renders the cockpit canopy during free-fly. Mounted as its own layer between
// the 3D Scene (z-0) and the Overlay UI (z-10) so the canopy always sits above
// the canvas yet below the interactive controls.
export function FlyCockpit() {
  const { cameraMode, tourActive, introFinished, consoleOpen } = useAppState();
  const isMobile = useIsMobile();
  const warpRef = useRef<HTMLDivElement>(null);
  const active = introFinished && !tourActive && cameraMode === "spaceship";
  if (!active) return null;
  // Confine the cockpit canopy + HUD to the SAME visible region as the galaxy
  // canvas (GalaxyView's rightInset). On desktop the Mission Control console
  // occupies the right edge, so the windshield shrinks to fit the open space
  // beside it — otherwise the full-width HUD (Nav/Drive readouts) slides under
  // the panel and gets occluded. Kept in lockstep with the canvas + panel width
  // animation (280ms, same easing). On mobile the console docks to the bottom,
  // so the cockpit stays full-width.
  const right = isMobile ? "0px" : consoleOpen ? "min(12rem,80vw)" : "3.5rem";
  return (
    <div
      className="absolute inset-y-0 left-0 z-[5] transition-[right] duration-[280ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
      style={{ right }}
    >
      <Cockpit warpRef={warpRef} className="z-0" />
    </div>
  );
}
