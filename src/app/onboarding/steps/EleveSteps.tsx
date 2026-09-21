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
  const [schoolLevel, setSchoolLevel] = useState<SchoolLevel | null>(null);

  const handleComplete = () => {
    if (!schoolLevel) return;
    onComplete({ 
      schoolLevel, 
      // Pour l'élève, on inclut toutes les matières d'office
      activeSubjects: ELEVE_SUBJECTS as unknown as string[] 
    });
  };

  return (
    <AnimatePresence mode="wait">
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
            On adapte Binlin à ton niveau. Les matières de ton programme seront automatiquement incluses.
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
          onClick={handleComplete}
          className="w-full"
        >
          Commencer 🎉
        </Button>
      </motion.div>
    </AnimatePresence>
  );
}
