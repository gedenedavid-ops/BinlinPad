'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/primitives/Button';
import { ELEVE_SUBJECT_CONFIG, ELEVE_SUBJECTS } from '@/lib/subjects';
import type { SchoolLevel } from '@/types';

const SCHOOL_LEVELS: SchoolLevel[] = ['6ème', '5ème', '4ème', '3ème', '2nde', '1ère', 'Terminale'];

interface EleveStepsProps {
  onComplete: (data: { schoolLevel: SchoolLevel; activeSubjects: string[] }) => void;
}

export function EleveSteps({ onComplete }: EleveStepsProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [schoolLevel, setSchoolLevel] = useState<SchoolLevel | null>(null);
  const [activeSubjects, setActiveSubjects] = useState<string[]>(() =>
    ELEVE_SUBJECTS as unknown as string[]
  );

  const toggleSubject = (subject: string) => {
    setActiveSubjects((prev) =>
      prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]
    );
  };

  const handleNext = () => {
    setStep(2);
  };

  const handleComplete = () => {
    if (!schoolLevel) return;
    onComplete({ schoolLevel, activeSubjects });
  };

  return (
    <AnimatePresence mode="wait">
      {step === 1 ? (
        <motion.div
          key="step1"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.22, ease: 'easeInOut' }}
          className="flex flex-col gap-6"
        >
          {/* Header */}
          <div className="flex flex-col gap-1">
            <h1 className="font-black text-2xl text-[#1A1A1A] leading-tight">
              Tu es en quelle classe&nbsp;?
            </h1>
            <p className="text-[#9B9590] text-sm">
              On adapte Binlin à ton niveau.
            </p>
          </div>

          {/* Grille de niveaux */}
          <div className="grid grid-cols-2 gap-3">
            {SCHOOL_LEVELS.map((level) => {
              const isActive = schoolLevel === level;
              return (
                <button
                  key={level}
                  onClick={() => setSchoolLevel(level)}
                  className={[
                    'rounded-2xl border-2 py-3.5 px-4 text-sm font-semibold transition-all duration-150 text-left',
                    isActive
                      ? 'bg-[#FDF0DC] border-[#F4A236] text-[#1A1A1A]'
                      : 'bg-white border-[#E8E4DF] text-[#9B9590] hover:border-[#F4A236]/50',
                  ].join(' ')}
                >
                  {level}
                </button>
              );
            })}
          </div>

          <Button
            variant="dark"
            size="lg"
            disabled={!schoolLevel}
            onClick={handleNext}
            className="w-full"
          >
            Suivant
          </Button>
        </motion.div>
      ) : (
        <motion.div
          key="step2"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.22, ease: 'easeInOut' }}
          className="flex flex-col gap-6"
        >
          {/* Header */}
          <div className="flex flex-col gap-1">
            <h1 className="font-black text-2xl text-[#1A1A1A] leading-tight">
              Tes matières
            </h1>
            <p className="text-[#9B9590] text-sm">
              Coche celles que tu veux réviser. Tu pourras modifier ça plus tard.
            </p>
          </div>

          {/* Grille de matières */}
          <div className="grid grid-cols-2 gap-2">
            {(ELEVE_SUBJECTS as string[]).map((subject) => {
              const meta = ELEVE_SUBJECT_CONFIG[subject as keyof typeof ELEVE_SUBJECT_CONFIG];
              const isChecked = activeSubjects.includes(subject);
              return (
                <button
                  key={subject}
                  onClick={() => toggleSubject(subject)}
                  className={[
                    'flex items-center gap-2 rounded-2xl border px-3 py-2.5 text-sm font-medium transition-all duration-150 text-left',
                    isChecked
                      ? 'bg-[#FDF0DC] border-[#F4A236] text-[#1A1A1A]'
                      : 'bg-white border-[#E8E4DF] text-[#9B9590]',
                  ].join(' ')}
                >
                  {/* Checkbox visuelle */}
                  <span
                    className={[
                      'w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors',
                      isChecked ? 'bg-[#F4A236] border-[#F4A236]' : 'border-[#E8E4DF]',
                    ].join(' ')}
                  >
                    {isChecked && (
                      <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                        <path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  <span>{meta?.emoji ?? '📝'}</span>
                  <span className="truncate">{subject}</span>
                </button>
              );
            })}
          </div>

          <Button
            variant="dark"
            size="lg"
            disabled={activeSubjects.length === 0}
            onClick={handleComplete}
            className="w-full"
          >
            Commencer 🎉
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
