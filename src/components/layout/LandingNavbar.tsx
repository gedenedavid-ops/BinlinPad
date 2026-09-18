import Link from "next/link";

export function LandingNavbar() {
  return (
    <header className="sticky top-4 z-50 mx-auto flex w-[calc(100%-2rem)] max-w-7xl items-center justify-between rounded-full border border-white/80 bg-white/70 px-4 py-2 shadow-[0_10px_35px_rgba(26,26,26,0.08)] backdrop-blur-xl md:w-[calc(100%-5rem)] md:px-6 md:py-2.5">
      <Link href="#top" aria-label="BinlinPad, accueil" className="relative block h-14 w-40 overflow-visible">
        <span
          role="img"
          aria-label="BinlinPad"
          className="absolute inset-0 scale-[1.15] bg-[var(--color-ochre)] md:scale-[1.8]"
          style={{
            maskImage: "url('/asset/BINLINPAD.png')",
            maskPosition: "center",
            maskRepeat: "no-repeat",
            maskSize: "contain",
            WebkitMaskImage: "url('/asset/BINLINPAD.png')",
            WebkitMaskPosition: "center",
            WebkitMaskRepeat: "no-repeat",
            WebkitMaskSize: "contain",
          }}
        />
      </Link>
      <Link href="/connexion" className="inline-flex rounded-full bg-[var(--color-ochre)] px-4 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[var(--color-ochre-dark)] md:px-6 md:py-3 md:text-base">
        Commencer gratuitement
      </Link>
    </header>
  );
}