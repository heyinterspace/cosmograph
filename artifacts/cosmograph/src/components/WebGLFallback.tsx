interface WebGLFallbackProps {
  // "no-webgl": the browser/device can't do WebGL at all (proactive gate).
  // "error": the galaxy mounted but then crashed at runtime (error boundary).
  variant?: "no-webgl" | "error";
}

// A self-contained, pure-CSS screen (no WebGL of its own) shown when the 3D
// galaxy can't be displayed — so no visitor ever lands on a blank page.
export function WebGLFallback({ variant = "no-webgl" }: WebGLFallbackProps) {
  const isError = variant === "error";
  return (
    <div className="relative flex min-h-[100dvh] w-screen items-center justify-center overflow-hidden bg-black px-6 text-ink">
      {/* Pure-CSS starfield so this screen never itself depends on WebGL. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(1px 1px at 20% 30%, #ffffff, transparent)," +
            "radial-gradient(1px 1px at 70% 60%, #cbd5ff, transparent)," +
            "radial-gradient(1.5px 1.5px at 40% 80%, #ffffff, transparent)," +
            "radial-gradient(1px 1px at 85% 22%, #e9e3ff, transparent)," +
            "radial-gradient(1px 1px at 12% 75%, #ffffff, transparent)," +
            "radial-gradient(circle at 50% 45%, rgba(163,136,238,0.14), transparent 60%)",
        }}
      />
      <div className="glass-panel relative z-10 w-full max-w-md p-7 text-center">
        <p className="font-display text-xs uppercase tracking-[0.35em] text-accent">
          Cosmograph
        </p>
        <h1 className="mt-4 font-display text-2xl tracking-tight text-ink">
          {isError ? "Knocked off course" : "This galaxy needs 3D graphics"}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-dim">
          {isError
            ? "The galaxy hit an unexpected error. A reload usually puts it back on its orbit."
            : "Your browser or device can't display WebGL right now, so the 3D galaxy can't be drawn."}
        </p>
        {!isError && (
          <ul className="mx-auto mt-4 max-w-xs space-y-1.5 text-left text-xs leading-relaxed text-ink-dim">
            <li>• Update to the latest version of your browser</li>
            <li>• Turn on hardware acceleration in your browser settings</li>
            <li>
              • Try another browser or device (Chrome, Firefox, Safari, Edge)
            </li>
          </ul>
        )}
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="glass-panel glass-panel-interactive mt-6 inline-flex items-center justify-center gap-2 px-6 py-3 font-display text-xs uppercase tracking-widest text-accent-foreground"
        >
          {isError ? "Reload" : "Try again"}
        </button>
      </div>
    </div>
  );
}
