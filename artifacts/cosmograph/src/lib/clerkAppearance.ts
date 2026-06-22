import { shadcn } from "@clerk/themes";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

// Themed to match the galaxy's "Structured Liquidity" 2D UI: near-black glass
// surfaces, hard edges, the accent violet (#a388ee), and the app's Outfit /
// Archivo type stack so the Clerk pages feel native to Cosmograph.
export const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
    socialButtonsPlacement: "bottom" as const,
    socialButtonsVariant: "blockButton" as const,
  },
  variables: {
    colorPrimary: "#a388ee",
    colorForeground: "#e6e6e6",
    colorMutedForeground: "#9da0ab",
    colorDanger: "#f87171",
    colorBackground: "#1f2028",
    colorInput: "#272933",
    colorInputForeground: "#e6e6e6",
    colorNeutral: "#3c3f4b",
    fontFamily: "'Outfit', sans-serif",
    borderRadius: "0px",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox:
      "bg-[#1f2028] border-2 border-[#3c3f4b] w-[440px] max-w-full overflow-hidden",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-[#e6e6e6] font-display font-extrabold tracking-tight",
    headerSubtitle: "text-[#9da0ab]",
    socialButtonsBlockButton:
      "border-2 border-[#3c3f4b] bg-white/5 hover:bg-white/10",
    socialButtonsBlockButtonText: "text-[#e6e6e6]",
    formFieldLabel:
      "text-[#9da0ab] font-mono text-[10px] uppercase tracking-widest",
    formFieldInput:
      "bg-[#272933] border-2 border-[#3c3f4b] text-[#e6e6e6] focus:border-[#a388ee]",
    formButtonPrimary:
      "bg-[#a388ee] text-black font-display uppercase tracking-widest hover:bg-[#b59ff2]",
    footerAction: "bg-transparent",
    footerActionText: "text-[#9da0ab]",
    footerActionLink: "text-[#a388ee] hover:text-[#b59ff2]",
    dividerLine: "bg-[#3c3f4b]",
    dividerText: "text-[#9da0ab]",
    identityPreviewEditButton: "text-[#a388ee]",
    formFieldSuccessText: "text-[#a388ee]",
    alert: "border-2 border-[#3c3f4b] bg-white/5",
    alertText: "text-[#e6e6e6]",
    otpCodeFieldInput:
      "bg-[#272933] border-2 border-[#3c3f4b] text-[#e6e6e6]",
    logoBox: "h-10",
    logoImage: "h-10",
    main: "gap-4",
  },
};
