"use client";

import { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import NextImage from "next/image";
import { LandingNavbar } from "@/components/layout/LandingNavbar";
import HowItWorks from "@/components/ui/how-it-works";
import LearningContextBento from "@/components/ui/learning-context-bento";
import { FooterTapedDesign } from "@/components/ui/footer-taped-design";

const journey = [
  { number: "01", title: "Tu ajoutes ton cahier ou tes notes", text: "Pars de ce que tu as déjà appris, par matière et à ton rythme." },
  { number: "02", title: "Binlin comprend", text: "Il relie tes notions, retrouve le bon contexte et garde le fil." },
  { number: "03", title: "Tu révises", text: "Transforme ce que tu as appris en questions, cartes et exercices." },
];

function MascotVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return;

    let frameId = 0;
    const renderFrame = () => {
      if (video.readyState >= 2 && video.videoWidth > 0) {
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }

        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const frame = context.getImageData(0, 0, canvas.width, canvas.height);
        for (let index = 0; index < frame.data.length; index += 4) {
          const red = frame.data[index];
          const green = frame.data[index + 1];
          const blue = frame.data[index + 2];
          const brightness = Math.min(red, green, blue);
          if (brightness > 226 && Math.max(red, green, blue) - brightness < 18) {
            frame.data[index + 3] = 0;
          }
        }
        context.putImageData(frame, 0, 0);
      }
      frameId = requestAnimationFrame(renderFrame);
    };

    renderFrame();
    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <>
      <video ref={videoRef} autoPlay loop muted playsInline className="absolute h-px w-px opacity-0" aria-hidden="true">
        <source src="/kimyG/binlinpad-cc.mp4" type="video/mp4" />
      </video>
      <canvas ref={canvasRef} className="w-full" aria-label="Binlin, la mascotte de BinlinPad" />
    </>
  );
}

export default function LandingPage() {
  return (
    <div id="top" className="min-h-screen bg-[var(--bp-bg)] text-[var(--bp-text)]">
      <LandingNavbar />

      <main>
        <section className="mx-auto grid min-h-[calc(100vh-76px)] max-w-7xl items-center gap-10 px-6 pb-20 pt-6 md:grid-cols-2 md:gap-24 md:px-10 md:pt-16 lg:gap-32">
          <div className="order-2 max-w-xl md:order-2">
            
            <h1 className="text-6xl font-black leading-[0.95] tracking-tight md:text-8xl" style={{ fontFamily: "var(--font-nunito)" }}>Révise.<br />Comprends.<br />Avance.</h1>
            <h2 className="mt-8 max-w-md text-2xl font-bold leading-tight md:text-3xl" style={{ fontFamily: "var(--font-nunito)" }}>Avec Binlin-IA à tes côtés. 🧡</h2>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-[var(--bp-text-muted)]">Notes, cours, révisions et conversations réunis dans une IA pensée pour les étudiants ivoiriens.</p>
            <Link href="/auth/connexion" className="mt-8 inline-flex items-center gap-2 rounded-full bg-[var(--color-ochre)] px-6 py-3.5 font-bold text-white shadow-lg shadow-orange-200/40 transition-all hover:-translate-y-0.5 hover:bg-[var(--color-ochre-dark)]">Commencer gratuitement <ArrowRight size={18} /></Link>
            <p className="mt-5 text-sm font-semibold text-[var(--bp-text-muted)]">Tes cours. Ta mémoire. Ton Binlin.</p>
          </div>

          <div className="relative order-1 mx-auto flex min-h-[400px] w-full max-w-[620px] items-center justify-center md:order-1 md:min-h-[520px]">
            <div className="absolute h-[300px] w-[300px] rounded-full bg-[var(--color-ochre)]/55 blur-2xl md:h-[440px] md:w-[440px]" />
            <div className="absolute right-0 top-4 h-24 w-24 rounded-full bg-[var(--color-ochre-light)]/70 blur-xl md:right-4 md:top-8 md:h-32 md:w-32" />
            <div className="relative z-10 w-64 md:w-80 lg:w-[23rem]">
              <MascotVideo />
            </div>
            <div className="absolute left-1 top-2 z-20 max-w-[170px] rounded-[1.25rem] rounded-bl-md bg-white px-3 py-2.5 shadow-[0_8px_24px_rgba(26,26,26,0.12)] md:left-2 md:top-20 md:max-w-[235px] md:px-4 md:py-3">
              <p className="text-[11px] font-semibold leading-snug text-[#1A1A1A] md:text-sm">Tu veux revoir ta leçon d&apos;Histoire&nbsp;?</p>
              <p className="mt-1.5 text-[9px] text-[var(--bp-text-muted)] md:text-[10px]">Binlin · maintenant</p>
            </div>
            <div className="absolute bottom-10 right-1 z-20 max-w-[155px] rounded-[1.25rem] rounded-br-md bg-[var(--color-ochre)] px-3 py-2.5 text-white shadow-[0_8px_24px_rgba(244,162,54,0.24)] md:bottom-16 md:right-3 md:max-w-[205px] md:px-4 md:py-3">
              <p className="text-[11px] font-semibold leading-snug md:text-sm">Oui, interroge-moi.</p>
              <p className="mt-1.5 text-[9px] text-white/75 md:text-[10px]">5 questions personnalisées · maintenant</p>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="border-y border-[var(--bp-border)] bg-[var(--bp-surface)] px-6 py-20 md:px-10 md:py-28">
          <div className="mx-auto max-w-7xl"><div className="flex max-w-5xl flex-col items-start gap-6 md:flex-row md:items-center md:gap-16"><div className="relative order-1 h-52 w-52 shrink-0 md:h-64 md:w-64"><NextImage src="/kimyG/BINLINP-super.svg" alt="Binlin fait coucou" fill className="object-contain" /></div><div className="order-2"><p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--color-ochre-dark)]">Comment ça marche</p><h2 className="mt-3 text-4xl font-black tracking-tight md:text-6xl" style={{ fontFamily: "var(--font-nunito)" }}>Ton cahier ou tes notes entrent.<br />Binlin s&apos;occupe du reste.</h2></div></div><div className="mt-14 grid gap-8 md:grid-cols-3">{journey.map(({ number, title, text }) => <div key={number} className="border-t-2 border-[var(--bp-border)] pt-5"><div><span className="text-sm font-bold text-[var(--color-ochre)]">{number}</span></div><h3 className="mt-10 text-2xl font-bold" style={{ fontFamily: "var(--font-nunito)" }}>{title}</h3><p className="mt-3 max-w-xs leading-relaxed text-[var(--bp-text-muted)]">{text}</p></div>)}</div></div>
        </section>

        <HowItWorks />

        <LearningContextBento />

        <section className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28"><div className="rounded-[2rem] border border-[var(--bp-border)] bg-[var(--color-ochre-light)] p-8 md:p-12"><div className="grid items-center gap-10 md:grid-cols-[0.65fr_1.15fr_0.9fr]"><div className="relative mx-auto h-56 w-56 md:h-64 md:w-64"><NextImage src="/kimyG/binlin-secure.svg" alt="Binlin veille sur tes données" fill className="object-contain" /></div><div><p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--color-ochre-dark)]">Tes données, tes règles</p><h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl" style={{ fontFamily: "var(--font-nunito)" }}>La confidentialité expliquée clairement.</h2><p className="mt-5 max-w-xl text-lg leading-relaxed text-[var(--bp-text)]">Ton code PIN et ton journal d&apos;humeur restent sur ton appareil. Quand tu demandes de l&apos;aide sur un cours, BinlinIA utilise seulement les passages utiles pour te répondre.</p></div><div className="space-y-3 text-sm font-semibold"><div className="rounded-xl border border-[var(--color-ochre)]/20 bg-white/70 p-4">Ton code PIN reste sur ton appareil</div><div className="rounded-xl border border-[var(--color-ochre)]/20 bg-white/70 p-4">Ton humeur reste privée</div><div className="rounded-xl border border-[var(--color-ochre)]/20 bg-white/70 p-4">Tu peux supprimer ton compte</div></div></div></div></section>

        <section className="px-6 pb-24 text-center md:px-10"><div className="mx-auto max-w-3xl"><h2 className="text-4xl font-black tracking-tight md:text-6xl" style={{ fontFamily: "var(--font-nunito)" }}>Prêt à travailler plus intelligemment&nbsp;?</h2><p className="mx-auto mt-5 max-w-xl text-lg text-[var(--bp-text-muted)]">Crée ton espace, ajoute ta première note et laisse Binlin t&apos;aider à apprendre.</p><Link href="/auth/connexion" className="mt-8 inline-flex items-center gap-2 rounded-full bg-[var(--color-ochre)] px-7 py-4 font-bold text-white transition-colors hover:bg-[var(--color-ochre-dark)]">Commencer gratuitement <ArrowRight size={18} /></Link></div></section>
      </main>

      <FooterTapedDesign />
    </div>
  );
}
