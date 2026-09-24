'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, X, SlidersHorizontal,
  Folder,
} from 'lucide-react';
import { useStore, useFilteredNotes } from '@/store';
import { MOOD_CONFIG, cn } from '@/lib/utils';
import { useUserContext } from '@/lib/useUserContext';
import { NoteCard } from '@/components/journal/NoteCard';
import { NoteEditor } from '@/components/journal/NoteEditor';
import { PinLockModal } from '@/components/journal/PinLock';
import { MoodDashboard } from '@/components/journal/MoodDashboard';
import { NoteCardSkeleton } from '@/components/ui/feedback/Skeleton';
import { StreakBadge } from '@/components/ui/progress/StreakBadge';
import { Button } from '@/components/ui/primitives/Button';
import type { Note, Subject, Mood } from '@/types';

const MOODS = Object.keys(MOOD_CONFIG) as Mood[];

export default function JournalPage() {
  const {
    notes, notesLoaded, searchQuery, filterSubject, filterMood,
    setSearchQuery, setFilterSubject, setFilterMood,
    openEditor, loadNotes, prefs,
  } = useStore();
  const { subjectConfig, subjectList, isEleve } = useUserContext();
  const filteredNotes = useFilteredNotes();
  const visibleNotes = isEleve && !filterSubject ? [] : filteredNotes;
  const [showFilters, setShowFilters] = useState(false);
  const [viewNote, setViewNote] = useState<Note | null>(null);

  useEffect(() => { loadNotes(); }, [loadNotes]);

  // Stats
  const subjectsSet = new Set(notes.map((n) => n.subject));

  const hasFilters = filterSubject || filterMood || searchQuery;

  return (
    <div className="flex flex-col h-full">
      {/* En-tête */}
      <div className="sticky top-0 z-10 bg-[#FAF8F5]/90 dark:bg-[#111110]/90 backdrop-blur-md border-b border-[#E8E4DF] dark:border-[#2E2C28]">
        <div className="px-5 md:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-[#1A1A1A] dark:text-[#F0EDE8]">Mes notes</h1>
                <StreakBadge />
              </div>
              <p className="text-xs text-[#9B9590] mt-0.5">
                {notes.length} note{notes.length > 1 ? 's' : ''} · {subjectsSet.size} matière{subjectsSet.size > 1 ? 's' : ''}
              </p>
            </div>
            <Button variant="dark" size="md" onClick={() => openEditor()}>
              <Plus size={16} />
              <span className="hidden sm:inline">Nouvelle note</span>
            </Button>
          </div>

          {/* Recherche + Filtres + Layout switcher */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9B9590]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher notes, matières, tags…"
                className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-[#242320] border border-[#E8E4DF] dark:border-[#2E2C28] rounded-xl text-sm text-[#1A1A1A] dark:text-[#F0EDE8] placeholder-[#C8C4BE] focus:border-[#F4A236] focus:ring-2 focus:ring-[#F4A236]/20 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B9590] hover:text-[#1A1A1A] dark:hover:text-[#F0EDE8]"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all',
                (showFilters || filterSubject || filterMood)
                  ? 'bg-[#F4A236] text-white border-[#F4A236]'
                  : 'bg-white dark:bg-[#242320] text-[#9B9590] border-[#E8E4DF] dark:border-[#2E2C28] hover:border-[#F4A236] hover:text-[#F4A236]'
              )}
            >
              <SlidersHorizontal size={15} />
              <span className="hidden sm:inline">Filtrer</span>
            </button>
          </div>

          {/* Panneau de filtres */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pt-3 space-y-3">
                  <div>
                    <p className="text-[10px] font-semibold text-[#9B9590] uppercase tracking-wider mb-1.5">Matière</p>
                    <div className="flex flex-wrap gap-1.5">
                      {subjectList.map((s) => (
                        <button
                          key={s}
                          onClick={() => setFilterSubject(filterSubject === s ? null : s as Subject)}
                          className={cn(
                            'flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all',
                            filterSubject === s
                              ? 'bg-[#1A1A1A] dark:bg-[#F0EDE8] text-white dark:text-[#1A1A1A]'
                              : 'bg-white dark:bg-[#242320] border border-[#E8E4DF] dark:border-[#2E2C28] text-[#9B9590] hover:border-[#1A1A1A] dark:hover:border-[#F0EDE8] hover:text-[#1A1A1A] dark:hover:text-[#F0EDE8]'
                          )}
                        >
                          {subjectConfig[s]?.emoji} {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold text-[#9B9590] uppercase tracking-wider mb-1.5">Humeur</p>
                    <div className="flex flex-wrap gap-1.5">
                      {MOODS.map((m) => (
                        <button
                          key={m}
                          onClick={() => setFilterMood(filterMood === m ? null : m)}
                          className={cn(
                            'flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all',
                            filterMood === m
                              ? 'bg-[#1A1A1A] dark:bg-[#F0EDE8] text-white dark:text-[#1A1A1A]'
                              : 'bg-white dark:bg-[#242320] border border-[#E8E4DF] dark:border-[#2E2C28] text-[#9B9590] hover:border-[#1A1A1A] dark:hover:border-[#F0EDE8]'
                          )}
                        >
                          {MOOD_CONFIG[m].emoji} {MOOD_CONFIG[m].label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {hasFilters && (
                    <button
                      onClick={() => { setFilterSubject(null); setFilterMood(null); setSearchQuery(''); }}
                      className="text-xs text-[#F4A236] font-medium hover:underline"
                    >
                      Effacer les filtres
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 px-5 md:px-8 py-5 overflow-y-auto">
        {/* Dashboard humeur */}
        {!hasFilters && <MoodDashboard notes={notes} />}

        {/* Dossiers de matières — les matières élèves sont prédéfinies */}
        {isEleve && !searchQuery && !filterMood && (
          <section className="mb-6" aria-labelledby="subject-folders-title">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 id="subject-folders-title" className="text-sm font-bold text-[#1A1A1A] dark:text-[#F0EDE8]">
                  Mes matières
                </h2>
                <p className="mt-0.5 text-xs text-[#9B9590]">Tes notes se rangent automatiquement dans le bon dossier.</p>
              </div>
              {filterSubject && (
                <button
                  type="button"
                  onClick={() => setFilterSubject(null)}
                  className="text-xs font-medium text-[#F4A236] hover:underline"
                >
                  Voir tout
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
              {subjectList.map((subject) => {
                const config = subjectConfig[subject];
                const noteCount = notes.filter((note) => note.subject === subject).length;
                const isSelected = filterSubject === subject;

                return (
                  <button
                    key={subject}
                    type="button"
                    onClick={() => setFilterSubject(isSelected ? null : subject as Subject)}
                    className={cn(
                      'group relative overflow-hidden rounded-2xl border p-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-md',
                      isSelected ? 'ring-2 ring-[#1A1A1A] dark:ring-[#F0EDE8]' : 'border-[#E8E4DF] dark:border-[#2E2C28]'
                    )}
                    style={{ backgroundColor: config?.bg ?? '#F5F3EF', borderColor: isSelected ? config?.color : undefined }}
                  >
                    <Folder
                      size={28}
                      strokeWidth={1.8}
                      fill={config?.color ?? '#9B9590'}
                      className="mb-3 transition-transform group-hover:scale-105"
                      style={{ color: config?.color ?? '#9B9590' }}
                    />
                    <span className="block truncate text-xs font-bold text-[#1A1A1A] dark:text-[#1A1A1A]">
                      {subject}
                    </span>
                    <span className="mt-1 block text-[11px] text-[#6B6660]">
                      {noteCount} note{noteCount > 1 ? 's' : ''}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Grille de notes — skeleton pendant le chargement initial */}
        {!notesLoaded ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-3 space-y-3">
            {[false, true, false, true, true, false, true, false].map((tall, i) => (
              <div key={i} className="break-inside-avoid">
                <NoteCardSkeleton tall={tall} />
              </div>
            ))}
          </div>
        ) : visibleNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <h3 className="text-[#1A1A1A] dark:text-[#F0EDE8] font-semibold mb-1">
              {isEleve && !filterSubject
                ? 'Choisis une matière'
                : hasFilters ? 'Aucune note ne correspond' : 'Aucune note pour l\'instant'}
            </h3>
            <p className="text-[#9B9590] text-sm max-w-xs">
              {isEleve && !filterSubject
                ? 'Clique sur un dossier pour afficher les notes de cette matière.'
                : hasFilters
                ? 'Essaie d\'ajuster ta recherche ou tes filtres.'
                : 'Commence à capturer tes cours, idées et réflexions. Ta première note est à un clic.'}
            </p>
            {!hasFilters && !isEleve && (
              <Button variant="dark" size="md" className="mt-5" onClick={() => openEditor()}>
                <Plus size={16} /> Écrire ma première note
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* ── Masonry layout ── */}
            {prefs.noteLayout === 'masonry' && (
              <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-3 space-y-3">
                {filteredNotes.map((note, i) => (
                  <div key={note.id} className="break-inside-avoid">
                    <NoteCard note={note} onOpen={setViewNote} index={i} />
                  </div>
                ))}
              </div>
            )}

            {/* ── Grid layout ── */}
            {prefs.noteLayout === 'grid' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {filteredNotes.map((note, i) => (
                  <NoteCard key={note.id} note={note} onOpen={setViewNote} index={i} />
                ))}
              </div>
            )}

            {/* ── List layout ── */}
            {prefs.noteLayout === 'list' && (
              <div className="flex flex-col gap-2 max-w-3xl">
                {filteredNotes.map((note, i) => (
                  <NoteCard key={note.id} note={note} onOpen={setViewNote} index={i} listMode />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Note Detail Modal */}
      <AnimatePresence>
        {viewNote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
              onClick={() => setViewNote(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="relative w-full max-w-2xl max-h-[85vh] bg-white dark:bg-[#1C1B19] rounded-3xl shadow-xl overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#E8E4DF] dark:border-[#2E2C28]">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{subjectConfig[viewNote.subject]?.emoji ?? '📝'}</span>
                  <span className="text-xs font-medium text-[#9B9590]">{viewNote.subject}</span>
                  {viewNote.mood && <span className="text-sm">{MOOD_CONFIG[viewNote.mood].emoji}</span>}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" onClick={() => { setViewNote(null); useStore.getState().openEditor(viewNote.id); }}>
                    Edit
                  </Button>
                  <button onClick={() => setViewNote(null)} className="p-1.5 rounded-xl hover:bg-[#F5F3EF] dark:hover:bg-[#242320] text-[#9B9590]">
                    <X size={16} />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-4">
                <h2 className="text-xl font-bold text-[#1A1A1A] dark:text-[#F0EDE8] mb-3">{viewNote.title}</h2>
                <p className="text-sm text-[#1A1A1A] dark:text-[#F0EDE8] leading-relaxed whitespace-pre-wrap note-content">{viewNote.content}</p>
                {viewNote.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {viewNote.tags.map((tag) => (
                      <span key={tag.id} className="text-xs px-2.5 py-1 bg-[#F5F3EF] dark:bg-[#242320] text-[#9B9590] rounded-full">
                        #{tag.label}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Editor + PIN overlays */}
      <NoteEditor />
      <PinLockModal />
    </div>
  );
}
