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
        className="flex h-11 w-11 items-center justify-center border-2 border-edge bg-white/5 text-ink transition-all hover:bg-white/10 pointer-events-auto md:h-9 md:w-9"
      >
        <Share2 size={15} />
      </button>
      <ShareModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
