import { useState } from "react";
import { Share2 } from "lucide-react";
import { ShareModal } from "./ShareModal";

export function ShareButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Share this galaxy"
        title="Share this galaxy"
        className="glass-panel glass-panel-interactive flex items-center gap-2 px-4 py-2 text-xs font-display uppercase tracking-wider text-ink pointer-events-auto"
      >
        <Share2 size={14} />
        Share
      </button>
      <ShareModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
