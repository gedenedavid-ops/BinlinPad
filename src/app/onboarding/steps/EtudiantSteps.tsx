'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/primitives/Button';
import { generateId } from '@/lib/utils';
import type { CustomSubject } from '@/types';

const SUGGESTIONS = [
  'Médecine', 'Droit', 'Informatique', 'Économie',
  'Sciences', 'Lettres', 'Pharmacie', 'Architecture',
];

const EMOJI_PICKER_OPTIONS = [
  '📖', '📐', '⚛️', '🌿', '🏛️', '🎨', '🎵', '🌍',
  '💊', '⚖️', '💻', '📊', '🔬', '🧮', '🎭', '🏃',
  '🌐', '💡', '📝', '🎓',
];

const COLOR_OPTIONS = ['#F4A236', '#3B82F6', '#10B981', '#8B5CF6', '#EF4444', '#9B9590'];

function createItem(): CustomSubject {
  return { id: generateId(), label: '', emoji: '📝', color: '#F4A236' };
}

interface SubjectItemProps {
  item: CustomSubject;
  canDelete: boolean;
  onChange: (id: string, patch: Partial<CustomSubject>) => void;
  onDelete: (id: string) => void;
}

function SubjectItem({ item, canDelete, onChange, onDelete }: SubjectItemProps) {
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-[#E8E4DF] bg-white p-3">
      <div className="flex items-center gap-2">
        {/* Emoji picker trigger */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setPickerOpen((v) => !v)}
            className="w-9 h-9 rounded-xl border border-[#E8E4DF] bg-[#FAF8F5] text-lg flex items-center justify-center hover:border-[#F4A236] transition-colors"
          >
            {item.emoji}
          </button>
          {pickerOpen && (
            <div className="absolute top-10 left-0 z-10 bg-white border border-[#E8E4DF] rounded-2xl shadow-lg p-2 grid grid-cols-5 gap-1 w-[180px]">
              {EMOJI_PICKER_OPTIONS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => {
                    onChange(item.id, { emoji: e });
                    setPickerOpen(false);
                  }}
                  className="w-8 h-8 rounded-lg text-base hover:bg-[#FDF0DC] flex items-center justify-center transition-colors"
                >
                  {e}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Label input */}
        <input
          type="text"
          value={item.label}
          onChange={(e) => onChange(item.id, { label: e.target.value })}
          placeholder="Nom de la matière"
          className="flex-1 h-9 rounded-xl border border-[#E8E4DF] bg-[#FAF8F5] px-3 text-sm text-[#1A1A1A] placeholder:text-[#9B9590] outline-none focus:border-[#F4A236] transition-colors"
        />

        {/* Delete */}
        {canDelete && (
          <button
            type="button"
            onClick={() => onDelete(item.id)}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-[#9B9590] hover:text-[#EF4444] hover:bg-red-50 transition-colors"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>

      {/* Color picker */}
      <div className="flex items-center gap-1.5 pl-1">
        {COLOR_OPTIONS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onChange(item.id, { color: c })}
            className="w-5 h-5 rounded-full transition-transform hover:scale-110"
            style={{
              backgroundColor: c,
              outline: item.color === c ? `2px solid ${c}` : '2px solid transparent',
              outlineOffset: '2px',
            }}
          />
        ))}
      </div>
    </div>
  );
}

interface EtudiantStepsProps {
  onComplete: (data: { studentField: string; customSubjects: CustomSubject[] }) => void;
}

export function EtudiantSteps({ onComplete }: EtudiantStepsProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [studentField, setStudentField] = useState('');
  const [items, setItems] = useState<CustomSubject[]>([createItem()]);

  const updateItem = (id: string, patch: Partial<CustomSubject>) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  };

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const addItem = () => {
    setItems((prev) => [...prev, createItem()]);
  };

  const allLabelled = items.every((it) => it.label.trim().length > 0);

  const handleComplete = () => {
    if (!allLabelled) return;
    onComplete({ studentField, customSubjects: items });
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
              Tu étudies quoi&nbsp;?
            </h1>
            <p className="text-[#9B9590] text-sm">
              Dis-nous ta filière pour que Binlin s&apos;adapte.
            </p>
          </div>

          {/* Input filière */}
          <input
            type="text"
            value={studentField}
            onChange={(e) => setStudentField(e.target.value)}
            placeholder="Ex: Médecine, Droit, Informatique…"
            className="w-full h-11 rounded-xl border border-[#E8E4DF] bg-white px-4 text-sm text-[#1A1A1A] placeholder:text-[#9B9590] outline-none focus:border-[#F4A236] transition-colors"
          />

          {/* Chips de suggestions */}
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStudentField(s)}
                className={[
                  'px-3 py-1.5 rounded-xl border text-xs font-medium transition-all',
                  studentField === s
                    ? 'bg-[#FDF0DC] border-[#F4A236] text-[#1A1A1A]'
                    : 'bg-white border-[#E8E4DF] text-[#9B9590] hover:border-[#F4A236]/50',
                ].join(' ')}
              >
                {s}
              </button>
            ))}
          </div>

          <Button
            variant="dark"
            size="lg"
            disabled={studentField.trim().length === 0}
            onClick={() => setStep(2)}
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
              Crée les matières que tu veux suivre.
            </p>
          </div>

          {/* Liste d'items */}
          <div className="flex flex-col gap-2">
            {items.map((item) => (
              <SubjectItem
                key={item.id}
                item={item}
                canDelete={items.length > 1}
                onChange={updateItem}
                onDelete={deleteItem}
              />
            ))}
          </div>

          {/* Ajouter */}
          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-2 text-sm font-medium text-[#F4A236] hover:opacity-80 transition-opacity"
          >
            <span className="w-6 h-6 rounded-full bg-[#FDF0DC] flex items-center justify-center text-base leading-none">+</span>
            Ajouter une matière
          </button>

          <Button
            variant="dark"
            size="lg"
            disabled={!allLabelled}
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
