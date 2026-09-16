import Image from "next/image";
import Link from "next/link";

const tape = (
  <svg aria-hidden="true" viewBox="0 0 95 80" fill="none" className="h-full w-full">
    <path d="M1 45 70.282 5l18 31.177-69.282 40L1 45Z" fill="#222" />
    <path d="M69.683 40c5.09-3.077 10.597-4.978 15.764-7.958l-1.831 6.635c-3.669-6.289-8.245-12.18-11.724-18.593-2.227-4.107-4.431-8.242-6.61-12.392l7.357 1.971c-2.409 1.265-4.822 2.52-7.237 3.766-6.583 3.398-13.19 6.734-19.832 10.038-6.629 3.297-13.293 6.562-19.961 9.801-4.529 2.2-9.069 4.393-13.606 6.578L1.916 44.864c-.207.099-.432.147-.628.13-.196-.017-.347-.096-.422-.226-.074-.13-.067-.301.017-.479.084-.178.239-.348.428-.477l9.136-6.904c.557.386 1.134.589 1.882.394.382-.1.884-.339 1.181-.642.267-.272.414-.568.555-.85.147-.294.286-.574.546-.794l12.005-8.299 4.383-2.55c.712-.376 1.444-.697 2.147-1.005 1.038-.455 2.016-.883 2.777-1.425.509-.362 1.119-.614 1.726-.865 1.631-.674 3.385-1.399 4.598-3.706l12.003-6.943c.555-.003 1.106-.035 1.65-.133 1.034-.128 1.836-.504 2.87-.989 2.148-1.096 4.728-.587 5.824 1.56.232.513.476 1.077.721 1.703.776 1.978 1.917 3.811 2.756 4.924 2.158 2.866 4.267 6.013 6.39 9.403.612.853 1.387 1.898 2.337 3.352 1.526 2.989.818 6.578-2.171 8.104-1.211.531-2.34 1.106-3.55 1.637l-12.026 7.59c-1.326.314-2.782.885-4.064 1.488-2.589 1.218-4.847 2.98-6.831 4.45-.751.556-1.505.823-2.471 1.165-1.841.655-4.128 1.465-5.303 3.286l-10.72 5.555-4.16-1.115c13.066-8.599 25.965-17.06 39.031-25.244 1.918-1.202 3.891-2.427 5.821-3.617 1.951-1.203 3.865-2.376 5.829-3.568.628-.38 1.238-.75 1.238-.75Z" fill="#222" />
  </svg>
);

const footerLinks = [
  { href: "/auth/connexion", label: "Se connecter" },
  { href: "/#how-it-works", label: "Comment ça marche" },
  { href: "/legal", label: "Confidentialité" },
];

export function FooterTapedDesign() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="px-6 pb-8 pt-4 md:px-10">
      <div className="relative mx-auto max-w-7xl rounded-[2rem] bg-white px-6 py-10 shadow-[0_18px_50px_rgba(74,55,31,0.08)] md:px-12 md:py-12">
        <div className="absolute -left-3 -top-5 hidden h-16 w-20 -rotate-6 md:block">{tape}</div>
        <div className="absolute -right-3 -top-5 hidden h-16 w-20 rotate-[84deg] md:block">{tape}</div>

        <div className="grid gap-10 md:grid-cols-[1.3fr_1fr_1fr] md:gap-16">
          <div>
            <Link href="/" className="flex items-center gap-2 text-2xl font-black tracking-tight text-[var(--bp-text)]">
              <span className="relative h-9 w-9"><Image src="/logo3d.svg" alt="" fill className="object-contain" /></span>
              BinlinPad
            </Link>
            <p className="mt-4 max-w-sm text-base leading-relaxed text-[var(--bp-text-muted)]">Pars de ton cahier ou de tes notes pour comprendre, organiser tes idées et avancer à ton rythme.</p>
            <Link href="/auth/connexion" className="mt-6 inline-flex rounded-full bg-[var(--color-ochre)] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[var(--color-ochre-dark)]">Commencer gratuitement</Link>
          </div>

          <div>
            <h2 className="text-xs font-black uppercase tracking-[0.18em] text-[var(--bp-text-muted)]">Explorer</h2>
            <nav className="mt-4 flex flex-col items-start gap-3 text-sm font-semibold text-[var(--bp-text)]" aria-label="Liens du pied de page">
              {footerLinks.map((link) => <Link key={link.href} href={link.href} className="transition-colors hover:text-[var(--color-ochre-dark)]">{link.label}</Link>)}
            </nav>
          </div>

          <div>
            <h2 className="text-xs font-black uppercase tracking-[0.18em] text-[var(--bp-text-muted)]">Besoin de parler&nbsp;?</h2>
            <p className="mt-4 text-sm leading-relaxed text-[var(--bp-text-muted)]">Une écoute humaine est disponible en Côte d&apos;Ivoire.</p>
            <p className="mt-3 text-lg font-black text-[var(--bp-text)]">Numéro Vert d&apos;Assistance Psychologique et d&apos;Écoute&nbsp;: 139</p>
            <div className="mt-5 flex items-center gap-3">
              <a href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer" aria-label="BinlinPad sur LinkedIn" className="rounded-full border border-[var(--bp-border)] px-3 py-2 text-xs font-black text-[var(--bp-text-muted)] transition-colors hover:border-[var(--color-ochre)] hover:text-[var(--color-ochre-dark)]">in</a>
              <a href="https://x.com/" target="_blank" rel="noopener noreferrer" aria-label="BinlinPad sur X" className="rounded-full border border-[var(--bp-border)] px-3 py-2 text-xs font-black text-[var(--bp-text-muted)] transition-colors hover:border-[var(--color-ochre)] hover:text-[var(--color-ochre-dark)]">X</a>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-[var(--bp-border)] pt-5 text-xs font-medium text-[var(--bp-text-muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>© {currentYear} BinlinPad · Hack for Humanity</p>
          <p>Conçu pour apprendre avec plus de clarté.</p>
        </div>
      </div>
    </footer>
  );
}