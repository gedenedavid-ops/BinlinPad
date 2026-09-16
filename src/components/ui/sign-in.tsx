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
    <main className="flex min-h-[100dvh] w-full items-center justify-center bg-[var(--bp-bg)] px-4 py-8 text-[var(--bp-text)] sm:px-6 sm:py-10">
      <section className="w-full max-w-md">
        <div className="w-full">
          <div className="mb-8">
            <Image src="/BINLINPAD.svg" alt="BinlinPad" width={220} height={64} priority className="h-auto w-[min(220px,75vw)]" />
          </div>
          <h1 className="animate-element animate-delay-100 text-4xl font-black leading-tight md:text-5xl">{title}</h1>
          <p className="animate-element animate-delay-200 mt-3 text-[var(--bp-text-muted)]">{description}</p>
          <div className="mt-7">{children}</div>
        </div>
      </section>
    </main>
  );
}