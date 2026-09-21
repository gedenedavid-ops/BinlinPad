// ─── Core Data Types ──────────────────────────────────────────────────────────

export type Subject =
  | 'Français'
  | 'Anglais'
  | 'Histoire-Géographie'
  | 'Philosophie'
  | 'Espagnol'
  | 'Allemand'
  | 'Mathématiques'
  | 'Physique-Chimie'
  | 'SVT'
  | 'EDHC'
  | 'EPS'
  | 'Arts Plastiques'
  | 'Éducation Musicale'
  | 'Autre';

export type Mood = 'focused' | 'confused' | 'tired' | 'motivated' | 'anxious' | 'calm';

export type NoteTag = {
  id: string;
  label: string;
  color: string;
};
type NoteAttachment = {
  id: string;
  type: 'image' | 'pdf' | 'link';
  url: string;
  name: string;
  size?: number;
};

export type Note = {
  id: string;
  title: string;
  content: string;
  subject: Subject;
  tags: NoteTag[];
  mood?: Mood;
  attachments: NoteAttachment[];
  isLocked: boolean;
  isPinned: boolean;
  isFavorite: boolean;
  color?: 'ochre' | 'dark' | 'default';
  createdAt: Date;
  updatedAt: Date;
  wordCount: number;
  readTime: number; // minutes
};

export type NoteFormData = Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'wordCount' | 'readTime'>;

// ─── Graph Types ──────────────────────────────────────────────────────────────

export type GraphNode = {
  id: string;
  label: string;
  type: 'subject' | 'concept' | 'note' | 'mood';
  subject?: Subject;
  color?: string;
  size?: number;
  noteIds?: string[];
  x?: number;
  y?: number;
};

// ─── Chat / AI Types ──────────────────────────────────────────────────────────

type ChatRole = 'user' | 'assistant' | 'system';

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: Date;
  sources?: NoteSource[];
  isLoading?: boolean;
  /** Durée en secondes du minuteur d'exercice — présent uniquement si l'IA a donné un exercice chronométré */
  timerSeconds?: number;
};

type NoteSource = {
  noteId: string;
  title: string;
  excerpt: string;
  score: number;
};

export type ChatSession = {
  id: string;
  title: string;
  messages: ChatMessage[];
  summary?: string;   // résumé IA généré après une longue session
  createdAt: Date;
  updatedAt: Date;
};

// ─── UI State Types ───────────────────────────────────────────────────────────

export type NavRoute = 'journal' | 'graph' | 'tutor' | 'settings';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export type Toast = {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
};

// ─── User Profile Types ───────────────────────────────────────────────────────

export type UserType = 'eleve' | 'etudiant';

export type SchoolLevel = '6ème' | '5ème' | '4ème' | '3ème' | '2nde' | '1ère' | 'Terminale';

export type StudentField = string;

export type CustomSubject = {
  id: string;
  label: string;
  emoji: string;
  color: string;
};

export type LearningProfile = {
  weakSubjects: string[];
  studiedTopics: string[];
  totalSessions: number;
  lastActiveAt?: Date;
  onboardingDone: boolean;
  schoolLevel?: SchoolLevel;
  studentField?: StudentField;
  customSubjects?: CustomSubject[];
};

export type SearchResult = {
  id: string;
  score: number;
  payload: {
    noteId: string;
    title: string;
    content: string;
    subject: Subject;
  };
};
