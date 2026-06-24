import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { useAppState } from "@/lib/store";

// Flavor lines that cycle beneath the headline while the galaxy is assembled, so
// the wait reads as "building the universe" rather than a dead spinner.
const BUILDING_MESSAGES = [
  "Pulling a lifetime of work from OpenAlex…",
  "Igniting suns from research domains…",
  "Setting papers into orbit…",
  "Placing co-authors as moons…",
  "Calibrating the surrounding star field…",
  "Composing your preview…",
];

// The Cosmograph mark, drawn inline so it can "fill up" as the load progresses:
// a dim outline sits behind a bright, glowing copy that is revealed bottom-to-top
// by an animated clip rectangle whose height tracks `progress` (0..1).
function FillingMark({ progress }: { progress: number }) {
  const fillHeight = 64 * progress;
  return (
    <svg
      width="84"
      height="84"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mx-auto"
    >
      <defs>
        <mask id="cg-load-clear">
          <rect width="64" height="64" fill="white" />
          <circle cx="32" cy="32" r="10" fill="black" />
        </mask>
        <clipPath id="cg-load-fill">
          <motion.rect
            x="0"
            width="64"
            initial={false}
            animate={{ y: 64 - fillHeight, height: fillHeight }}
            transition={{ ease: "easeOut", duration: 0.5 }}
          />
        </clipPath>
      </defs>

      {/* Dim, empty outline. */}
      <g opacity={0.16}>
        <MarkPaths stroke="#a388ee" sparkle="#cbbcf3" />
      </g>

      {/* Bright, glowing fill, clipped to the rising rectangle. */}
      <g clipPath="url(#cg-load-fill)">
        <g style={{ filter: "drop-shadow(0 0 3px rgba(163,136,238,0.85))" }}>
          <MarkPaths stroke="#d6c8ff" sparkle="#ffffff" />
        </g>
      </g>
    </svg>
  );
}

// The shared shape set, reused by the dim base and the bright fill copies.
function MarkPaths({ stroke, sparkle }: { stroke: string; sparkle: string }) {
  return (
    <>
      <g
        mask="url(#cg-load-clear)"
        stroke={stroke}
        fill="none"
        strokeWidth={1.8}
        strokeLinecap="round"
      >
        <ellipse cx={32} cy={32} rx={26} ry={7.8} />
        <ellipse cx={32} cy={18} rx={21.5} ry={6} />
        <ellipse cx={32} cy={46} rx={21.5} ry={6} />
        <line x1={32} y1={6} x2={32} y2={58} />
        <ellipse cx={32} cy={32} rx={9.5} ry={26} />
        <ellipse cx={32} cy={32} rx={19} ry={26} />
      </g>
      <circle
        cx={32}
        cy={32}
        r={26}
        stroke={stroke}
        strokeWidth={2.4}
        fill="none"
      />
      <path
        d="M32 22.5 C32.8 28.9 35.1 31.2 41.5 32 C35.1 32.8 32.8 35.1 32 41.5 C31.2 35.1 28.9 32.8 22.5 32 C28.9 31.2 31.2 28.9 32 22.5 Z"
        fill={sparkle}
      />
    </>
  );
}

export function DatasetLoadingOverlay() {
  const {
    datasetStatus,
    datasetError,
    loadProgress,
    previewReady,
    canExplore,
    dismissDatasetError,
  } = useAppState();

  // The gated (non-member) path renders ScreenshotGate after the data is ready,
  // which captures a preview off-screen. Keep this single overlay up through that
  // capture so the visitor sees ONE continuous load, not a second spinner.
  const fetching = datasetStatus === "loading";
  const gatedAwaitingPreview =
    datasetStatus === "ready" && !canExplore && !previewReady;
  const visible = fetching || datasetStatus === "error" || gatedAwaitingPreview;

  const fetched = loadProgress?.fetched ?? 0;
  const total = loadProgress?.total ?? 0;
  const dataPct = total > 0 ? Math.min(1, fetched / total) : 0;

  // One unified progress value across both phases. The data fetch fills 8%→90%
  // (so it never looks "done" before the galaxy renders); the render/capture
  // phase carries it the rest of the way to 100%.
  const progress = gatedAwaitingPreview
    ? 1
    : total > 0
      ? 0.08 + dataPct * 0.82
      : 0.08;

  // Cycle the building messages while the overlay is up.
  const [msgIndex, setMsgIndex] = useState(0);
  useEffect(() => {
    if (!visible || datasetStatus === "error") return;
    const id = window.setInterval(
      () => setMsgIndex((i) => (i + 1) % BUILDING_MESSAGES.length),
      2200,
    );
    return () => window.clearInterval(id);
  }, [visible, datasetStatus]);

  // During the render/capture phase, pin the message to the closing line.
  const statusLine = gatedAwaitingPreview
    ? "Composing your preview…"
    : total > 0
      ? `Charting ${fetched.toLocaleString()} of ${total.toLocaleString()} papers`
      : BUILDING_MESSAGES[msgIndex];

  const pctLabel = Math.round(progress * 100);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] grid place-items-center bg-black/80 backdrop-blur-md pointer-events-auto"
        >
          <motion.div
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 16, opacity: 0 }}
            className="w-full max-w-sm border-2 border-edge bg-bg/95 p-8 text-center"
          >
            {datasetStatus === "error" ? (
              <>
                <AlertTriangle
                  size={32}
                  className="mx-auto mb-4 text-red-400"
                />
                <h2 className="font-title text-lg font-bold tracking-tight text-ink">
                  Couldn't chart that galaxy
                </h2>
                <p className="mt-2 text-[13px] leading-relaxed text-ink-dim">
                  {datasetError ??
                    "Something went wrong loading this researcher from OpenAlex."}
                </p>
                <button
                  onClick={dismissDatasetError}
                  className="mt-5 w-full border-2 border-edge bg-white/5 py-2.5 font-display text-[12px] uppercase tracking-wider text-ink transition-colors hover:bg-white/10"
                >
                  Back to the galaxy
                </button>
              </>
            ) : (
              <>
                <FillingMark progress={progress} />

                <h2 className="mt-5 font-title text-lg font-bold tracking-tight text-ink">
                  Charting a new galaxy
                </h2>

                {/* Building status line, cross-fading as it cycles. */}
                <div className="mt-2 h-9">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={statusLine}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.3 }}
                      className="text-[13px] leading-relaxed text-ink-dim"
                    >
                      {statusLine}
                    </motion.p>
                  </AnimatePresence>
                </div>

                <div className="mt-4">
                  <div className="h-1.5 w-full overflow-hidden border border-edge bg-white/5">
                    <motion.div
                      className="h-full bg-accent"
                      initial={false}
                      animate={{ width: `${pctLabel}%` }}
                      transition={{ ease: "easeOut", duration: 0.4 }}
                    />
                  </div>
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-ink-dim">
                    {pctLabel}% · building the galaxy
                  </p>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
