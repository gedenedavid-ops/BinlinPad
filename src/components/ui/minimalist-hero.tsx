"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MinimalistHeroProps {
  logoText: React.ReactNode;
  navLinks: { label: string; href: string }[];
  title: string;
  mainText: string;
  ctaLabel: string;
  ctaHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  videoSrc: string;
  socialLinks: { icon: LucideIcon; href: string }[];
  /** @deprecated — le sélecteur de pays a été retiré, prop ignorée */
  locationText?: string;
  className?: string;
}

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a
    href={href}
    className="text-sm font-medium text-foreground/60 transition-colors hover:text-foreground"
  >
    {children}
  </a>
);

const SocialIcon = ({ href, icon: Icon }: { href: string; icon: LucideIcon }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="text-foreground/60 transition-colors hover:text-foreground">
    <Icon className="h-5 w-5" />
  </a>
);

/**
 * Mini-carte mascotte secondaire — pose "lecture / révision"
 * Desktop uniquement (hidden sur mobile — voir MascotteMobileStrip pour mobile)
 */
const MascoттeContextCard = () => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.7, delay: 1.2, ease: [0.22, 1, 0.36, 1] }}
    className="hidden md:flex absolute -right-14 bottom-16 z-20 flex-col bg-white/95 rounded-2xl shadow-lg px-4 py-3 w-[155px] border border-[var(--color-border)]"
    style={{ rotate: '3deg' }}
  >
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-1.5">
      <ellipse cx="18" cy="28" rx="9" ry="6" fill="#F4A236" opacity="0.25"/>
      <circle cx="18" cy="12" r="8" fill="#F4A236"/>
      <line x1="14.5" y1="11.5" x2="16.5" y2="11.5" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="19.5" y1="11.5" x2="21.5" y2="11.5" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M15.5 15 Q18 16.5 20.5 15" stroke="#1A1A1A" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      <rect x="10" y="20" width="16" height="10" rx="2" fill="#FFFFFF" stroke="#E8E4DF" strokeWidth="1"/>
      <line x1="18" y1="20" x2="18" y2="30" stroke="#E8E4DF" strokeWidth="0.8"/>
      <line x1="12" y1="23" x2="16" y2="23" stroke="#C8C4BE" strokeWidth="0.8"/>
      <line x1="12" y1="25.5" x2="16" y2="25.5" stroke="#C8C4BE" strokeWidth="0.8"/>
      <line x1="20" y1="23" x2="24" y2="23" stroke="#C8C4BE" strokeWidth="0.8"/>
      <line x1="20" y1="25.5" x2="24" y2="25.5" stroke="#C8C4BE" strokeWidth="0.8"/>
    </svg>
    <p className="text-[11px] font-semibold text-[#1A1A1A] leading-tight">En train de réviser</p>
    <p className="text-[10px] text-[#9B9590] leading-tight mt-0.5">Histoire · 14/20 🔥</p>
  </motion.div>
);

/**
 * Bulle de dialogue — pose "questionne l'élève"
 * Desktop uniquement
 */
const MascotteQuoteCard = () => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: 1.5, ease: [0.22, 1, 0.36, 1] }}
    className="hidden md:block absolute -left-10 top-2 z-20 bg-[var(--color-ochre)] rounded-2xl rounded-bl-sm shadow-md px-3 py-2 w-[140px]"
  >
    <p className="text-[11px] font-bold text-white leading-snug">
      {'"Tu as pris des notes ce matin\u00a0?"'}
    </p>
    <p className="text-[10px] text-white/75 mt-0.5">— Binlin 🐻</p>
  </motion.div>
);

/**
 * Version mobile — strip horizontal sous la mascotte
 * Remplace les cartes flottantes sur petit écran
 */
const MascotteMobileStrip = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 1.2 }}
    className="flex md:hidden items-center gap-3 mt-4 w-full max-w-[300px]"
  >
    {/* Bulle iMessage — question Binlin */}
    <div className="flex-1 bg-[var(--color-ochre)] rounded-2xl rounded-tl-sm px-3 py-2">
      <p className="text-[11px] font-semibold text-white leading-snug">
        {'"T\'as révisé hier\u00a0?" 🐻'}
      </p>
    </div>
    {/* Badge révision */}
    <div className="flex-shrink-0 bg-[var(--bp-bg-elevated)] border border-[var(--bp-border)] rounded-xl px-3 py-2 text-center">
      <p className="text-[11px] font-bold text-[var(--bp-text)] leading-tight">📖 Histoire</p>
      <p className="text-[10px] text-[var(--color-ochre)] font-semibold">14/20 🔥</p>
    </div>
  </motion.div>
);

export const MinimalistHero = ({
  logoText,
  navLinks,
  title,
  mainText,
  ctaLabel,
  ctaHref,
  secondaryLabel,
  secondaryHref,
  videoSrc,
  socialLinks,
  className,
}: MinimalistHeroProps) => {
  return (
    <div
      className={cn(
        'relative flex min-h-screen w-full flex-col items-center overflow-hidden bg-background px-8 pb-8 pt-6 font-sans md:px-12 md:pb-12',
        className
      )}
    >
      {/* ── Nav ───────────────────────────────────────────────────── */}
      <header className="z-30 flex w-full max-w-7xl items-center justify-between mb-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="text-xl font-bold tracking-wider"
          style={{ fontFamily: 'var(--font-nunito)' }}
        >
          {logoText}
        </motion.div>

        <nav className="hidden items-center space-x-8 md:flex">
          {navLinks.map((link) => (
            <NavLink key={link.label} href={link.href}>{link.label}</NavLink>
          ))}
        </nav>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="hidden md:flex"
        >
          <a
            href={ctaHref}
            className="px-5 py-2 rounded-full bg-[var(--color-ochre)] text-white text-sm font-semibold hover:bg-[var(--color-ochre-dark)] transition-colors"
          >
            {ctaLabel}
          </a>
        </motion.div>

        {/* Mobile hamburger */}
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col space-y-1.5 md:hidden"
          aria-label="Ouvrir le menu"
        >
          <span className="block h-0.5 w-6 bg-foreground" />
          <span className="block h-0.5 w-6 bg-foreground" />
          <span className="block h-0.5 w-5 bg-foreground" />
        </motion.button>
      </header>

      {/* ── Titre pleine largeur ───────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="w-full max-w-7xl mb-10 md:mb-14"
      >
        <h1
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold text-foreground leading-[1.05] tracking-tight"
          style={{ fontFamily: 'var(--font-nunito)' }}
        >
          {title}
        </h1>
      </motion.div>

      {/* ── Mascotte + texte ──────────────────────────────────────── */}
      <div className="w-full max-w-7xl flex flex-col md:flex-row items-center md:items-end gap-10 flex-grow">

        {/* Mascotte avec poses multiples */}
        <div className="relative flex justify-center items-center flex-shrink-0 order-1 md:order-2 md:mx-auto">
          {/* Halo orange — cercle de marque */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="absolute z-0 h-[260px] w-[260px] rounded-full bg-[var(--color-ochre)]/80 md:h-[360px] md:w-[360px]"
          />
          {/* Mascotte principale — vidéo animée */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
            className="relative z-10 w-44 md:w-60 lg:w-72"
            style={{ mixBlendMode: 'multiply' }}
          >
            <video autoPlay loop muted playsInline style={{ width: '100%', height: 'auto', display: 'block' }}>
              <source src={videoSrc} type="video/mp4" />
            </video>
          </motion.div>
          {/* Carte contextuelle — pose lecture (desktop) */}
          <MascoттeContextCard />
          {/* Bulle de dialogue — pose interrogative (desktop) */}
          <MascotteQuoteCard />
        </div>

        {/* Strip mobile — remplace les cartes flottantes sur petit écran */}
        <MascotteMobileStrip />

        {/* Sous-titre + CTAs — alignés en bas à gauche */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="order-2 md:order-1 flex flex-col gap-5 text-center md:text-left md:pb-4 md:max-w-xs"
        >
          <p className="text-base leading-relaxed text-foreground/70">{mainText}</p>

          {/* Label identitaire Binlin */}
          <p className="text-xs text-foreground/40 italic leading-relaxed">
            Binlin, comme Bernard Binlin Dadié —<br className="hidden sm:block"/>
            parce que la sagesse aussi s{"'"}apprend.
          </p>

          <div className="flex flex-col sm:flex-row md:flex-col gap-3">
            <a
              href={ctaHref}
              className="px-6 py-3 rounded-full bg-[var(--color-ochre)] text-white text-sm font-semibold hover:bg-[var(--color-ochre-dark)] transition-colors text-center"
            >
              {ctaLabel}
            </a>
            {secondaryLabel && secondaryHref && (
              <a
                href={secondaryHref}
                className="px-6 py-3 rounded-full border border-foreground/20 text-sm font-medium text-foreground/60 hover:text-foreground hover:border-foreground/40 transition-colors text-center"
              >
                {secondaryLabel}
              </a>
            )}
          </div>
        </motion.div>

      </div>

      {/* ── Footer social ──────────────────────────────────────────── */}
      <footer className="z-30 flex w-full max-w-7xl items-center justify-end mt-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="flex items-center space-x-4"
        >
          {socialLinks.map((link, index) => (
            <SocialIcon key={index} href={link.href} icon={link.icon} />
          ))}
        </motion.div>
      </footer>
    </div>
  );
};
