'use client';

import { Printer } from 'lucide-react';
import { renderMarkdown } from '@/lib/renderMarkdown';
import { FlashcardsModal, type Flashcard } from '@/components/journal/FlashcardsModal';

export type NoteStudyContent =
  | { type: 'flashcards'; cards: Flashcard[]; noteTitle: string }
  | { type: 'exam'; result: string; noteTitle: string };

export function NoteStudyModal({ content, onClose }: {
  content: NoteStudyContent;
  onClose: () => void;
}) {
  if (content.type === 'flashcards') {
    return <FlashcardsModal cards={content.cards} noteTitle={content.noteTitle} onClose={onClose} />;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Fermer les devoirs"
        className="absolute inset-0 bg-black/45 backdrop-blur-sm"
        onClick={onClose}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="study-result-title"
        className="printable-exam relative flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-[#E8E4DF] bg-white shadow-2xl dark:border-[#2E2C28] dark:bg-[#1C1B19]"
      >
        <header className="flex items-start justify-between gap-4 border-b border-[#E8E4DF] px-5 py-4 dark:border-[#2E2C28]">
          <div className="min-w-0">
            <h2 id="study-result-title" className="text-sm font-bold text-[#1A1A1A] dark:text-[#F0EDE8]">
              Devoirs
            </h2>
            <p className="mt-0.5 truncate text-xs text-[#9B9590]">{content.noteTitle}</p>
          </div>
          <div className="flex flex-shrink-0 items-center gap-2 print:hidden">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#F4A236] px-3 text-xs font-semibold text-white transition-colors hover:bg-[#E8941E]"
            >
              <Printer size={14} />
              Imprimer
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer"
              className="rounded-lg p-1.5 text-[#9B9590] transition-colors hover:bg-[#F5F3EF] hover:text-[#1A1A1A] dark:hover:bg-[#242320] dark:hover:text-[#F0EDE8]"
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>
        </header>
        <div className="printable-exam-content overflow-y-auto px-5 py-4 text-sm leading-relaxed text-[#1A1A1A] dark:text-[#F0EDE8]">
          {renderMarkdown(content.result)}
        </div>
      </section>
    </div>
  );
}