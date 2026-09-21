import type { Subject, UserType, CustomSubject } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

export type SubjectMeta = { emoji: string; color: string; bg: string };

// ─── Élève Config ─────────────────────────────────────────────────────────────

export const ELEVE_SUBJECT_CONFIG: Record<Subject, SubjectMeta> = {
  'Français':            { emoji: '📖', color: '#EC4899', bg: '#FDF2F8' },
  'Anglais':             { emoji: '🇬🇧', color: '#3B82F6', bg: '#EFF6FF' },
  'Histoire-Géographie': { emoji: '🌍', color: '#F59E0B', bg: '#FFFBEB' },
  'Philosophie':         { emoji: '🤔', color: '#78716C', bg: '#F5F5F4' },
  'Espagnol':            { emoji: '🇪🇸', color: '#EF4444', bg: '#FEF2F2' },
  'Allemand':            { emoji: '🇩🇪', color: '#6366F1', bg: '#EEF2FF' },
  'Mathématiques':       { emoji: '📐', color: '#3B82F6', bg: '#EFF6FF' },
  'Physique-Chimie':     { emoji: '⚛️', color: '#8B5CF6', bg: '#F5F3FF' },
  'SVT':                 { emoji: '🌿', color: '#22C55E', bg: '#F0FDF4' },
  'EDHC':                { emoji: '🏛️', color: '#14B8A6', bg: '#F0FDFA' },
  'EPS':                 { emoji: '⚽', color: '#F97316', bg: '#FFF7ED' },
  'Arts Plastiques':     { emoji: '🎨', color: '#E11D48', bg: '#FFF1F2' },
  'Éducation Musicale':  { emoji: '🎵', color: '#A855F7', bg: '#FAF5FF' },
  'Autre':               { emoji: '📝', color: '#9B9590', bg: '#F5F3EF' },
};

export const ELEVE_SUBJECTS = Object.keys(ELEVE_SUBJECT_CONFIG) as Subject[];

// ─── Étudiant Config ──────────────────────────────────────────────────────────

export function buildEtudiantConfig(
  custom: CustomSubject[]
): Record<string, SubjectMeta> {
  if (custom.length === 0) {
    return { Autre: { emoji: '📝', color: '#9B9590', bg: '#F5F3EF' } };
  }
  return Object.fromEntries(
    custom.map((s) => [
      s.label,
      { emoji: s.emoji, color: s.color, bg: `${s.color}20` },
    ])
  );
}

// ─── Selector ─────────────────────────────────────────────────────────────────

export function getSubjectConfig(
  userType: UserType,
  customSubjects?: CustomSubject[]
): Record<string, SubjectMeta> {
  if (userType === 'eleve') return ELEVE_SUBJECT_CONFIG;
  return buildEtudiantConfig(customSubjects ?? []);
}
