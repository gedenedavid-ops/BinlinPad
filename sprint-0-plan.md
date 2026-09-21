# Sprint 0 — Séparation Architecture Élève / Étudiant

## Vue d'ensemble

**Objectif :** Créer une séparation propre entre les profils `eleve` et `etudiant` sans dupliquer
aucune page ni aucun composant. La différence vit dans les données (BDD + store), pas dans les fichiers.

**Principe central :** un seul hook `useUserContext()` devient le point d'entrée unique pour toute
décision UI dépendant du profil. Tous les composants qui lisent `SUBJECT_CONFIG` directement
sont migrés pour passer par ce hook.

**Ce qui existe déjà (ne pas recréer) :**
- `userType: 'eleve' | 'etudiant'` dans `User.ts` et le store Zustand (`UserProfileSlice`)
- `loadUserProfile()` / `setUserType()` dans le store
- `getProfile()` / `updateUserType()` dans `src/features/profile/api.ts`
- La sélection du profil à l'inscription dans `src/app/auth/connexion/page.tsx`

**Ce qui est cassé aujourd'hui :**
- `SUBJECT_CONFIG` est hardcodé pour les élèves dans `utils.ts` — un étudiant ne peut pas créer ses propres matières
- 6 fichiers font `Object.keys(SUBJECT_CONFIG)` sans se soucier du profil
- Pas d'onboarding post-inscription (classe, matières, filière)
- `userType` absent du token JWT → `proxy.ts` ne peut pas rediriger vers l'onboarding

---

## Sous-tâches

---

### Sous-tâche 0.1 — Étendre les types TypeScript et le modèle Mongoose

**Status :** [x] done

**Intent :**
Ajouter les nouveaux champs nécessaires à la distinction des profils dans les types partagés
et dans le schéma Mongoose. C'est le fondement de tout le reste du sprint — sans ces types,
rien ne compile.

**Expected Outcomes :**
- `SchoolLevel`, `StudentField`, `CustomSubject` exportés depuis `src/types/index.ts`
- `LearningProfile` étendu avec `onboardingDone`, `schoolLevel`, `studentField`, `customSubjects`
- `LearningProfileSchema` dans `User.ts` reflète ces nouveaux champs
- TypeScript compile sans erreur

**Todo List :**
1. Dans `src/types/index.ts`, ajouter après `UserType` :
   - `SchoolLevel` = union des niveaux scolaires ('6ème' | '5ème' | '4ème' | '3ème' | '2nde' | '1ère' | 'Terminale')
   - `StudentField` = `string` (texte libre)
   - `CustomSubject` = `{ id: string; label: string; emoji: string; color: string }`
2. Dans `src/types/index.ts`, modifier `LearningProfile` pour ajouter :
   - `onboardingDone: boolean` (obligatoire, default false)
   - `schoolLevel?: SchoolLevel`
   - `studentField?: StudentField`
   - `customSubjects?: CustomSubject[]`
3. Dans `src/models/User.ts`, ajouter dans `LearningProfileSchema` :
   - `onboardingDone: { type: Boolean, default: false }`
   - `schoolLevel: { type: String }`
   - `studentField: { type: String }`
   - `customSubjects: { type: [CustomSubjectSchema], default: [] }` (nouveau sous-schéma inline)
4. Définir `CustomSubjectSchema` dans `User.ts` (avant `LearningProfileSchema`) :
   - `id: String`, `label: String`, `emoji: String`, `color: String`, `_id: false`
5. Mettre à jour le type de retour de `getProfile()` dans `src/features/profile/api.ts`
   pour inclure `onboardingDone` et `customSubjects`

**Relevant Context :**
- `src/types/index.ts` lignes 114-121 — `UserType` et `LearningProfile` actuels
- `src/models/User.ts` lignes 16-24 — `LearningProfileSchema` actuel
- `src/features/profile/api.ts` lignes 19-33 — `getProfile()` et son type de retour
- Pattern des schémas sans `_id` déjà utilisé : `{ _id: false }` dans `TagSchema` de `Note.ts`

---

### Sous-tâche 0.2 — Créer `src/lib/subjects.ts` et migrer `utils.ts`

**Status :** [x] done

**Intent :**
Extraire `SUBJECT_CONFIG` de `utils.ts` vers un fichier dédié qui connaît les deux profils.
Ce fichier devient la source de vérité unique pour les matières. `utils.ts` garde un re-export
pour ne pas casser les imports existants pendant la migration.

**Expected Outcomes :**
- `src/lib/subjects.ts` existe et exporte `ELEVE_SUBJECT_CONFIG`, `ELEVE_SUBJECTS`, `buildEtudiantConfig()`, `getSubjectConfig()`
- `utils.ts` re-exporte `SUBJECT_CONFIG` depuis `subjects.ts` (les imports existants ne cassent pas)
- `SubjectMeta` type défini et exporté (forme `{ emoji, color, bg }`)

**Todo List :**
1. Créer `src/lib/subjects.ts`
2. Définir et exporter `SubjectMeta = { emoji: string; color: string; bg: string }`
3. Déplacer le contenu de `SUBJECT_CONFIG` dans `subjects.ts` sous le nom `ELEVE_SUBJECT_CONFIG`
   (copier les 14 entrées exactes depuis `utils.ts` lignes 47-62)
4. Exporter `ELEVE_SUBJECTS = Object.keys(ELEVE_SUBJECT_CONFIG) as Subject[]`
5. Créer `buildEtudiantConfig(custom: CustomSubject[]): Record<string, SubjectMeta>` :
   - Convertit chaque `CustomSubject` en `SubjectMeta` (emoji → emoji, color → color, bg = `${color}20`)
   - Ajoute une entrée "Autre" par défaut si le tableau est vide
6. Créer `getSubjectConfig(userType: UserType, customSubjects?: CustomSubject[]): Record<string, SubjectMeta>` :
   - Si `userType === 'eleve'` → retourne `ELEVE_SUBJECT_CONFIG`
   - Sinon → retourne `buildEtudiantConfig(customSubjects ?? [])`
7. Dans `utils.ts`, remplacer la définition de `SUBJECT_CONFIG` par :
   `export { ELEVE_SUBJECT_CONFIG as SUBJECT_CONFIG } from '@/lib/subjects'`
   (les 6 fichiers qui importent `SUBJECT_CONFIG` continuent de fonctionner sans modification)

**Relevant Context :**
- `src/lib/utils.ts` lignes 47-62 — `SUBJECT_CONFIG` à déplacer
- `src/types/index.ts` — `Subject` et `CustomSubject` (créé en 0.1) à importer
- Pattern de re-export : déjà utilisé dans le projet pour `connexion/page.tsx` → `auth/connexion/page.tsx`

---

### Sous-tâche 0.3 — Créer le hook `useUserContext`

**Status :** [x] done

**Intent :**
Créer le hook qui expose un objet contexte cohérent selon le `userType` actif.
Devient le seul point d'entrée pour toute décision UI dépendant du profil.
Aucun composant ne devrait plus lire `userType` ou `SUBJECT_CONFIG` directement.

**Expected Outcomes :**
- `src/lib/useUserContext.ts` existe et est importable
- Le hook retourne `isEleve`, `isEtudiant`, `subjectConfig`, `subjectList`, `schoolLevel`, `studentField`, `onboardingDone`
- Pas de re-render inutile grâce à `useMemo` et sélecteurs Zustand stables
- TypeScript typé correctement (pas de `any`)

**Todo List :**
1. Créer `src/lib/useUserContext.ts`
2. Importer `useStore` depuis `@/store`, `useMemo` depuis React
3. Importer `getSubjectConfig`, `ELEVE_SUBJECTS` depuis `@/lib/subjects`
4. Implémenter `useUserContext()` :
   - Lire `userType` via `useStore((s) => s.userType)` (sélecteur stable)
   - Lire `learningProfile` via `useStore((s) => s.learningProfile)` (sélecteur stable)
   - Retourner un objet memoïsé avec :
     - `isEleve: userType === 'eleve'`
     - `isEtudiant: userType === 'etudiant'`
     - `subjectConfig: getSubjectConfig(userType, learningProfile.customSubjects)`
     - `subjectList: isEleve ? ELEVE_SUBJECTS : (learningProfile.customSubjects ?? []).map(s => s.label)`
     - `schoolLevel: learningProfile.schoolLevel`
     - `studentField: learningProfile.studentField`
     - `onboardingDone: learningProfile.onboardingDone ?? false`
5. Exporter le hook en export nommé

**Relevant Context :**
- `src/store/index.ts` lignes 61-68 — `UserProfileSlice` shape
- `src/store/index.ts` lignes 587-618 — pattern `useFilteredNotes` pour les sélecteurs stables avec `useMemo`
- `src/lib/subjects.ts` — créé en 0.2

---

### Sous-tâche 0.4 — Étendre le store Zustand et l'API profil

**Status :** [x] done

**Intent :**
Mettre à jour le store Zustand et les routes API pour supporter les nouveaux champs du profil :
`onboardingDone`, `customSubjects`, `schoolLevel`, `studentField`.
L'onboarding aura besoin d'une action pour sauvegarder ces données.

**Expected Outcomes :**
- `updateProfile()` dans `src/features/profile/api.ts` accepte les nouveaux champs
- `PATCH /api/user/profile` supporte `onboardingDone`, `schoolLevel`, `studentField`, `customSubjects`
- Le store expose une action `completeOnboarding(data)` qui sauvegarde et met à jour l'état local
- `loadUserProfile()` charge les nouveaux champs depuis l'API
- Le store initialise `learningProfile` avec `onboardingDone: false`

**Todo List :**
1. Dans `src/app/api/user/profile/route.ts`, dans le handler `PATCH`, ajouter le support de :
   - `onboardingDone` → `learningProfile.onboardingDone`
   - `schoolLevel` → `learningProfile.schoolLevel`
   - `studentField` → `learningProfile.studentField`
   - `customSubjects` → `learningProfile.customSubjects` (remplace tout le tableau)
2. Dans `src/features/profile/api.ts`, créer/étendre une fonction `updateProfile(patch)` :
   - Accepte `Partial<{ userType, onboardingDone, schoolLevel, studentField, customSubjects }>`
   - Fait un PATCH vers `/api/user/profile`
3. Dans `src/store/index.ts`, dans `UserProfileSlice` :
   - Ajouter l'action `completeOnboarding(data: OnboardingData): Promise<void>`
   - `OnboardingData` = `{ schoolLevel?: SchoolLevel; studentField?: StudentField; customSubjects?: CustomSubject[]; activeSubjects?: string[] }`
   - L'action fait : `set(state => merge learningProfile avec data + onboardingDone: true)` puis appelle `updateProfile()`
4. Mettre à jour `DEFAULT_PREFS` et le state initial de `UserProfileSlice` si `onboardingDone` n'est pas dans les prefs mais dans `learningProfile`
5. Dans `loadUserProfile()`, vérifier que `onboardingDone` est bien chargé depuis l'API

**Relevant Context :**
- `src/app/api/user/profile/route.ts` — handler PATCH existant lignes 25-60
- `src/features/profile/api.ts` — `updateUserType()` lignes 35-41 (pattern à suivre)
- `src/store/index.ts` lignes 516-535 — `loadUserProfile` et `setUserType` actuels

---

### Sous-tâche 0.5 — Créer l'onboarding post-inscription

**Status :** [x] done

**Intent :**
Créer le flow d'onboarding bifurqué. C'est le seul endroit dans l'app où les deux profils
ont des composants séparés (`EleveSteps` et `EtudiantSteps`), parce que le flow est
fondamentalement différent. Tout le reste de l'app utilise le même code adapté via `useUserContext()`.

**Expected Outcomes :**
- Route `/onboarding` existe et est accessible uniquement aux utilisateurs authentifiés
- Un élève voit : choix de classe (step 1) → matières à activer (step 2) → bouton "Commencer"
- Un étudiant voit : filière (step 1) → créer ses matières (step 2) → bouton "Commencer"
- 2 steps maximum, pas de step PIN (le PIN reste dans les Settings)
- À la fin, `onboardingDone: true` est sauvegardé en BDD et dans le store
- Redirect automatique vers `/journal` après completion

**Todo List :**
1. Créer `src/app/onboarding/layout.tsx` :
   - Layout minimaliste sans AppNav (plein écran, centré)
   - Fond crème `#FAF8F5`, logo BinlinPad en haut
   - Barre de progression en haut : 2 étapes visuelles (dots ou segments)
2. Créer `src/app/onboarding/steps/EleveSteps.tsx` :
   - Step 1 : grille de boutons pour choisir la classe (7 niveaux de `SchoolLevel`)
     - Sélection unique, bouton actif en `bg-[#FDF0DC] border-[#F4A236]`
   - Step 2 : grille multi-select des matières de `ELEVE_SUBJECTS` (emoji + label)
     - Toutes cochées par défaut, l'élève peut en décocher
     - Minimum 1 matière requise
   - Bouton "Suivant" entre step 1 et 2, "Commencer 🎉" sur step 2
   - Props : `onComplete(data: { schoolLevel: SchoolLevel; activeSubjects: string[] })`
3. Créer `src/app/onboarding/steps/EtudiantSteps.tsx` :
   - Step 1 : champ texte libre "Ta filière" avec chips de suggestions (Médecine, Droit, Informatique, Économie, Sciences…)
     - Cliquer une suggestion remplit le champ
   - Step 2 : création de matières — liste d'items, chaque item : emoji picker + input label + color picker (6 couleurs prédéfinies ochre/bleu/vert/violet/rouge/gris)
     - Bouton "+ Ajouter une matière"
     - Bouton supprimer par item
     - Minimum 1 matière requise
   - Bouton "Suivant" entre step 1 et 2, "Commencer 🎉" sur step 2
   - Props : `onComplete(data: { studentField: string; customSubjects: CustomSubject[] })`
4. Créer `src/app/onboarding/page.tsx` :
   - Lit `userType` depuis le store via `useUserContext()`
   - Si `isEleve` → rend `<EleveSteps onComplete={handleComplete} />`
   - Si `isEtudiant` → rend `<EtudiantSteps onComplete={handleComplete} />`
   - `handleComplete` appelle `completeOnboarding(data)` du store puis `router.replace('/journal')`
   - Loading state (spinner + texte "Préparation de ton espace…") pendant la sauvegarde

**Relevant Context :**
- `src/app/auth/connexion/page.tsx` lignes 185-210 — sélecteur profil existant (pattern boutons à réutiliser)
- `src/components/ui/primitives/Button.tsx` — composant Button à utiliser
- `src/store/index.ts` — `completeOnboarding()` créée en 0.4
- PIN supprimé de l'onboarding — reste accessible dans Settings → Confidentialité

---

### Sous-tâche 0.6 — Adapter `auth.ts` et `proxy.ts` pour rediriger vers l'onboarding

**Status :** [x] done

**Intent :**
Faire en sorte qu'un utilisateur authentifié mais dont `onboardingDone === false` soit
automatiquement redirigé vers `/onboarding`.

**Stratégie choisie — re-fetch BDD à chaque appel du callback `jwt` :**
Le callback `jwt` de NextAuth v5 est invoqué à chaque requête passant par `proxy.ts`.
On fait un hit MongoDB ciblé (`select('learningProfile.onboardingDone')`) pour lire la
valeur fraîche. Avantages : zéro risque de token périmé, fonctionne immédiatement après
`completeOnboarding()` sans re-login ni `update()`, pas de dépendance aux edge cases du
Edge Runtime. Inconvénient mineur : une requête BDD par navigation — acceptable car
Mongoose pool la connexion et la projection est minimale (un seul champ boolean).

**Expected Outcomes :**
- `token.onboardingDone` est toujours frais (relu depuis MongoDB à chaque appel JWT)
- `proxy.ts` redirige vers `/onboarding` si `!req.auth?.user?.onboardingDone` et route hors liste blanche
- Dès que `completeOnboarding()` écrit `onboardingDone: true` en BDD, la prochaine navigation sort automatiquement du redirect
- `/onboarding` est inaccessible aux non-authentifiés (redirect → `/connexion`)
- Pas de boucle infinie de redirects

**Todo List :**
1. Dans `src/lib/auth.ts`, dans le callback `jwt`, après le bloc `if (user?.id)` existant :
   - Si `token.id` est présent, faire :
     `const dbUser = await User.findById(token.id).select('learningProfile.onboardingDone').lean()`
   - Stocker `token.onboardingDone = dbUser?.learningProfile?.onboardingDone ?? false`
   - Entourer d'un `try/catch` silencieux — si BDD indisponible, `false` par défaut (non bloquant)
2. Dans `src/lib/auth.ts`, dans le callback `session` :
   - Ajouter `session.user.onboardingDone = token.onboardingDone as boolean ?? false`
3. Dans `src/types/next-auth.d.ts`, étendre les deux modules :
   - Dans `interface Session { user }` : ajouter `onboardingDone: boolean`
   - Ajouter `declare module 'next-auth/jwt' { interface JWT { onboardingDone?: boolean } }`
4. Dans `src/proxy.ts`, définir une liste blanche `onboardingExempt` :
   - Exemptes : `/onboarding`, toute route `/api/`, `/auth/`, `/connexion`, `/legal`, `/`
5. Dans `src/proxy.ts`, après le check "authentifié → ne pas accéder à /connexion", ajouter :
   ```ts
   if (isAuthenticated && !req.auth?.user?.onboardingDone && !onboardingExempt) {
     return NextResponse.redirect(new URL('/onboarding', req.url))
   }
   ```

**Relevant Context :**
- `src/lib/auth.ts` lignes 94-116 — callbacks `jwt` et `session` existants
- `src/proxy.ts` lignes 6-33 — logique de redirect existante
- `src/types/next-auth.d.ts` lignes 1-12 — pattern d'extension à suivre
- `src/models/User.ts` — `learningProfile.onboardingDone` ajouté en 0.1

---

### Sous-tâche 0.7 — Migrer les composants vers `useUserContext()`

**Status :** [x] done

**Intent :**
Remplacer tous les imports directs de `SUBJECT_CONFIG` depuis `utils.ts` par le hook
`useUserContext()`. Après cette migration, les composants servent automatiquement les deux
profils sans duplication.

**Expected Outcomes :**
- 6 fichiers migrés : `NoteEditor.tsx`, `journal/page.tsx`, `NoteCard.tsx`, `MoodDashboard.tsx`, `WeeklyReport.tsx`, `KnowledgeGraph.tsx`
- Dans `NoteEditor.tsx`, l'étudiant voit ses `customSubjects` à la place des matières prédéfinies + bouton "+ Nouvelle matière"
- Dans `journal/page.tsx`, les chips de filtre affichent les matières du profil actif
- Les autres composants (`MoodDashboard`, `WeeklyReport`, `KnowledgeGraph`) accèdent à `subjectConfig` sans casser
- TypeScript compile sans erreur (le type de `subjectConfig` est `Record<string, SubjectMeta>` au lieu de `Record<Subject, ...>`)

**Todo List :**
1. `src/components/journal/NoteEditor.tsx` :
   - Remplacer `import { SUBJECT_CONFIG }` par `import { useUserContext } from '@/lib/useUserContext'`
   - Remplacer `const SUBJECTS = Object.keys(SUBJECT_CONFIG) as Subject[]` par `const { subjectConfig, subjectList, isEtudiant } = useUserContext()`
   - Remplacer `SUBJECT_CONFIG[subject]` par `subjectConfig[subject]`
   - Remplacer `SUBJECTS.map(...)` par `subjectList.map(...)`
   - Pour l'étudiant : ajouter un bouton "+ Nouvelle matière" en bas de la liste déroulante (ouvre un mini-modal ou navigue vers Settings)
2. `src/app/journal/page.tsx` :
   - Même migration : `SUBJECTS` → `useUserContext().subjectList`
   - `SUBJECT_CONFIG[s]` → `subjectConfig[s]`
3. `src/components/journal/NoteCard.tsx` :
   - Importer `useUserContext`, remplacer `SUBJECT_CONFIG[note.subject]` par `subjectConfig[note.subject]`
   - Le composant est déjà importé avec `SubjectBadge` — adapter en conséquence
4. `src/components/journal/MoodDashboard.tsx` :
   - Vérifier si `SUBJECT_CONFIG` est utilisé ; si oui, migrer
5. `src/components/journal/WeeklyReport.tsx` :
   - Ligne 101 : `SUBJECT_CONFIG[report.topSubject[0] as Subject]?.emoji` → `subjectConfig[report.topSubject[0]]?.emoji`
6. `src/components/graph/KnowledgeGraph.tsx` :
   - Lignes 54, 72 : remplacer le cast `as Subject` par un accès direct à `subjectConfig` depuis `useUserContext()`

**Relevant Context :**
- `src/components/journal/NoteEditor.tsx` lignes 23, 298, 304-316 — usages identifiés
- `src/app/journal/page.tsx` lignes 23-24, 145-158 — usages identifiés
- `src/components/journal/WeeklyReport.tsx` ligne 101 — usage identifié
- `src/components/graph/KnowledgeGraph.tsx` lignes 54, 72 — usages identifiés
- `src/lib/useUserContext.ts` — créé en 0.3

---

### Sous-tâche 0.8 — Adapter le system prompt IA selon le profil

**Status :** [x] done

**Intent :**
Faire en sorte que le tuteur IA adapte son ton et son contexte selon le profil de l'utilisateur.
Un élève reçoit un contexte scolaire ivoirien ancré dans son niveau de classe.
Un étudiant reçoit un contexte universitaire plus ouvert.

**Expected Outcomes :**
- `POST /api/chat` construit deux system prompts distincts selon `userType`
- Le prompt élève inclut `schoolLevel` si disponible
- Le prompt étudiant inclut `studentField` si disponible
- Les notes de l'utilisateur sont toujours injectées dans le contexte (comportement inchangé)

**Todo List :**
1. Dans `src/app/api/chat/route.ts`, récupérer le profil complet de l'utilisateur :
   - `const user = await User.findById(session.user.id).select('userType learningProfile').lean()`
2. Construire le system prompt de façon conditionnelle :
   - `eleve` : ton pédagogique, programme ivoirien, niveau `schoolLevel` (ex: "élève de Terminale")
   - `etudiant` : ton universitaire, domaine `studentField` (ex: "étudiant en Médecine"), sources académiques
3. S'assurer que le context RAG (notes de l'utilisateur) est toujours injecté indépendamment du profil

**Relevant Context :**
- `src/app/api/chat/route.ts` — system prompt actuel à identifier et modifier
- `src/models/User.ts` — `userType` et `learningProfile` dans le schéma

---

### Sous-tâche 0.9 — Validation subject côté API notes

**Status :** [x] done

**Intent :**
Empêcher qu'un élève crée une note avec une matière invalide (ex: une matière libre inventée),
et qu'un étudiant utilise une matière du curriculum ivoirien s'il ne l'a pas dans ses `customSubjects`.
Validation légère côté serveur — ne bloque pas si `customSubjects` est vide (cas onboarding incomplet).

**Expected Outcomes :**
- `POST /api/notes` et `PUT /api/notes/[id]` valident `subject` selon `userType`
- Un élève ne peut pas créer de note avec une matière hors de `ELEVE_SUBJECTS`
- Un étudiant peut utiliser n'importe quelle string tant qu'elle est dans ses `customSubjects` (ou "Autre")
- Réponse `400` avec message clair en cas de subject invalide

**Todo List :**
1. Dans `src/app/api/notes/route.ts` (POST), après validation du titre :
   - Récupérer `userType` et `customSubjects` depuis le user en BDD
   - Si `eleve` : vérifier que `subject` est dans `ELEVE_SUBJECTS` (importer depuis `@/lib/subjects`)
   - Si `etudiant` : vérifier que `subject` est dans `customSubjects[].label` ou égal à "Autre"
   - Si invalide → `return NextResponse.json({ error: 'Matière invalide' }, { status: 400 })`
2. Même logique dans `src/app/api/notes/[id]/route.ts` (PUT), si le body contient `subject`
3. Ne pas bloquer si `customSubjects` est vide (onboarding pas encore fait) → accepter "Autre" comme fallback

**Relevant Context :**
- `src/app/api/notes/route.ts` — handler POST lignes 24-62
- `src/app/api/notes/[id]/route.ts` — handler PUT
- `src/lib/subjects.ts` — `ELEVE_SUBJECTS` créé en 0.2

---

## Ordre d'exécution des sous-tâches

```
0.1 (Types + Mongoose)
  └─► 0.2 (subjects.ts)
        └─► 0.3 (useUserContext hook)
              └─► 0.4 (store + API profile)
                    └─► 0.5 (onboarding UI)
                          └─► 0.6 (proxy.ts redirect)
0.3 ──────────────────────────────────────► 0.7 (migration composants)
0.2 ──────────────────────────────────────► 0.8 (system prompt IA)
0.2 ──────────────────────────────────────► 0.9 (validation API notes)
```

0.7, 0.8, 0.9 peuvent être traités en parallèle une fois 0.1–0.3 terminées.

---

## Fichiers créés par ce sprint

```
src/lib/subjects.ts
src/lib/useUserContext.ts
src/app/onboarding/layout.tsx
src/app/onboarding/page.tsx
src/app/onboarding/steps/EleveSteps.tsx
src/app/onboarding/steps/EtudiantSteps.tsx
```

## Fichiers modifiés par ce sprint

```
src/types/index.ts
src/models/User.ts
src/lib/utils.ts
src/features/profile/api.ts
src/app/api/user/profile/route.ts
src/app/api/chat/route.ts
src/app/api/notes/route.ts
src/app/api/notes/[id]/route.ts
src/lib/auth.ts
src/types/next-auth.d.ts
src/proxy.ts
src/store/index.ts
src/components/journal/NoteEditor.tsx
src/app/journal/page.tsx
src/components/journal/NoteCard.tsx
src/components/journal/MoodDashboard.tsx
src/components/journal/WeeklyReport.tsx
src/components/graph/KnowledgeGraph.tsx
```
