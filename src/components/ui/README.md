# Composants UI

Ce dossier contient les composants d'interface transverses de BinlinPad. Ils sont classes par responsabilite afin de faciliter leur reutilisation et d'eviter de melanger les composants produit avec ceux de la landing page.

## Vue d'ensemble

| Fichier | Partie du projet | Role | Consommateurs principaux |
|---|---|---|---|
| `primitives/Badge.tsx` | Journal / produit | Etiquettes de statut et de matiere | `components/journal/NoteCard.tsx` |
| `primitives/Button.tsx` | Produit / commun | Bouton reutilisable avec variantes, tailles et chargement | Journal, reglages, editeur de notes |
| `feedback/Skeleton.tsx` | Produit / chargement | Etats de chargement par ecran | Journal, graphe, reglages, tuteur |
| `progress/StreakBadge.tsx` | Journal / tuteur | Affichage de la serie d'etude locale | Journal, tuteur |
| `feedback/Toast.tsx` | Produit / feedback | Notifications temporaires globales | `components/layout/Shell.tsx` |
| `auth/sign-in.tsx` | Authentification | Cadre visuel de la page connexion/inscription | `app/auth/connexion/page.tsx` |
| `landing/how-it-works.tsx` | Landing page | Parcours en 5 etapes anime | `app/page.tsx` |
| `landing/learning-context-bento.tsx` | Landing page | Section de positionnement par public et contexte | `app/page.tsx` |
| `landing/footer-taped-design.tsx` | Landing page | Pied de page de la page d'accueil | `app/page.tsx` |

## Organisation par domaine

### 1. Primitives reutilisables

#### `primitives/Badge.tsx`

**Domaine :** journal et affichage de metadonnees.

**Exports :**

- `Badge` : etiquette generique avec couleur de texte, fond, taille et classe additionnelle.
- `SubjectBadge` : variante specialisee affichant un emoji, un libelle et les couleurs d'une matiere.

**Props principales :**

- `Badge` : `children`, `color`, `bg`, `size` (`sm` ou `md`), `className`.
- `SubjectBadge` : `emoji`, `label`, `color`, `bg`, `className`.

**Usage :** utiliser ce composant pour les matieres, statuts et petites informations compactes. Eviter d'y placer une phrase longue ou une action principale.

#### `primitives/Button.tsx`

**Domaine :** actions produit communes.

**Export :** `Button`.

**Props principales :**

- `variant` : `primary`, `secondary`, `ghost`, `danger`, `ochre`, `dark`.
- `size` : `sm`, `md`, `lg`, `icon`.
- `loading` : desactive le bouton et affiche un indicateur de chargement.
- Toutes les props natives de `HTMLButtonElement` sont acceptees.

Le composant utilise `forwardRef`, ce qui permet de le controler depuis un formulaire ou une integration clavier. Utiliser `Button` dans les ecrans applicatifs plutot que de recreer les classes d'un bouton a chaque fois.

### 2. Chargement et feedback

#### `feedback/Skeleton.tsx`

**Domaine :** etats de chargement des pages produit.

**Exports :**

- `Skeleton` : bloc anime generique.
- `NoteCardSkeleton` : placeholder d'une note, avec option `tall`.
- `JournalSkeleton` : chargement de la grille Journal.
- `TutorSkeleton` : chargement du tuteur IA et de ses sessions.
- `GraphSkeleton` : chargement du graphe de connaissances.
- `SettingsSkeleton` : chargement de la page Reglages.

**Consommateurs :**

- `app/journal/loading.tsx`
- `app/tutor/loading.tsx`
- `app/graph/loading.tsx`
- `app/settings/loading.tsx`
- `components/journal/NoteCard.tsx`
- `components/tutor/ChatPanel.tsx`

Chaque skeleton doit garder la structure generale de l'ecran final afin de limiter les sauts de mise en page pendant le chargement.

#### `feedback/Toast.tsx`

**Domaine :** feedback global apres une action utilisateur.

**Export :** `ToastContainer`.

Le composant lit les notifications dans le store global, les anime avec Framer Motion et permet de les fermer. Les types disponibles sont `success`, `error`, `warning` et `info`.

Le conteneur est monte dans `components/layout/Shell.tsx`. Pour creer une notification, utiliser l'action `addToast` du store plutot que d'afficher un toast local.

### 3. Donnees de progression

#### `progress/StreakBadge.tsx`

**Domaine :** progression d'etude dans le Journal et le tuteur.

**Export :** `StreakBadge`.

**Props :** `className` optionnelle.

Le composant lit la serie depuis `lib/streak.ts` et le stockage local. Il ne rend rien lorsque la serie est vide. Il ne doit pas etre utilise pour une statistique distante ou une information de compte serveur.

### 4. Authentification

#### `auth/sign-in.tsx`

**Domaine :** cadre visuel de connexion et d'inscription.

**Export :** `SignInPage`.

**Props :**

- `title` : titre de la vue active.
- `description` : texte d'accompagnement.
- `children` : formulaire et controles d'authentification.

Le composant gere uniquement la mise en page et l'identite visuelle. La logique de connexion, d'inscription, OAuth et de redirection reste dans `app/auth/connexion/page.tsx`.

### 5. Landing page

Ces composants sont specifiques a la page marketing `app/page.tsx`. Ils ne doivent pas etre importes dans les pages Journal, Graphe, Reglages ou Tuteur.

#### `landing/how-it-works.tsx`

**Domaine :** section "Comment ca marche" de la landing page.

**Export par defaut :** `HowItWorks`.

Affiche les cinq etapes du parcours d'apprentissage avec cartes animees, couleurs par etape et liaison SVG sur desktop. Le composant utilise Framer Motion via `LazyMotion`.

#### `landing/learning-context-bento.tsx`

**Domaine :** section de contexte et de publics de la landing page.

**Export par defaut :** `LearningContextBento`.

Affiche les cartes destinees aux eleves, etudiants et differents parcours d'apprentissage. Les donnees des cartes sont locales au composant.

#### `landing/footer-taped-design.tsx`

**Domaine :** pied de page de la landing page.

**Export :** `FooterTapedDesign`.

Contient le logo, les liens publics, le CTA d'inscription, les informations d'assistance et les liens sociaux. Les liens de navigation applicative ne doivent pas etre ajoutes ici sans verifier leur comportement sur mobile.

## Regles de classement

- Un composant utilise par plusieurs fonctionnalites produit reste dans `components/ui`.
- Un composant specifique au Journal va dans `components/journal`.
- Un composant specifique au tuteur va dans `components/tutor`.
- Un composant de navigation ou de structure d'application va dans `components/layout`.
- Un composant exclusivement marketing reste dans `components/ui`, mais doit etre marque comme **Landing page** dans cette documentation.
- La logique metier, les appels API et l'acces au store doivent rester hors des primitives visuelles lorsque cela est possible.

## Dependances et conventions

- Style : Tailwind CSS v4 et variables `--bp-*` definies dans `app/globals.css`.
- Animations : Framer Motion uniquement pour les composants qui en ont besoin.
- Icônes : `lucide-react` pour les icônes d'interface.
- Classes conditionnelles : utiliser `cn` depuis `lib/utils.ts`.
- Accessibilite : conserver les labels accessibles, les etats `disabled` et les controles clavier lors de toute modification.
