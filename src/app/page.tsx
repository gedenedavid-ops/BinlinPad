"use client";

import { Globe, Send, Play, Heart } from "lucide-react";
import Link from "next/link";
import NextImage from "next/image";
import { MinimalistHero } from "@/components/ui/minimalist-hero";
import { Features } from "@/components/blocks/features-8";

const navLinks = [
  { label: "Accueil", href: "#" },
  { label: "Fonctionnalités", href: "#features" },
  { label: "Se connecter", href: "/auth/connexion" },
];

const socialLinks = [
  { icon: Globe, href: "#" },
  { icon: Send,  href: "#" },
  { icon: Play,  href: "#" },
  { icon: Heart, href: "#" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--bp-bg)] text-[var(--bp-text)]">

      {/* ── Hero ────────────────────────────────────────────────── */}
      <MinimalistHero
        logoText={
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8">
              <NextImage
                src="/logo3d.svg"
                alt="Logo BinlinPad"
                fill
                className="object-contain"
              />
            </div>
            <span>BinlinPad</span>
          </div>
        }
        navLinks={navLinks}
        title="Zéro rangement. Zéro oubli."
        mainText="Tes notes, tes échanges, le programme ivoirien — ton IA sait déjà tout ça. Tu écris, il retient."
        ctaLabel="Commencer gratuitement"
        ctaHref="/auth/connexion"
        secondaryLabel="Voir comment ça marche"
        secondaryHref="#features"
        videoSrc="/kimyG/binlinpad-cc.mp4"
        socialLinks={socialLinks}
      />

      {/* ── Features ────────────────────────────────────────────── */}
      <Features />

      {/* ── CTA final ───────────────────────────────────────────── */}
      <section className="py-24 max-w-5xl mx-auto px-8 text-center">
        <div className="bg-[var(--bp-bg-elevated)] border border-[var(--bp-border)] p-12 rounded-[2rem]">
          <h2
            className="text-3xl font-bold mb-4"
            style={{ fontFamily: 'var(--font-nunito)' }}
          >
            Prêt à travailler plus malin&nbsp;?
          </h2>
          <p className="text-[var(--bp-text-muted)] text-lg mb-8 max-w-3xl mx-auto">
            Crée ton compte, ajoute ta première note. BinlinIA retient tout — cours après cours, interrogation après interrogation, jusqu&apos;au bac.
          </p>
          <Link
            href="/auth/connexion"
            className="inline-block px-8 py-4 rounded-2xl bg-[var(--color-ochre)] text-white font-semibold text-lg hover:bg-[var(--color-ochre-dark)] transition-colors shadow-lg"
          >
            Créer un compte gratuitement
          </Link>
          <p className="mt-4 text-sm text-[var(--bp-text-muted)]">
            Verrouillage par PIN inclus. Ton journal d&apos;humeur reste sur ton appareil.
          </p>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="bg-[var(--bp-surface)] border-t border-[var(--bp-border)] py-12">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-6 text-[var(--bp-text-muted)] text-sm">
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8">
              <NextImage
                src="/logo3d.svg"
                alt="Logo BinlinPad"
                fill
                className="object-contain grayscale hover:grayscale-0 transition-all duration-300"
              />
            </div>
            <span className="font-medium text-[var(--bp-text)]">BinlinPad</span>
            <span>© 2026 Hack for Humanity</span>
          </div>
          <div className="flex gap-6">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
              SOS Amitié CI: <strong>27 22 22 63</strong>
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
