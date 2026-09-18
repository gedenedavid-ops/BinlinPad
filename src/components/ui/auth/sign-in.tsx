"use client";

import Image from "next/image";
import React from "react";

interface SignInPageProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
}

export function SignInPage({
  title = <span className="font-light tracking-tighter">Bienvenue</span>,
  description = "Retrouve ton espace d'apprentissage et continue là où tu t'es arrêté.",
  children,
}: SignInPageProps) {
  return (
    <main className="relative flex min-h-[100dvh] w-full items-center overflow-hidden bg-[var(--bp-bg)] px-4 py-8 text-[var(--bp-text)] sm:px-6 sm:py-10 lg:px-10">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-2 bg-[var(--color-ochre)]" />
      <section className="relative mx-auto grid w-full max-w-5xl items-center gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <div className="hidden lg:block">
          <Image src="/asset/BINLINPAD.png" alt="BinlinPad" width={220} height={64} priority className="h-auto w-56" />
          <p className="mt-10 max-w-sm text-4xl font-black leading-[1.05]" style={{ fontFamily: "var(--font-nunito)" }}>
            Ton espace pour apprendre avec plus de clarté<span className="text-[var(--color-ochre)]">.</span>
          </p>
          <div className="mt-8 grid max-w-sm grid-cols-3 gap-3 border-t border-[var(--bp-border)] pt-5 text-xs font-semibold text-[var(--bp-text-muted)]">
            <span>Notes</span>
            <span>Révisions</span>
            <span>Tuteur IA</span>
          </div>
        </div>

        <div className="mx-auto w-full max-w-md">
          <div className="mb-7 lg:hidden">
            <Image src="/asset/BINLINPAD.png" alt="BinlinPad" width={220} height={64} priority className="h-auto w-[min(220px,75vw)]" />
          </div>
          <h1 className="animate-element animate-delay-100 text-4xl font-black leading-tight md:text-5xl">{title}</h1>
          <p className="animate-element animate-delay-200 mt-3 max-w-md text-[var(--bp-text-muted)]">{description}</p>
          <div className="mt-7">{children}</div>
        </div>
      </section>
    </main>
  );
}