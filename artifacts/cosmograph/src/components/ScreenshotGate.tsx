import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Show } from "@clerk/react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import {
  Lock,
  Loader2,
  Rocket,
  Telescope,
  Copy,
  Check,
  Download,
  Share2,
  Heart,
  ArrowLeft,
} from "lucide-react";
import { useCreateCheckout } from "@workspace/api-client-react";
import { useAppState } from "@/lib/store";
import { Scene } from "@/components/Scene";
import { PERKS } from "@/components/Paywall";
import {
  buildShareCard,
  copyImageToClipboard,
  downloadShareCard,
  canNativeShareFiles,
  nativeShareCard,
} from "@/lib/share";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
const SPONSOR_URL = "https://github.com/sponsors/heyinterspace";

// The screenshot-only paywall gate. When a non-member selects a non-default
// scientist, the interactive galaxy is replaced by this: the live scene renders
// briefly off-view to capture the branded share card, then it's torn down and
// only the static screenshot + a Subscribe CTA remain. The home/default
// scientist never reaches this (it's free) and members never reach it (entitled).
export function ScreenshotGate() {
  const { activeAuthorLabel, activeAuthorId, setEntitlement } = useAppState();
  const [, setLocation] = useLocation();
  const checkout = useCreateCheckout();

  // Capture lifecycle: keep the hidden Scene mounted only long enough to render
  // a frame, snapshot it into the share card, then unmount the GPU scene.
  const [capturing, setCapturing] = useState(true);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageCopied, setImageCopied] = useState(false);
  const blobRef = useRef<Blob | null>(null);
  const urlRef = useRef<string | null>(null);
  const copyResetTimer = useRef<number | null>(null);

  const showNative = canNativeShareFiles();

  useEffect(() => {
    let cancelled = false;
    // Give the freshly-mounted scene time to load its background texture and
    // settle the camera into the overview before grabbing the frame.
    const timer = window.setTimeout(async () => {
      const blob = await buildShareCard();
      if (cancelled) return;
      blobRef.current = blob;
      if (blob) {
        const url = URL.createObjectURL(blob);
        urlRef.current = url;
        setImageUrl(url);
      }
      // Tear down the live scene now that we have the static image.
      setCapturing(false);
    }, 1700);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current);
        urlRef.current = null;
      }
      if (copyResetTimer.current) window.clearTimeout(copyResetTimer.current);
    };
  }, []);

  const goSignIn = () => setLocation("/sign-in");

  const goHome = () => {
    // The baked default scientist is the initial bundle state — a reload returns
    // to the free, fully interactive home galaxy.
    window.location.href = basePath || "/";
  };

  const startCheckout = () => {
    // Carry the explored scientist through the Stripe round-trip so the success
    // redirect returns to this galaxy (encoded as ?author= in success_url),
    // not the default home scientist.
    checkout.mutate({ data: { author: activeAuthorId } }, {
      onSuccess: (res) => {
        if (res.alreadyEntitled) {
          setEntitlement(true);
          toast.success("You're already a member — explore away.");
          return;
        }
        if (res.url) {
          window.location.href = res.url;
        } else {
          toast.error("Could not start checkout. Please try again.");
        }
      },
      onError: () => {
        toast.error("Could not start checkout. Please try again.");
      },
    });
  };

  const handleCopyImage = async () => {
    if (!blobRef.current) return;
    const ok = await copyImageToClipboard(blobRef.current);
    setImageCopied(ok);
    if (ok) {
      if (copyResetTimer.current) window.clearTimeout(copyResetTimer.current);
      copyResetTimer.current = window.setTimeout(() => setImageCopied(false), 2400);
    } else {
      toast.error("Copying images isn't supported in this browser.");
    }
  };

  const handleDownload = () => {
    if (!blobRef.current) return;
    downloadShareCard(blobRef.current);
  };

  const handleNativeShare = async () => {
    if (!blobRef.current) return;
    await nativeShareCard(blobRef.current);
  };

  return (
    <div className="absolute inset-0 z-20 overflow-hidden bg-[#03030a]">
      {/* The live scene renders here, invisibly, only while we capture the frame.
          preserveDrawingBuffer lets buildShareCard read the last drawn frame even
          though the canvas is never shown to the visitor. */}
      {capturing && (
        <div className="pointer-events-none absolute inset-0 opacity-0" aria-hidden>
          <Scene />
        </div>
      )}

      {/* The shareable screenshot, cover-fit as a full-screen hero. */}
      {imageUrl && (
        <motion.img
          key="card"
          src={imageUrl}
          alt={`Cosmograph of ${activeAuthorLabel}`}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      {/* Scrim so the panel stays legible over the screenshot. */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/85" />

      {/* Back to the free home galaxy. */}
      <button
        type="button"
        onClick={goHome}
        className="absolute left-4 top-4 z-10 flex items-center gap-2 border-2 border-edge bg-black/40 px-3 py-2 font-display text-[10px] uppercase tracking-widest text-ink-dim backdrop-blur-sm transition-colors hover:bg-black/60 hover:text-ink"
      >
        <ArrowLeft size={13} />
        Free home galaxy
      </button>

      <div className="relative z-10 flex h-full w-full items-center justify-center overflow-y-auto custom-scrollbar p-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="glass-panel my-auto w-full max-w-md p-6 sm:p-7"
        >
          <div className="flex items-center gap-2.5">
            <div className="grid h-10 w-10 shrink-0 place-items-center border-2 border-accent/60 bg-accent/10 text-accent">
              <Lock size={18} />
            </div>
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-accent">
                Membership · $7 / year
              </span>
              <h2 className="text-xl font-title font-bold leading-tight tracking-tight text-ink">
                Unlock {activeAuthorLabel}'s galaxy
              </h2>
            </div>
          </div>

          <p className="mt-3 text-[13px] leading-relaxed text-ink-dim">
            This is the shareable view of{" "}
            <span className="text-ink">{activeAuthorLabel}</span>'s cosmograph. A{" "}
            <span className="text-ink">$7/year</span> membership opens the full
            interactive galaxy — for <span className="text-ink">any</span>{" "}
            scientist you search.
          </p>

          <ul className="mt-4 space-y-2">
            {PERKS.map((perk) => (
              <li
                key={perk}
                className="flex items-start gap-2 text-[13px] text-ink"
              >
                <Telescope size={14} className="mt-0.5 shrink-0 text-accent" />
                <span>{perk}</span>
              </li>
            ))}
          </ul>

          <div className="mt-5 flex flex-col gap-2">
            <Show when="signed-out">
              <button
                onClick={goSignIn}
                className="glass-panel glass-panel-interactive flex w-full items-center justify-center gap-2 py-3 font-display text-xs uppercase tracking-widest text-ink"
              >
                <Rocket size={14} />
                <span>Sign in to subscribe</span>
              </button>
            </Show>

            <Show when="signed-in">
              <button
                onClick={startCheckout}
                disabled={checkout.isPending}
                style={{ background: "var(--accent)" }}
                className="glass-panel glass-panel-interactive flex w-full items-center justify-center gap-2 py-3 font-display text-xs uppercase tracking-widest text-accent-foreground disabled:opacity-60"
              >
                {checkout.isPending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Lock size={14} />
                )}
                <span>
                  {checkout.isPending
                    ? "Starting checkout…"
                    : "Subscribe · $7/year"}
                </span>
              </button>
            </Show>
          </div>

          {/* Share actions for the screenshot. */}
          <div className="mt-4 border-t-2 border-edge pt-4">
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink-dim">
              Share this cosmograph
            </span>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <button
                onClick={handleCopyImage}
                disabled={!imageUrl}
                className="flex items-center gap-1.5 border-2 border-edge bg-white/5 px-3 py-2 font-display text-[10px] uppercase tracking-wider text-ink transition-colors hover:bg-white/10 disabled:opacity-50"
              >
                {imageCopied ? (
                  <Check size={13} className="text-accent" />
                ) : (
                  <Copy size={13} />
                )}
                {imageCopied ? "Copied" : "Copy image"}
              </button>

              <button
                onClick={handleDownload}
                disabled={!imageUrl}
                className="flex items-center gap-1.5 border-2 border-edge bg-white/5 px-3 py-2 font-display text-[10px] uppercase tracking-wider text-ink transition-colors hover:bg-white/10 disabled:opacity-50"
              >
                <Download size={13} />
                Download
              </button>

              {showNative && (
                <button
                  onClick={handleNativeShare}
                  disabled={!imageUrl}
                  className="flex items-center gap-1.5 border-2 border-accent/50 bg-accent/10 px-3 py-2 font-display text-[10px] uppercase tracking-wider text-accent transition-colors hover:bg-accent/20 disabled:opacity-50"
                >
                  <Share2 size={13} />
                  Share…
                </button>
              )}

              {!imageUrl && capturing && (
                <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-ink-dim">
                  <Loader2 size={12} className="animate-spin" />
                  Rendering…
                </span>
              )}
            </div>
          </div>

          <a
            href={SPONSOR_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex w-full items-center justify-center gap-2 border-2 border-edge bg-white/5 py-2.5 font-display text-[11px] uppercase tracking-widest text-ink-dim transition-colors hover:bg-white/10 hover:text-ink"
          >
            <Heart size={13} />
            <span>Sponsor on GitHub</span>
          </a>

          <p className="mt-3 text-center font-mono text-[10px] leading-relaxed text-ink-dim/70">
            Secure checkout by Stripe · $7/year, renews annually
          </p>
        </motion.div>
      </div>
    </div>
  );
}
