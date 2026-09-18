"use client";

const cards = [
  {
    title: "Pour les élèves",
    description: "Prépare tes devoirs, le BEPC ou le BAC avec un accompagnement adapté à ton niveau.",
    className: "md:col-span-2",
  },
  {
    title: "Pour les étudiants",
    description: "Structure tes cours, approfondis tes notions et prépare tes examens ou tes soutenances.",
    className: "md:col-span-2",
  },
  {
    title: "Un contexte qui compte",
    description: "BinlinIA peut s'appuyer sur le programme scolaire ivoirien pour contextualiser tes cours et tes révisions.",
    className: "md:col-span-3",
  },
  {
    title: "Une IA qui s'adapte",
    description: "Tu restes libre de ton parcours : Binlin part de tes notes, de tes questions et de ton objectif.",
    className: "md:col-span-3",
  },
];

export default function LearningContextBento() {
  return (
    <section className="border-y border-[var(--bp-border)] bg-[var(--bp-surface)] px-6 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--color-ochre-dark)]">Un apprentissage qui te ressemble</p>
          <h2 className="mt-3 text-4xl font-black tracking-tight md:text-6xl" style={{ fontFamily: "var(--font-nunito)" }}>
            Pensé pour le programme ivoirien.<br />Ouvert à tous les parcours.
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[var(--bp-text-muted)]">
            BinlinPad accompagne les élèves comme les étudiants, du cahier de classe aux révisions universitaires. Ton niveau change, ton espace reste avec toi.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-6">
          {cards.map(({ title, description, className }) => (
            <article key={title} className={`rounded-2xl border border-[var(--bp-border)] bg-[var(--bp-bg-elevated)] p-6 transition-transform hover:-translate-y-1 ${className}`}>
              <h3 className="text-xl font-bold" style={{ fontFamily: "var(--font-nunito)" }}>{title}</h3>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-[var(--bp-text-muted)]">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
