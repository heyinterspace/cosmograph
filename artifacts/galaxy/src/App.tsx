import { AppStateProvider, useAppState } from "@/lib/store";
import { Scene } from "@/components/Scene";
import { Overlay } from "@/components/Overlay";
import { Sidebar } from "@/components/Sidebar";
import { FlyCockpit } from "@/components/FlyCockpit";
import { DatasetLoadingOverlay } from "@/components/DatasetLoadingOverlay";

// Everything that reads the (swappable) dataset lives under a key={datasetVersion}
// wrapper so loading a new scientist fully remounts the 3D scene and panels,
// re-registering all object refs against the freshly rebuilt galaxy.
function GalaxyView() {
  const { datasetVersion, consoleOpen, introFinished } = useAppState();
  // While the intro/title screen plays the console is hidden entirely, so the
  // galaxy isn't shifted for it. Once the intro finishes: shift by half the
  // console width when open, or by the collapsed rail width (1.75rem) when shut.
  const galaxyShift = !introFinished
    ? "0px"
    : consoleOpen
      ? "calc(min(14rem,80vw) * -0.5)"
      : "-1.75rem";
  return (
    <div key={datasetVersion} className="relative h-full w-full overflow-hidden">
      {/* The 3D galaxy stays full-size and slides aside with a GPU transform when
          the console expands — instead of resizing the canvas (which reallocates
          the WebGL + bloom buffers and made the shift snap). The shift recenters
          the galaxy in the space left of the console: half the console's width. */}
      <div
        className="absolute inset-0 transition-transform duration-[450ms] ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform"
        style={{ transform: `translateX(${galaxyShift})` }}
      >
        <Scene />
      </div>
      {/* 2D HUD stays put (not translated) so nothing clips off the left edge. */}
      <FlyCockpit />
      <Overlay />
      {/* Console is hidden during the intro so nothing covers the title screen. */}
      {introFinished && <Sidebar />}
    </div>
  );
}

function App() {
  return (
    <AppStateProvider>
      <div className="w-screen h-[100dvh] bg-black text-foreground overflow-hidden relative font-sans">
        <GalaxyView />
        <DatasetLoadingOverlay />
      </div>
    </AppStateProvider>
  );
}

export default App;
