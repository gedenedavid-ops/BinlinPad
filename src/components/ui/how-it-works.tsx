"use client";

import React from "react";
import { LazyMotion, domAnimation, m } from "framer-motion";

interface CardProps {
  number: string;
  title: string;
  description: string;
  colorTheme?: "orange" | "blue" | "purple";
  className?: string;
  rotate?: string;
}

const colors = {
  orange: { bg: "bg-[#FDF0DC]", text: "text-[#E8941E]", border: "border-[#F4A236]/30" },
  blue: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-100" },
  purple: { bg: "bg-violet-50", text: "text-violet-600", border: "border-violet-100" },
};

const steps: CardProps[] = [
  { number: "01", title: "Ton cahier ou tes notes restent le point de départ", description: "Tes leçons, tes mots et tes matières restent au centre de ton apprentissage.", colorTheme: "orange" },
  { number: "02", title: "Tu retrouves ton cours", description: "Binlin organise tes notes et retrouve rapidement ce dont tu as besoin.", colorTheme: "blue" },
  { number: "03", title: "Binlin comprend ton contexte", description: "Tes notes, tes échanges et le programme ivoirien donnent du sens à tes révisions.", colorTheme: "purple" },
  { number: "04", title: "Tu révises avec méthode", description: "Flashcards, correction, compléments et examen blanc partent de ta propre leçon.", colorTheme: "orange" },
  { number: "05", title: "Tu avances en confiance", description: "Ton espace reste organisé, avec un PIN et un journal d'humeur privés.", colorTheme: "blue" },
];

const positions = [
  { className: "md:absolute md:top-0 md:left-[15%]", rotate: "rotate-2" },
  { className: "md:absolute md:top-[120px] md:right-[15%]", rotate: "-rotate-2" },
  { className: "md:absolute md:top-[450px] md:left-[15%]", rotate: "rotate-2" },
  { className: "md:absolute md:top-[570px] md:right-[10%]", rotate: "-rotate-2" },
  { className: "md:absolute md:top-[850px] md:left-[15%]", rotate: "rotate-2" },
];

function StepCard({ number, title, description, colorTheme = "blue", rotate, className }: CardProps) {
  const tone = colors[colorTheme];

  return (
    <m.article whileHover={{ scale: 1.04, zIndex: 20 }} className={`relative w-full md:w-[280px] ${rotate} ${className ?? ""}`}>
      <div className="rounded-[25px] border border-[var(--bp-border)] bg-white p-2 shadow-[0_10px_20px_rgba(26,26,26,0.12)]">
        <div className={`relative flex h-full flex-col overflow-hidden rounded-[15px] border p-[15px] ${tone.bg} ${tone.border}`}>
          <span className={`mb-8 text-4xl font-black ${tone.text}`} style={{ fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif' }}>{number}</span>
          <h3 className="mb-2 text-2xl font-semibold leading-none text-[#1A1A1A]" style={{ fontFamily: "var(--font-nunito)" }}>{title}</h3>
          <p className="text-sm leading-5 tracking-tight text-[#6F6A66]">{description}</p>
        </div>
      </div>
    </m.article>
  );
}

export default function HowItWorks() {
  return (
    <LazyMotion features={domAnimation}>
      <section id="features" className="relative overflow-hidden border-y border-[var(--bp-border)] bg-[var(--bp-surface)] px-6 py-16 md:px-10 md:py-24">
        <div className="pointer-events-none absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "linear-gradient(#1A1A1A 1px, transparent 1px)", backgroundSize: "100% 32px" }} />
        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mt-3 text-4xl font-black tracking-tight md:text-6xl" style={{ fontFamily: "var(--font-nunito)" }}>Tout part de ton cahier ou de tes notes.</h2>
            <p className="mt-5 text-lg leading-relaxed text-[var(--bp-text-muted)]">Binlin transforme ce que tu apprends déjà en un parcours de révision clair.</p>
          </div>
          <div className="relative mx-auto mt-14 flex h-auto max-w-[1000px] flex-col space-y-8 md:block md:h-[1130px] md:space-y-0">
            <svg className="pointer-events-none absolute left-0 top-0 z-0 hidden h-full w-full md:block" viewBox="0 0 1000 1130" preserveAspectRatio="none" aria-hidden="true">
              <m.path d="M 290 150 C 500 150, 550 270, 710 270 C 850 270, 500 350, 290 450 C 290 600, 550 720, 750 720 C 950 720, 500 800, 290 850" stroke="currentColor" className="text-[var(--color-ochre)]/40" strokeWidth="2" strokeDasharray="8 6" fill="none" strokeLinecap="round" initial={{ strokeDashoffset: 0 }} animate={{ strokeDashoffset: -140 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} />
            </svg>
            {steps.map((step, index) => <StepCard key={step.number} {...step} className={positions[index].className} rotate={positions[index].rotate} />)}
          </div>
        </div>
      </section>
    </LazyMotion>
  );
}
