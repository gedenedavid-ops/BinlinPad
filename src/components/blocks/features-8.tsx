import { Card, CardContent } from '@/components/ui/card'
import { BookOpen, Brain, Network, SmilePlus, Lock, ScanText, FileText, MessageCircle, BookMarked } from 'lucide-react'

// Palette émotionnelle — correspond aux 7 états de BinlinPad
const MOOD_PALETTE = [
  { color: '#3B82F6', label: 'Concentré', h: 55 },  // lundi
  { color: '#10B981', label: 'Motivé',    h: 80 },  // mardi
  { color: '#FBBF24', label: 'Neutre',    h: 45 },  // mercredi
  { color: '#A78BFA', label: 'Fatigué',   h: 35 },  // jeudi
  { color: '#10B981', label: 'Motivé',    h: 70 },  // vendredi
  { color: '#3B82F6', label: 'Concentré', h: 90 },  // samedi
  { color: '#6EE7B7', label: 'Calme',     h: 60 },  // dimanche
]

// Sources RAG — liste verticale pour "Il sait où chercher"
const RAG_SOURCES = [
  { icon: FileText,      label: 'Tes notes', sub: 'Maths, Histoire, SVT…' },
  { icon: MessageCircle, label: 'Tes échanges passés', sub: 'Mémoire longue durée' },
  { icon: BookMarked,    label: 'Programme ivoirien', sub: '100 000 points de cours' },
]

export function Features() {
    return (
        <section id="features" className="bg-[var(--bp-bg)] py-16 md:py-24">
            <div className="mx-auto max-w-3xl lg:max-w-5xl px-6">

                <div className="text-center mb-12">
                    <h2
                        className="text-3xl md:text-4xl font-bold mb-4"
                        style={{ fontFamily: 'var(--font-nunito)' }}
                    >
                        Tout part de tes notes
                    </h2>
                    <p className="text-[var(--bp-text-muted)] max-w-2xl mx-auto text-lg">
                        BinlinPad organise, retrouve et révise à partir de ce que tu écris — sans jamais toucher à ton humeur ni à tes notes verrouillées.
                    </p>
                </div>

                <div className="relative z-10 grid grid-cols-6 gap-3">

                    {/* ── Card 1 — Il sait où chercher : fond ochre, liste verticale ── */}
                    <Card className="relative col-span-full overflow-hidden border-0 bg-[var(--color-ochre)]">
                        <CardContent className="pt-8 pb-8 flex flex-col sm:flex-row items-start gap-6 sm:gap-10">
                            {/* Icône + titre */}
                            <div className="flex-shrink-0 flex flex-col items-start gap-4">
                                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white/15">
                                    <Brain className="size-7 text-white" strokeWidth={1.2} />
                                </div>
                                <div>
                                    <h2
                                        className="text-2xl font-bold text-white"
                                        style={{ fontFamily: 'var(--font-nunito)' }}
                                    >
                                        Il sait où chercher
                                    </h2>
                                    <p className="text-white/75 text-sm mt-1 max-w-xs leading-relaxed">
                                        BinlinIA regarde 3 sources à la fois avant de te répondre.
                                    </p>
                                </div>
                            </div>

                            {/* Liste verticale — 3 sources RAG */}
                            <div className="flex flex-col gap-3 sm:self-center w-full sm:max-w-xs">
                                {RAG_SOURCES.map(({ icon: Icon, label, sub }) => (
                                    <div
                                        key={label}
                                        className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3"
                                    >
                                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
                                            <Icon className="size-4 text-white" strokeWidth={1.5} />
                                        </div>
                                        <div>
                                            <p className="text-white text-sm font-semibold leading-tight">{label}</p>
                                            <p className="text-white/60 text-xs leading-tight">{sub}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* ── Card 2 — Notes intelligentes ── */}
                    <Card className="relative col-span-full overflow-hidden sm:col-span-3 lg:col-span-2 border-[var(--bp-border)]">
                        <CardContent className="pt-6">
                            <div className="relative mx-auto flex aspect-square size-12 rounded-xl border border-[var(--bp-border)] items-center justify-center">
                                <BookOpen className="size-6 text-[var(--color-ochre)]" strokeWidth={1.2} />
                            </div>
                            <div className="relative z-10 mt-4 space-y-2">
                                <h2 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-nunito)' }}>Notes intelligentes</h2>
                                <p className="text-[var(--bp-text-muted)] text-sm">Organise tes cours par matière. Génère des flashcards ou un examen blanc, ou dicte directement à voix haute — sans changer d&apos;appli.</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* ── Card 3 — Graphe de connaissances ── */}
                    <Card className="relative col-span-full overflow-hidden sm:col-span-3 lg:col-span-2 border-[var(--bp-border)]">
                        <CardContent className="pt-6">
                            <div className="relative mx-auto flex aspect-square size-12 rounded-xl border border-[var(--bp-border)] items-center justify-center">
                                <Network className="size-6 text-[var(--color-ochre)]" strokeWidth={1.2} />
                            </div>
                            <div className="relative z-10 mt-4 space-y-2">
                                <h2 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-nunito)' }}>Graphe de connaissances</h2>
                                <p className="text-[var(--bp-text-muted)] text-sm">Vois comment tes cours se répondent d&apos;une matière à l&apos;autre, dans un graphe que tu explores toi-même.</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* ── Card 4 — Journal d'humeur : card héro, graphe en avant ── */}
                    <Card className="relative col-span-full overflow-hidden border-[var(--bp-border)] bg-[var(--bp-bg-elevated)]">
                        <CardContent className="pt-8 pb-8 flex flex-col sm:flex-row items-start gap-6 sm:gap-10">
                            {/* Texte + tête */}
                            <div className="flex-shrink-0 flex flex-col gap-3 sm:max-w-[200px]">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-12 h-12 rounded-xl border border-[var(--bp-border)] bg-white/60">
                                        <SmilePlus className="size-6 text-[var(--color-ochre)]" strokeWidth={1.2} />
                                    </div>
                                    <h2 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-nunito)' }}>
                                        Journal d&apos;humeur
                                    </h2>
                                </div>
                                <p className="text-[var(--bp-text-muted)] text-sm leading-relaxed">
                                    Associe une émotion à chaque note, pour toi seul. Ces données ne quittent <strong className="text-[var(--bp-text)]">jamais ton appareil</strong>.
                                </p>
                                {/* Légende couleurs */}
                                <div className="flex flex-col gap-1.5 mt-2">
                                    {[
                                        { color: '#3B82F6', label: 'Concentré' },
                                        { color: '#10B981', label: 'Motivé' },
                                        { color: '#A78BFA', label: 'Fatigué' },
                                        { color: '#F87171', label: 'Anxieux' },
                                    ].map(({ color, label }) => (
                                        <div key={label} className="flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                                            <span className="text-xs text-[var(--bp-text-muted)]">{label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Graphe d'humeur — palette émotionnelle dédiée */}
                            <div className="flex-1 flex flex-col gap-2">
                                <p className="text-xs font-medium text-[var(--bp-text-muted)] mb-1">7 derniers jours</p>
                                <div className="flex items-end gap-2 h-24 w-full">
                                    {MOOD_PALETTE.map(({ color, label, h }, i) => (
                                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                            <div
                                                className="w-full rounded-t-lg transition-all duration-500"
                                                style={{ height: `${h}%`, backgroundColor: color, opacity: 0.85 }}
                                            />
                                            <span className="text-[8px] text-[var(--bp-text-faint)] hidden sm:block truncate max-w-full text-center">
                                                {['L', 'M', 'M', 'J', 'V', 'S', 'D'][i]}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                {/* Résumé de semaine */}
                                <div className="mt-3 flex gap-2 flex-wrap">
                                    <span className="px-2.5 py-1 rounded-full bg-[#3B82F6]/10 text-[#3B82F6] text-xs font-medium">3× Concentré</span>
                                    <span className="px-2.5 py-1 rounded-full bg-[#10B981]/10 text-[#10B981] text-xs font-medium">2× Motivé</span>
                                    <span className="px-2.5 py-1 rounded-full bg-[#A78BFA]/10 text-[#A78BFA] text-xs font-medium">1× Fatigué</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* ── Card 5 — PIN : mockup concret ── */}
                    <Card className="relative col-span-full overflow-hidden lg:col-span-3 border-[var(--bp-border)]">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="relative flex aspect-square size-12 rounded-xl border border-[var(--bp-border)] items-center justify-center">
                                    <Lock className="size-6 text-[var(--color-ochre)]" strokeWidth={1.2} />
                                </div>
                                <h2 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-nunito)' }}>Toi seul y as accès</h2>
                            </div>
                            <p className="text-[var(--bp-text-muted)] text-sm mb-5">
                                Verrouille n&apos;importe quelle note avec un code PIN à 4 chiffres. Le hash reste sur ton appareil — jamais sur nos serveurs.
                            </p>
                            {/* Mockup PIN réaliste */}
                            <div className="rounded-2xl border border-[var(--bp-border)] bg-[var(--bp-bg-elevated)] px-5 py-4">
                                <p className="text-xs font-medium text-[var(--bp-text-muted)] text-center mb-3">
                                    🔒 Note verrouillée — entre ton code PIN
                                </p>
                                {/* Champs PIN */}
                                <div className="flex justify-center gap-3 mb-4">
                                    {[true, true, true, false].map((filled, i) => (
                                        <div
                                            key={i}
                                            className="w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all"
                                            style={{
                                                borderColor: filled
                                                    ? 'var(--color-ochre)'
                                                    : 'var(--bp-border)',
                                                backgroundColor: filled
                                                    ? 'var(--color-ochre-light)'
                                                    : 'var(--bp-surface)',
                                            }}
                                        >
                                            {filled ? (
                                                <div className="w-3 h-3 rounded-full bg-[var(--color-ochre)]" />
                                            ) : (
                                                <div className="w-2 h-2 rounded-full bg-[var(--bp-border)] animate-pulse" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                                {/* Mini clavier */}
                                <div className="grid grid-cols-3 gap-2 max-w-[140px] mx-auto">
                                    {['1','2','3','4','5','6','7','8','9'].map(n => (
                                        <div
                                            key={n}
                                            className="h-8 rounded-lg border border-[var(--bp-border)] bg-[var(--bp-surface)] flex items-center justify-center text-xs font-medium text-[var(--bp-text-muted)]"
                                        >
                                            {n}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* ── Card 6 — OCR Scanner ── */}
                    <Card className="relative col-span-full overflow-hidden lg:col-span-3 border-[var(--bp-border)]">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="relative flex aspect-square size-12 rounded-xl border border-[var(--bp-border)] items-center justify-center">
                                    <ScanText className="size-6 text-[var(--color-ochre)]" strokeWidth={1.2} />
                                </div>
                                <h2 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-nunito)' }}>Scanne ton cahier</h2>
                            </div>
                            <p className="text-[var(--bp-text-muted)] text-sm mb-5">
                                Prends en photo une page de cours. BinlinIA transcrit ton écriture directement dans ta note.
                            </p>
                            {/* Scanner visual */}
                            <div className="rounded-xl border border-[var(--bp-border)] bg-[var(--bp-bg-elevated)] p-3 flex flex-col gap-1.5">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-2 h-2 rounded-full bg-[var(--color-ochre)] animate-pulse" />
                                    <span className="text-xs text-[var(--bp-text-muted)]">Transcription en cours...</span>
                                </div>
                                {["Théorème de Pythagore :", "Dans un triangle rectangle,", "a² + b² = c²"].map((line, i) => (
                                    <div key={i} className="h-3 rounded" style={{ width: `${80 - i * 15}%`, backgroundColor: 'var(--bp-border)', opacity: 1 - i * 0.15 }} />
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </section>
    )
}
