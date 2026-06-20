import { AppStateProvider } from "@/lib/store";
import { Scene } from "@/components/Scene";
import { Overlay } from "@/components/Overlay";
import { FlyCockpit } from "@/components/FlyCockpit";

function App() {
  return (
    <AppStateProvider>
      <div className="w-screen h-[100dvh] bg-black text-foreground overflow-hidden relative font-sans">
        <Scene />
        <FlyCockpit />
        <Overlay />
      </div>
    </AppStateProvider>
  );
}

export default App;
