# BinlinPad — Documentation de session

> Dernière mise à jour : 16 septembre 2026

## 1. Résumé

Cette session a porté sur quatre axes :

- refonte de la landing page et de son footer ;
- refonte de la page de connexion ;
- correction de la redirection vers les pages légales ;
- sécurisation et début de structuration de l’architecture avant production.

Le projet utilise Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, NextAuth, MongoDB/Mongoose, Zustand, Qdrant et plusieurs services IA.

## 2. Landing page

### Parcours et contenu

La landing page présente maintenant BinlinPad comme un espace d’apprentissage pour les élèves et étudiants ivoiriens.

Le parcours explique que le point de départ peut être :

- le cahier ;
- les notes déjà prises.

Les étapes du parcours sont organisées autour de cinq idées :

1. Le cahier ou les notes restent le point de départ.
2. Binlin retrouve le cours utile.
3. Les notes, les échanges et le programme ivoirien donnent le contexte.
4. Les révisions partent de la leçon personnelle : flashcards, correction, compléments et examen blanc.
5. L’espace reste organisé et privé.

### Composants ajoutés ou utilisés

- `src/components/layout/LandingNavbar.tsx` : navbar persistante avec effet verre.
- `src/components/ui/how-it-works.tsx` : section chronologique du parcours.
- `src/components/ui/learning-context-bento.tsx` : contexte élèves, étudiants et programme ivoirien.
- `src/components/ui/footer-taped-design.tsx` : footer complet inspiré du design “taped”.

### Footer

Le footer contient désormais :

- le logo et le nom BinlinPad ;
- une description qui mentionne explicitement le cahier ou les notes ;
- un bouton “Commencer gratuitement” ;
- un lien vers la connexion ;
- un lien “Comment ça marche” ;
- un lien “Confidentialité” vers `/legal` ;
- le numéro vert d’assistance psychologique et d’écoute : `139` ;
- les liens sociaux ;
- le copyright dynamique.

Le composant est placé dans `src/components/ui`, conformément à la structure shadcn/Tailwind du projet.

## 3. Page de connexion

### Nouveau shell visuel

Le composant `src/components/ui/sign-in.tsx` a été ajouté pour fournir une structure de connexion réutilisable.

La version finale est volontairement responsive et centrée :

- le panneau vidéo initialement envisagé a été supprimé ;
- la page fonctionne en une seule colonne sur mobile et desktop ;
- le formulaire existant reste responsable de l’authentification ;
- les champs email, mot de passe, inscription et sélection élève/étudiant sont conservés.

### Identité visuelle

Le bloc de marque de la connexion utilise désormais directement :

`/public/BINLINPAD.svg`

Le composant est rendu avec :

`/BINLINPAD.svg`

Le texte change selon le mode :

- connexion : “Bon retour.” ;
- inscription : “Crée ton espace.”.

Les descriptions sont également différentes selon le mode pour éviter que le message de connexion reste affiché pendant la création de compte.

### Correctif runtime

Une erreur navigateur venait de l’utilisation de `<Image>` sans import `next/image` dans `sign-in.tsx`.

Correctif appliqué :

```tsx
import Image from "next/image";
```

## 4. Redirection et pages publiques

Le proxy `src/proxy.ts` protège par défaut les routes privées.

Les routes publiques incluent maintenant :

- `/` ;
- `/auth/*` ;
- `/api/auth/*` ;
- `/legal/*`.

Cette modification évite qu’un visiteur soit redirigé vers :

`/auth/connexion?callbackUrl=%2Flegal`

lorsqu’il veut simplement consulter les mentions légales.

Le `callbackUrl` de la page de connexion est également validé :

- seuls les chemins internes commençant par `/` sont acceptés ;
- les URLs externes et les URLs commençant par `//` retombent sur `/journal`.

Cela réduit le risque de redirection ouverte après connexion.

## 5. Mesures de sécurité

### Authentification des API

Les endpoints suivants exigent maintenant une session serveur :

- `/api/chat` ;
- `/api/embed`.

L’identité utilisateur du chat est récupérée depuis `session.user.id` et n’est plus acceptée depuis le navigateur.

Les autres routes sensibles contrôlées utilisent déjà `auth()` : notes, recherche, historique, sessions, profil, compte, OCR et demande de contact.

### Validation des entrées

L’API d’inscription vérifie maintenant :

- le type des champs ;
- la présence du nom, email et mot de passe ;
- une longueur maximale du nom, email et mot de passe ;
- un format email minimal ;
- un mot de passe entre 8 et 128 caractères.

L’API chat limite également :

- le nombre de messages ;
- la longueur de chaque message ;
- la longueur de la question ;
- le nombre d’éléments de contexte ;
- les rôles autorisés (`user` et `assistant`) ;
- le type de profil (`eleve` ou `etudiant`).

L’API embed vérifie la session et limite la taille du texte envoyé.

### Cron

Le cron `/api/cron/purge-history` refuse désormais toute requête si `CRON_SECRET` est absent ou incorrect.

### Headers HTTP

`next.config.ts` ajoute ou conserve les headers suivants :

- `X-Content-Type-Options: nosniff` ;
- `X-Frame-Options: DENY` ;
- `Referrer-Policy: strict-origin-when-cross-origin` ;
- `Permissions-Policy` avec caméra limitée à la même origine ;
- `Cross-Origin-Opener-Policy: same-origin-allow-popups` ;
- `Strict-Transport-Security`.

La caméra reste autorisée pour la fonction OCR, utilisée par `NoteEditor`.

### Logs

Les logs OAuth trop détaillés ont été retirés de `src/lib/auth.ts`. Les emails et informations de connexion ne sont plus affichés dans les logs normaux.

## 6. Refactor architectural

### Problème initial

`src/store/index.ts` regroupait :

- l’état des notes ;
- les appels API notes ;
- la recherche vectorielle ;
- les sessions de chat ;
- l’orchestration IA ;
- le profil utilisateur ;
- les préférences locales ;
- les toasts et états d’interface.

Cette concentration rendait les évolutions risquées et compliquait les tests.

### Première étape réalisée

Un client réseau partagé a été ajouté :

`src/lib/api-client.ts`

Il centralise :

- `credentials: 'same-origin'` ;
- l’envoi automatique de `Content-Type: application/json` lorsqu’un body est présent ;
- l’utilisation uniforme de `fetch` côté client.

### Domaine notes

Le module suivant a été ajouté :

`src/features/notes/api.ts`

Il regroupe :

- la liste des notes ;
- la création ;
- la mise à jour ;
- la suppression ;
- la recherche sémantique ;
- l’indexation Qdrant ;
- la suppression d’un index Qdrant ;
- la conversion des réponses MongoDB en `Note` client.

Le store ne contient plus les URLs `/api/notes` et `/api/search`, ni les mappers MongoDB associés.

### Domaine profil

Le module suivant a été ajouté :

`src/features/profile/api.ts`

Il regroupe :

- la lecture du profil ;
- la normalisation de `userId`, `userType` et `learningProfile` ;
- la mise à jour du type utilisateur.

Le store conserve l’état et les transitions, mais ne connaît plus directement les URLs du profil.

### Contrat chat

`ChatRequest` a été mis à jour dans `src/types/index.ts` :

- `userId` n’est plus un champ de confiance transmis par le client ;
- `query`, `userType` et `lastSeenAt` sont explicitement documentés.

## 7. Fichiers importants modifiés

### Sécurité et backend

- `src/proxy.ts`
- `src/lib/auth.ts`
- `src/app/api/auth/inscription/route.ts`
- `src/app/api/chat/route.ts`
- `src/app/api/embed/route.ts`
- `src/app/api/cron/purge-history/route.ts`
- `next.config.ts`

### Interface

- `src/app/page.tsx`
- `src/app/auth/connexion/page.tsx`
- `src/app/legal/page.tsx`
- `src/components/ui/sign-in.tsx`
- `src/components/ui/footer-taped-design.tsx`
- `src/components/ui/how-it-works.tsx`
- `src/components/ui/learning-context-bento.tsx`
- `src/components/layout/LandingNavbar.tsx`

### Architecture

- `src/lib/api-client.ts`
- `src/features/notes/api.ts`
- `src/features/profile/api.ts`
- `src/store/index.ts`
- `src/types/index.ts`

### Assets

- `public/BINLINPAD.svg`
- `public/kimyG/BINLINP-super.svg`
- `public/kimyG/binlin-secure.svg`
- `public/logo3d.svg`

## 8. Validations réalisées

### TypeScript

Commande :

```powershell
npx tsc --noEmit
```

Résultat : OK.

### Build production

Commande :

```powershell
npm run build
```

Résultat : OK.

Le build a confirmé :

- compilation Next.js réussie ;
- TypeScript réussi ;
- collecte des données réussie ;
- génération statique de 22 pages réussie ;
- routes API et pages App Router détectées correctement.

### Lint ciblé

Les fichiers modifiés pendant le refactor ont été validés avec ESLint, notamment :

```powershell
npx eslint src/lib/api-client.ts src/features/notes/api.ts src/features/profile/api.ts src/store/index.ts
```

Résultat : aucune erreur sur cette tranche.

## 9. Points encore à traiter

Le lint global du dépôt n’est pas encore propre. Il contient des erreurs déjà présentes ou situées hors de la première tranche d’architecture, notamment dans :

- `src/app/graph/page.tsx` ;
- `src/components/journal/MoodDashboard.tsx` ;
- `src/components/journal/NoteEditor.tsx` ;
- `src/components/tutor/ChatPanel.tsx` ;
- `src/components/tutor/ExerciseTimer.tsx`.

Il reste également des warnings d’imports ou de variables inutilisés dans plusieurs fichiers.

Ces erreurs ne bloquent pas le build actuel, mais elles doivent être traitées avant d’imposer un lint vert dans la CI.

## 10. Prochaine trajectoire recommandée

1. Extraire le domaine chat dans `src/features/chat/api.ts` et `src/features/chat/service.ts`.
2. Sortir les appels Qdrant, Voyage et DeepSeek dans `src/server/integrations/`.
3. Créer un helper serveur `requireUser()` pour éviter de répéter la vérification `auth()` dans chaque route.
4. Ajouter des DTO et mappers explicites pour `Note`, `ChatSession` et `UserProfile`.
5. Ajouter des validations runtime avec Zod aux entrées des routes API.
6. Corriger les erreurs lint historiques une famille de fichiers à la fois.
7. Ajouter des tests ciblés pour :
	- redirection interne uniquement ;
	- accès anonyme refusé aux endpoints IA ;
	- isolation des notes par `userId` ;
	- suppression complète d’un compte ;
	- validation des payloads chat et inscription.

## 11. Commandes utiles

```powershell
npm run dev
npm run lint
npx tsc --noEmit
npm run build
npm audit --omit=dev
```

Avant la mise en production, vérifier les variables suivantes dans l’environnement de déploiement :

- `MONGODB_URI`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `DEEPSEEK_API_KEY`
- `VOYAGE_API_KEY`
- `QDRANT_URL`
- `QDRANT_API_KEY`
- `GEMINI_API_KEY`
- `CRON_SECRET`

Ne jamais commiter `.env.local` ou une clé réelle. Le dépôt ignore déjà les fichiers `.env*`, à l’exception de `.env.example`.

## 12. Nettoyage Knip du 16 septembre 2026

Knip a été exécuté avec :

```powershell
npx knip --reporter compact
```

Le nettoyage a permis de supprimer cinq composants sans usage détecté :

- `src/components/blocks/features-8.tsx`
- `src/components/ui/card.tsx`
- `src/components/ui/minimalist-hero.tsx`
- `src/components/ui/Modal.tsx`
- `src/components/ui/navbar-1.tsx`

Les dépendances suivantes ont également été retirées de `package.json` et du lockfile :

- `@auth/mongodb-adapter`
- `@radix-ui/react-dialog`
- `@radix-ui/react-dropdown-menu`
- `@radix-ui/react-tabs`
- `@radix-ui/react-tooltip`
- `@types/bcryptjs`
- `react-force-graph-2d`

Les exports inutilisés ont été retirés :

- `SidebarSkeleton`
- `signIn` et `signOut` depuis `src/lib/auth.ts`
- `AccentColor`
- les types API et graph inutilisés dans `src/types/index.ts`

Un résidu JSX a été détecté par TypeScript après la suppression de `SidebarSkeleton`, puis retiré immédiatement.

Résultat final Knip :

```text
Excellent, Knip found no issues.
```

## 13. Audit des dépendances après Knip

Next.js a été mis à jour de `16.3.1` vers `16.3.5`, version corrective recommandée par npm audit.

Résultat final :

```text
npm audit --omit=dev
found 0 vulnerabilities
```

La mise à niveau a été validée par TypeScript et le build de production.

## 14. Nettoyage des assets publics

Les références aux assets ont été vérifiées dans le code et le dossier `public/kimyG` a été nettoyé.

Assets conservés :

- `public/kimyG/BINLINP-super.svg` : mascotte de la section parcours ;
- `public/kimyG/binlin-secure.svg` : mascotte de la section confidentialité ;
- `public/kimyG/binlinpad-cc.mp4` : vidéo de la landing actuellement utilisée par le hero.

Assets supprimés car non référencés :

- variantes `KimyG-B-2d` et `KimyG-N-2d` ;
- variantes `kimyg-realistic-B` et `kimyg-realistic-N` ;
- `Design sans titre (2).svg` ;
- `tlchargement-ezgif.com-video-to-gif-converter.gif`.

Les icônes racine ont été conservées car elles sont utilisées par le manifeste PWA ou le layout : `favicon.svg`, `favicon-96x96.png`, `apple-touch-icon.png`, `web-app-manifest-192x192.png`, `web-app-manifest-512x512.png` et `logo3d.svg`.

## 15. Validation finale avant production

Validations finales réalisées le 16 septembre 2026 :

- `npx knip` : aucun problème ;
- `npm audit --omit=dev` : 0 vulnérabilité ;
- `npx tsc --noEmit` : OK ;
- `npm run build` avec Next.js `16.3.5` : OK ;
- 22 routes générées ;
- proxy Next.js détecté et compilé.

Le lint global contient encore des erreurs historiques dans certains écrans métier (`graph`, `MoodDashboard`, `NoteEditor`, `ChatPanel`, `ExerciseTimer`). Elles ne bloquent pas le build, mais doivent être corrigées avant d’imposer `npm run lint` comme étape bloquante de CI.
