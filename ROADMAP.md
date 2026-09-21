# 🗺️ Roadmap BinlinPad — Design & Architecture

> Objectif : atteindre le niveau UI/UX de la référence (Awsmd Notes)
> Palette OK · Animations OK · Fonctionnalités OK
> **Ce qui manque : séparation élève/étudiant, structure desktop, illustrations, lecture inline**

---

## Vue d'ensemble

```
Sprint 0 — Architecture           🟣  Séparation élève / étudiant (PRIORITÉ 1)
Sprint 1 — Structure spatiale     🔴  Layout 3 colonnes + Folders visuels
Sprint 2 — Richesse des cartes    🟡  Cards aérées + États vides + Tags
Sprint 3 — Lecture & Recherche    🟠  Panneau inline + Search Suggested
Sprint 4 — Actions & Polish       🟢  Export sheet + PIN + Micro-animations
```

---

## 🟣 Sprint 0 — Séparation Architecture Élève / Étudiant

> **À faire EN PREMIER**, avant tout travail UI.
> Les deux profils existent déjà en base (`userType: 'eleve' | 'etudiant'` dans `User.ts`)
> et dans le store (`UserProfileSlice`), mais tout le reste de l'app les traite identiquement.
> Ce sprint crée la séparation propre **sans dupliquer les pages ni les composants**.

### Principe directeur — PAS de dossiers séparés par profil

```
❌ NE PAS FAIRE                     ✅ FAIRE À LA PLACE
─────────────────────────────────   ──────────────────────────────────────
src/app/journal/eleve/page.tsx      src/lib/subjects.ts
src/app/journal/etudiant/page.tsx     └── ELEVE_SUBJECT_CONFIG (fixe)
src/components/journal/eleve/         └── buildEtudiantConfig() (dynamique)
src/components/journal/etudiant/      └── getSubjectConfig() (point d'entrée)
                                    src/lib/useUserContext.ts
                                      └── hook unique lu par tous les composants
                                    src/app/onboarding/
                                      ├── steps/EleveSteps.tsx   (seul endroit
                                      └── steps/EtudiantSteps.tsx  vraiment différent)
```

**Règle :** si c'est identique sauf les matières → **un seul fichier**.
Si le flow est fondamentalement différent dès le départ → fichier séparé.
L'onboarding est la **seule exception** justifiée.

---

### Différences réelles entre les deux profils

| Dimension | 🎒 Élève | 🎓 Étudiant |
|---|---|---|
| **Matières** | 13 matières fixes ivoiriennes (`SUBJECT_CONFIG` hardcodé dans `utils.ts`) | Libre — crée ses propres matières + emoji + couleur |
| **Classe** | 6ème → Terminale (champ `schoolLevel`) | N/A |
| **Filière** | N/A | Texte libre (ex: "Médecine", "Droit") |
| **Dossiers** | Calqués sur les matières activées à l'onboarding | Calqués sur les `customSubjects` créées |
| **Tuteur IA** | Ton scolaire, programme ivoirien, niveau `schoolLevel` | Ton universitaire, domaine `studentField` |
| **Filtres notes** | Matière parmi la liste prédéfinie | Tag libre ou workspace |
| **Onboarding** | Choix classe + matières à activer | Filière + création de matières libres |

---

### 0.1 — Étendre les types et le modèle User

**Fichier : `src/types/index.ts`** — Modifier

```ts
// Niveaux scolaires (élève uniquement)
export type SchoolLevel =
  | '6ème' | '5ème' | '4ème' | '3ème'   // Collège
  | '2nde' | '1ère' | 'Terminale';        // Lycée

// Filière (étudiant uniquement) — texte libre
export type StudentField = string;

// Matière personnalisée (étudiant uniquement)
export type CustomSubject = {
  id:    string;
  label: string;
  emoji: string;
  color: string; // hex
};

// LearningProfile étendu
export type LearningProfile = {
  weakSubjects:   string[];
  studiedTopics:  string[];
  totalSessions:  number;
  lastActiveAt?:  Date;
  onboardingDone: boolean;      // ← NOUVEAU : évite de réafficher l'onboarding
  schoolLevel?:   SchoolLevel;  // élève seulement
  studentField?:  StudentField; // étudiant seulement
  customSubjects?: CustomSubject[]; // étudiant seulement
};
```

**Fichier : `src/models/User.ts`** — Modifier
Ajouter `onboardingDone`, `schoolLevel`, `studentField`, `customSubjects` dans `LearningProfileSchema`.

---

### 0.2 — Extraire la config matières dans `subjects.ts`

**Fichier : `src/lib/subjects.ts`** — **Créer**

Actuellement `SUBJECT_CONFIG` est hardcodé dans `utils.ts` et ne connaît pas le profil.
Ce fichier devient la **source de vérité unique** pour toute la logique matières.

```ts
// Les 13 matières ivoiriennes fixes — élève uniquement
export const ELEVE_SUBJECT_CONFIG: Record<Subject, SubjectMeta> = {
  /* déplacer le contenu actuel de SUBJECT_CONFIG dans utils.ts */
}
export const ELEVE_SUBJECTS = Object.keys(ELEVE_SUBJECT_CONFIG) as Subject[]

// Convertit les CustomSubject d'un étudiant en SubjectMeta
export function buildEtudiantConfig(custom: CustomSubject[]): Record<string, SubjectMeta> { ... }

// Point d'entrée unique — appelé par useUserContext()
export function getSubjectConfig(
  userType: UserType,
  customSubjects?: CustomSubject[]
): Record<string, SubjectMeta> {
  return userType === 'eleve'
    ? ELEVE_SUBJECT_CONFIG
    : buildEtudiantConfig(customSubjects ?? [])
}
```

**Fichier : `src/lib/utils.ts`** — Modifier
Supprimer `SUBJECT_CONFIG` → le remplacer par un re-export depuis `subjects.ts`
pour ne pas casser les imports existants pendant la migration.

---

### 0.3 — Hook `useUserContext` — seul point d'entrée profil

**Fichier : `src/lib/useUserContext.ts`** — **Créer**

```ts
export function useUserContext() {
  const userType       = useStore((s) => s.userType)
  const learningProfile = useStore((s) => s.learningProfile)

  return useMemo(() => ({
    isEleve:      userType === 'eleve',
    isEtudiant:   userType === 'etudiant',
    subjectConfig: getSubjectConfig(userType, learningProfile.customSubjects),
    subjectList:  userType === 'eleve'
                    ? ELEVE_SUBJECTS
                    : (learningProfile.customSubjects ?? []).map((s) => s.label),
    schoolLevel:  learningProfile.schoolLevel,   // undefined pour étudiant
    studentField: learningProfile.studentField,  // undefined pour élève
    onboardingDone: learningProfile.onboardingDone ?? false,
  }), [userType, learningProfile])
}
```

**Règle de migration :** tout composant qui fait `import { SUBJECT_CONFIG } from '@/lib/utils'`
doit être migré vers `const { subjectConfig } = useUserContext()`.

Composants concernés : `NoteEditor.tsx`, `journal/page.tsx`, `NoteCard.tsx`, `MoodDashboard.tsx`, `WeeklyReport.tsx`, `KnowledgeGraph.tsx`.

---

### 0.4 — Onboarding post-inscription (seul endroit bifurqué)

**Fichier : `src/app/onboarding/page.tsx`** — **Créer**
**Fichier : `src/app/onboarding/layout.tsx`** — **Créer**
**Fichier : `src/app/onboarding/steps/EleveSteps.tsx`** — **Créer**
**Fichier : `src/app/onboarding/steps/EtudiantSteps.tsx`** — **Créer**

Flow bifurqué selon `userType` (détecté dès la session post-inscription) :

```
┌─ 🎒 EleveSteps ──────────────────────┐   ┌─ 🎓 EtudiantSteps ───────────────────┐
│                                       │   │                                      │
│  Étape 1 — Choix de classe            │   │  Étape 1 — Filière / domaine         │
│  [6ème] [5ème] [4ème] [3ème]          │   │  input texte libre + suggestions     │
│  [2nde] [1ère] [Terminale]            │   │  (Médecine, Droit, Info…)            │
│                                       │   │                                      │
│  Étape 2 — Matières à activer         │   │  Étape 2 — Créer tes matières        │
│  (grille multi-select, liste fixe)    │   │  emoji picker + label + couleur      │
│  → sauvegardé dans learningProfile    │   │  → sauvegardé dans customSubjects[]  │
│                                       │   │                                      │
│  Étape 3 — PIN optionnel              │   │  Étape 3 — PIN optionnel             │
└───────────────────────────────────────┘   └──────────────────────────────────────┘
                    ↓ redirect /journal après completion
                    ↓ onboardingDone: true sauvegardé en BDD
```

**Fichier : `src/proxy.ts`** — Modifier (c'est le fichier qui remplace `middleware.ts` sur Next.js 16+)
Ajouter la logique onboarding **après** le check d'authentification existant :

```ts
// Utilisateur authentifié mais onboarding pas encore fait
// → récupérer onboardingDone depuis le token de session
if (isAuthenticated && !req.auth?.onboardingDone && !pathname.startsWith('/onboarding')) {
  return NextResponse.redirect(new URL('/onboarding', req.url))
}
```

Et ajouter `/onboarding` dans la liste `isPublic` → `false` (route protégée, mais ne redirige pas vers `/connexion`).

---

### 0.5 — Composants adaptés via `useUserContext()`

Les fichiers suivants doivent être migrés (pas réécrits — juste le point d'import des matières) :

| Fichier | Changement |
|---|---|
| `src/components/journal/NoteEditor.tsx` | `Object.keys(SUBJECT_CONFIG)` → `useUserContext().subjectList` + bouton `+ Matière` pour étudiant |
| `src/app/journal/page.tsx` | `SUBJECTS = Object.keys(...)` → `useUserContext().subjectList` |
| `src/components/journal/NoteCard.tsx` | `SUBJECT_CONFIG[note.subject]` → `subjectConfig[note.subject]` |
| `src/components/journal/MoodDashboard.tsx` | Idem |
| `src/components/journal/WeeklyReport.tsx` | Idem |
| `src/components/graph/KnowledgeGraph.tsx` | Idem |

---

### 0.6 — API notes — validation `subject` côté serveur

**Fichier : `src/app/api/notes/route.ts`** — Modifier
**Fichier : `src/app/api/notes/[id]/route.ts`** — Modifier

Actuellement `subject: { type: String, required: true }` dans `Note.ts` — aucune validation métier.

```ts
// Dans la route POST/PUT, après avoir récupéré la session :
const user = await User.findById(session.user.id).lean()
if (user.userType === 'eleve') {
  if (!ELEVE_SUBJECTS.includes(subject)) return 400
} else {
  const validLabels = user.learningProfile.customSubjects?.map(s => s.label) ?? []
  if (!validLabels.includes(subject)) return 400
}
```

---

### 0.7 — Tuteur IA — system prompt adaptatif

**Fichier : `src/app/api/chat/route.ts`** — Modifier

```ts
const systemPrompt = user.userType === 'eleve'
  ? `Tu es Binlin, tuteur scolaire pour un élève de ${user.learningProfile.schoolLevel}
     en Côte d'Ivoire. Programme officiel ivoirien. Ton pédagogique, encourageant.`
  : `Tu es Binlin, assistant académique pour un étudiant en ${user.learningProfile.studentField}.
     Contexte universitaire. Sources académiques. Ton plus ouvert et autonomisant.`
```

---

### Récapitulatif Sprint 0

| # | Fichier | Action |
|---|---|---|
| 0.1 | `src/types/index.ts` | + `SchoolLevel`, `StudentField`, `CustomSubject`, `onboardingDone` |
| 0.1 | `src/models/User.ts` | + champs dans `LearningProfileSchema` |
| 0.2 | `src/lib/subjects.ts` | **Créer** — config matières séparée par profil |
| 0.2 | `src/lib/utils.ts` | Supprimer `SUBJECT_CONFIG`, re-export depuis `subjects.ts` |
| 0.3 | `src/lib/useUserContext.ts` | **Créer** — hook unique profil actif |
| 0.4 | `src/app/onboarding/page.tsx` | **Créer** — orchestrateur onboarding |
| 0.4 | `src/app/onboarding/layout.tsx` | **Créer** |
| 0.4 | `src/app/onboarding/steps/EleveSteps.tsx` | **Créer** — flow élève |
| 0.4 | `src/app/onboarding/steps/EtudiantSteps.tsx` | **Créer** — flow étudiant |
| 0.4 | `src/middleware.ts` | Créer/modifier — redirect onboarding si `onboardingDone === false` |
| 0.5 | `src/components/journal/NoteEditor.tsx` | Migrer vers `useUserContext()` |
| 0.5 | `src/app/journal/page.tsx` | Migrer vers `useUserContext()` |
| 0.5 | `src/components/journal/NoteCard.tsx` | Migrer vers `useUserContext()` |
| 0.5 | `src/components/journal/MoodDashboard.tsx` | Migrer vers `useUserContext()` |
| 0.5 | `src/components/journal/WeeklyReport.tsx` | Migrer vers `useUserContext()` |
| 0.5 | `src/components/graph/KnowledgeGraph.tsx` | Migrer vers `useUserContext()` |
| 0.6 | `src/app/api/notes/route.ts` | Validation `subject` selon profil |
| 0.6 | `src/app/api/notes/[id]/route.ts` | Validation `subject` selon profil |
| 0.7 | `src/app/api/chat/route.ts` | System prompt adaptatif |

---

## 🔴 Sprint 1 — Structure spatiale

### 1.1 — Layout 3 colonnes sur desktop

**Problème :** `Shell.tsx` met tout en 1 colonne sous navbar flottante.  
La référence a : sidebar gauche fixe + liste centrale + panneau détail droit.

**Structure cible :**
```
┌────────────┬──────────────────┬─────────────────────┐
│  Sidebar   │   Liste notes    │   Détail / Éditeur  │
│  ~240px    │   ~320px         │   flex-1            │
│  fixe      │   scrollable     │   inline (no modal) │
└────────────┴──────────────────┴─────────────────────┘
```

| Fichier | Action | Description |
|---|---|---|
| `src/components/layout/Shell.tsx` | Modifier | Layout conditionnel — sur `/journal`, wrapper `flex` 3 zones |
| `src/components/layout/JournalShell.tsx` | **Créer** | Wrapper spécifique à la page Journal avec sidebar + list pane + detail pane |
| `src/components/layout/Sidebar.tsx` | **Créer** | Sidebar gauche ~240px : logo, nav items (Templates, Import, Trash), section Workspaces, bouton "New Page" |
| `src/app/journal/layout.tsx` | Modifier | Utiliser `JournalShell` au lieu du `Shell` générique |

---

### 1.2 — Vue Folders visuels

**Problème :** Les matières sont des chips-filtres invisibles.  
La référence présente des **dossiers** avec icône folder, label et compteur en grille 3 colonnes.

| Fichier | Action | Description |
|---|---|---|
| `src/components/journal/FolderGrid.tsx` | **Créer** | Grille de dossiers — icône folder SVG ochre + label + compteur, cliquable comme filtre |
| `src/app/journal/page.tsx` | Modifier | Toggle "Dossiers / Notes" dans le header, afficher `<FolderGrid>` quand actif |

**Détails FolderGrid :**
- Icône folder SVG en `#F4A236` avec `drop-shadow`
- `hover:scale-[1.03] transition-transform`
- Dossiers spéciaux : "Toutes", "Épinglées", "Verrouillées", "Favoris" + une par matière

---

## 🟡 Sprint 2 — Richesse des cartes

### 2.1 — Redesign NoteCard : plus aéré, moins de metadata

**Problème :** Le footer de `NoteCard.tsx` affiche wordCount + readTime + date — trop dense.  
La référence est épurée, avec un aperçu image si disponible.

**Modifications dans `src/components/journal/NoteCard.tsx` :**
- Supprimer `wordCount` et `readTime` du footer visible (conserver en tooltip au hover)
- Titre : `text-sm` → `text-[15px] font-semibold`
- Preview : `line-clamp-3` → `line-clamp-4`
- Image preview : si `note.attachments` contient une image → thumbnail `rounded-xl` en bas de carte
- Point de sélection : dot orange `w-2 h-2 rounded-full` en top-right quand la note est active dans le panneau
- Sur les cartes grid/masonry : ajouter `whileHover={{ y: -2 }}` Framer Motion

---

### 2.2 — États vides illustrés

**Problème :** L'état vide de `journal/page.tsx` est un simple `BookOpen` icon gris dans un carré.  
La référence utilise des illustrations SVG expressives avec mascotte et objets flottants.

| Fichier | Action | Description |
|---|---|---|
| `src/components/ui/illustrations/EmptyNotes.tsx` | **Créer** | SVG inline — post-its + trombones flottants, style "No Attachments" de la référence |
| `src/components/ui/illustrations/EmptySearch.tsx` | **Créer** | SVG loupe avec point d'interrogation pour résultat de recherche vide |
| `src/app/journal/page.tsx` | Modifier | Remplacer le bloc vide par `<EmptyNotes />` avec titre `font-black text-2xl` et sous-titre muted |

**Style des illustrations :**
- Palette : ochre `#F4A236`, crème `#FDF0DC`, charcoal `#1A1A1A`
- Objets avec `transform: rotate(±15deg)` et `drop-shadow`
- Animation `@keyframes float` (translateY ±6px) dans `globals.css`

---

### 2.3 — Tags inline colorés dans l'éditeur

**Problème :** Les tags sont des chips basiques dans l'éditeur.  
La référence montre `#ideas #to-do's #morning` sous le titre, en couleur ochre.

**Modifications dans `src/components/journal/NoteEditor.tsx` :**
- Sous le champ titre : ligne de tags `#hashtag` en `text-[#F4A236] font-medium text-sm`
- Affichage dans le panneau de lecture comme pills colorées sur une seule ligne

---

## 🟠 Sprint 3 — Lecture et Recherche

### 3.1 — Panneau de lecture inline (supprimer la modale)

**Problème :** Cliquer sur une note ouvre une modale overlay (`journal/page.tsx` lignes 297–343).  
La référence affiche le contenu dans un **panneau droit permanent**, sans overlay.

| Fichier | Action | Description |
|---|---|---|
| `src/components/journal/NoteDetailPanel.tsx` | **Créer** | Panneau droit fixe — titre H1 large, tags colorés, contenu markdown rendu, checklist orange |
| `src/app/journal/page.tsx` | Modifier | Desktop : `selectedNote` → `NoteDetailPanel`. Mobile : conserver la modale actuelle |
| `src/components/layout/JournalShell.tsx` | Modifier | 3e colonne reçoit `<NoteDetailPanel note={selectedNote} />` |

**Détails NoteDetailPanel :**
- En-tête : breadcrumb matière + mood emoji + actions (partager, éditer, supprimer)
- Titre en `text-3xl font-black` avec `font-display` (Nunito)
- Tags `#hashtag` en `text-ochre font-medium` sous le titre
- Headings `H2` précédés d'un cercle orange `•`
- Checklists : checkbox circulaire `border-2 border-ochre`, `checked:bg-ochre`
- Bouton `+ Aa` en bas à droite (options de formatage)

---

### 3.2 — Écran de recherche dédié avec "Suggested"

**Problème :** La recherche est un simple input dans le header.  
La référence a un **écran complet** avec suggestions catégorisées et résultats récents.

| Fichier | Action | Description |
|---|---|---|
| `src/components/journal/SearchPanel.tsx` | **Créer** | Panneau de recherche — section "Suggested" avec 4 catégories + compteurs, section "Recently" avec thumbnails |
| `src/app/journal/page.tsx` | Modifier | Focus input → affiche `<SearchPanel>` en remplacement du panneau central |

**Contenu "Suggested" :**
```
→  Notes partagées      [n]
✓  Checklists           [n]
🔒 Notes verrouillées   [n]
📎 Pièces jointes       [n]
```

---

## 🟢 Sprint 4 — Actions & Polish final

### 4.1 — Bottom sheet Export / Share

| Fichier | Action | Description |
|---|---|---|
| `src/components/journal/ExportSheet.tsx` | **Créer** | Bottom sheet animé — 3 boutons icônes : PDF / Notes / Image, puis : "Copier", "Enregistrer", "Partager" |
| `src/components/journal/NoteDetailPanel.tsx` | Modifier | Bouton "Partager" dans le header ouvre `<ExportSheet>` |

**Animation :**
- Entrée : `translateY(100%) → translateY(0)` avec spring Framer Motion
- Backdrop `bg-black/30 backdrop-blur-sm`
- Handle : `w-12 h-1 bg-muted rounded-full mx-auto mb-4`

---

### 4.2 — PIN Lock polish

Fichier : `src/components/journal/PinLock.tsx` — ajustements mineurs :

| Élément | Actuel | Cible |
|---|---|---|
| Titre | "Déverrouiller" | "Unlock Note" en `text-[#F4A236]` |
| Icône cadenas | `w-12 h-12` | `w-16 h-16` + `size={28}` |
| Boutons numpad | `h-14 text-xl` | `h-[60px] text-2xl font-light` |
| Texte bas | EN | Supprimer ou passer en FR |

---

### 4.3 — Micro-animations & polish global

| Fichier | Amélioration |
|---|---|
| `src/components/journal/NoteCard.tsx` | `whileHover={{ y: -2 }}` sur les cartes grid/masonry |
| `src/components/layout/AppNav.tsx` | `layoutId="nav-pill"` sur l'indicateur actif → shared layout animation |
| `src/app/globals.css` | Ajouter `@keyframes float` (translateY ±6px) pour les illustrations |
| `src/components/layout/Shell.tsx` | `transition-colors duration-200` sur les changements de thème |

---

## 📋 Récapitulatif global des fichiers

### Nouveaux fichiers à créer (17)

```
── Sprint 0 — Architecture ──────────────────────────────
src/lib/subjects.ts
src/lib/useUserContext.ts
src/app/onboarding/page.tsx
src/app/onboarding/layout.tsx
src/app/onboarding/steps/EleveSteps.tsx
src/app/onboarding/steps/EtudiantSteps.tsx

── Sprint 1 — Structure ─────────────────────────────────
src/components/layout/JournalShell.tsx
src/components/layout/Sidebar.tsx
src/components/journal/FolderGrid.tsx

── Sprint 2 — Cartes ────────────────────────────────────
src/components/ui/illustrations/EmptyNotes.tsx
src/components/ui/illustrations/EmptySearch.tsx

── Sprint 3 — Lecture & Recherche ───────────────────────
src/components/journal/NoteDetailPanel.tsx
src/components/journal/SearchPanel.tsx

── Sprint 4 — Actions ───────────────────────────────────
src/components/journal/ExportSheet.tsx
```

### Fichiers existants à modifier (16)

```
── Sprint 0 ─────────────────────────────────────────────
src/types/index.ts
src/models/User.ts
src/lib/utils.ts
src/proxy.ts                               (+ redirect onboarding)
src/app/api/chat/route.ts
src/app/api/notes/route.ts
src/app/api/notes/[id]/route.ts
src/components/journal/NoteEditor.tsx      (migration useUserContext)
src/components/journal/MoodDashboard.tsx   (migration useUserContext)
src/components/journal/WeeklyReport.tsx    (migration useUserContext)
src/components/graph/KnowledgeGraph.tsx    (migration useUserContext)

── Sprints 1–4 ──────────────────────────────────────────
src/components/layout/Shell.tsx
src/app/journal/layout.tsx
src/app/journal/page.tsx
src/components/journal/NoteCard.tsx
src/components/layout/AppNav.tsx
src/app/globals.css
```

---

## 🏁 Ordre d'exécution complet

| # | Sprint | Tâche | Type |
|---|---|---|---|
| 0.1 | 🟣 Archi | Types + modèle User | Back |
| 0.2 | 🟣 Archi | `subjects.ts` + migration `utils.ts` | Back |
| 0.3 | 🟣 Archi | Hook `useUserContext` | Front |
| 0.4 | 🟣 Archi | Onboarding bifurqué + middleware | Front |
| 0.5 | 🟣 Archi | Migration composants → `useUserContext()` | Front |
| 0.6 | 🟣 Archi | Validation subject API | Back |
| 0.7 | 🟣 Archi | System prompt IA adaptatif | Back |
| 1.1 | 🔴 Structure | Layout 3 colonnes desktop | Front |
| 1.2 | 🔴 Structure | FolderGrid visuels (utilise `useUserContext`) | Front |
| 2.1 | 🟡 Cartes | NoteCard redesign + image preview | Front |
| 2.2 | 🟡 Cartes | États vides illustrés | Front |
| 2.3 | 🟡 Cartes | Tags inline colorés éditeur | Front |
| 3.1 | 🟠 Lecture | NoteDetailPanel inline (no modal) | Front |
| 3.2 | 🟠 Lecture | SearchPanel Suggested | Front |
| 4.1 | 🟢 Polish | ExportSheet bottom sheet | Front |
| 4.2 | 🟢 Polish | PIN Lock polish | Front |
| 4.3 | 🟢 Polish | Micro-animations globales | Front |

---

> **Prochaine étape :** commencer par le Sprint 0 — `subjects.ts` + `useUserContext` + onboarding.
