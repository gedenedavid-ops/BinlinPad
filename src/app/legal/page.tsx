import type { Metadata } from 'next';
import Link from 'next/link';
import { LEGAL_DOCUMENT_VERSION } from '@/lib/legal-consent';

export const metadata: Metadata = {
  title: 'Mentions légales & Politique de confidentialité',
  description: 'Conditions Générales d\'Utilisation et Politique de confidentialité de BinlinPad.',
};

const LAST_UPDATED = '27 septembre 2026';
const APP_URL = 'https://cake-alpha-seven.vercel.app';
const CONTACT_EMAIL = 'gedenedavid@gmail.com';

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#111110]">
      {/* Header */}
      <div className="border-b border-[#E8E4DF] dark:border-[#2E2C28] bg-white dark:bg-[#1C1B19]">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-[#F4A236] font-bold text-lg">
            📚 BinlinPad
          </Link>
          <span className="text-xs text-[#9B9590]">Dernière mise à jour : {LAST_UPDATED}</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12 space-y-16">

        {/* Navigation interne */}
        <div className="bg-white dark:bg-[#1C1B19] border border-[#E8E4DF] dark:border-[#2E2C28] rounded-2xl p-5">
          <p className="text-xs font-semibold text-[#9B9590] uppercase tracking-wider mb-3">Sur cette page</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {[
              ['#cgu', 'Conditions d\'utilisation'],
              ['#donnees', 'Données personnelles'],
              ['#ia', 'Utilisation de l\'IA'],
              ['#prestataires', 'Services tiers'],
              ['#droits', 'Vos droits'],
              ['#cookies', 'Cookies & Analytics'],
              ['#contact', 'Contact'],
            ].map(([href, label]) => (
              <a key={href} href={href} className="text-[#F4A236] hover:underline">
                {label}
              </a>
            ))}
          </div>
        </div>

        {/* ── CGU ─────────────────────────────────────────────────────────────── */}
        <section id="cgu" className="space-y-6">
          <h1 className="text-2xl font-bold text-[#1A1A1A] dark:text-[#F0EDE8]">
            Conditions Générales d&apos;Utilisation
          </h1>

          <Block title="1. Présentation du service">
            <p>
              BinlinPad est une application web d&apos;aide aux études destinée aux élèves du système scolaire ivoirien
              (primaire, collège, lycée) et aux étudiants du supérieur. Elle est accessible à l&apos;adresse{' '}
              <a href={APP_URL} className="text-[#F4A236] hover:underline">{APP_URL}</a>.
            </p>
            <p>
              BinlinPad est édité par David Gedene, développeur indépendant, joignable à{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#F4A236] hover:underline">{CONTACT_EMAIL}</a>.
            </p>
          </Block>

          <Block title="2. Acceptation des conditions">
            <p>
              La création d&apos;un compte est conditionnée à des confirmations séparées : acceptation des présentes
              Conditions Générales d&apos;Utilisation, reconnaissance de la Politique de Confidentialité, accord au
              traitement décrit pour les fonctions IA et confirmation d&apos;âge ou d&apos;autorisation parentale.
              L&apos;API refuse l&apos;inscription si l&apos;une de ces confirmations manque.
            </p>
            <p>
              La version acceptée et la date d&apos;acceptation sont conservées avec le compte. La déclaration
              d&apos;âge ou d&apos;autorisation est déclarative : BinlinPad ne vérifie pas l&apos;identité du parent ou tuteur.
              Si vous avez moins de 16 ans, demandez l&apos;accord de votre parent ou représentant légal avant
              l&apos;inscription. Celui-ci doit lire ces informations avec vous.
            </p>
            <p className="text-xs text-[#9B9590]">Version juridique : {LEGAL_DOCUMENT_VERSION}.</p>
          </Block>

          <Block title="3. Description du service">
            <p>BinlinPad vous permet de :</p>
            <ul>
              <li>Prendre et organiser des notes de cours par matière</li>
              <li>Réviser ses notes avec des flashcards et générer des devoirs imprimables</li>
              <li>Corriger ou compléter un texte, dicter une note et transcrire une image</li>
              <li>Interroger un tuteur IA basé sur vos propres notes</li>
              <li>Visualiser vos connaissances sous forme de graphe interactif</li>
              <li>Tenir un journal d&apos;humeur personnel et privé</li>
              <li>Demander volontairement à être mis en contact avec un conseiller</li>
            </ul>
            <p>
              Les limites actuellement appliquées par compte sont de 200 000 tokens par jour, 200 000 tokens
              par mois et trois scans OCR par jour. Ces quotas servent à limiter les abus et à maîtriser les
              coûts; la présente page doit être actualisée avant tout changement de ces limites.
            </p>
          </Block>

          <Block title="4. Compte utilisateur">
            <p>
              La création d&apos;un compte est nécessaire pour accéder au service. Vous êtes responsable
              de la confidentialité de vos identifiants. Toute activité effectuée depuis votre compte
              est sous votre responsabilité.
            </p>
            <p>
              Vous devez fournir une adresse email valide et des informations exactes. Les comptes créés
              par email conservent un hash du mot de passe, jamais le mot de passe en clair.
            </p>
            <p>
              Nous nous réservons le droit de suspendre ou supprimer un compte en cas d&apos;utilisation
              abusive, de violation des présentes conditions, ou de comportement nuisant à d&apos;autres utilisateurs.
            </p>
          </Block>

          <Block title="5. Utilisation acceptable">
            <p>Vous vous engagez à ne pas :</p>
            <ul>
              <li>Utiliser le service à des fins illégales ou frauduleuses</li>
              <li>Tenter d&apos;accéder aux données d&apos;autres utilisateurs</li>
              <li>Soumettre des contenus offensants, haineux ou portant atteinte à des tiers</li>
              <li>Automatiser des requêtes vers le service de manière abusive</li>
              <li>Contourner les mécanismes de sécurité du service</li>
            </ul>
          </Block>

          <Block title="6. Disponibilité du service">
            <p>
              BinlinPad est fourni &quot;tel quel&quot;, sans garantie de disponibilité continue.
              Des interruptions peuvent survenir pour maintenance ou en cas d&apos;incident technique.
              Exportez régulièrement les données importantes. Les réponses générées par l&apos;IA peuvent être
              incomplètes ou inexactes et doivent être vérifiées; elles ne remplacent pas un enseignant, un
              professionnel de santé ou un conseiller.
            </p>
          </Block>

          <Block title="7. Propriété intellectuelle">
            <p>
              Le code source de BinlinPad est publié sous licence MIT.
              Vos notes et contenus vous appartiennent entièrement — BinlinPad n&apos;en revendique aucun droit.
            </p>
          </Block>
        </section>

        <Divider />

        {/* ── Données personnelles ─────────────────────────────────────────────── */}
        <section id="donnees" className="space-y-6">
          <h2 className="text-2xl font-bold text-[#1A1A1A] dark:text-[#F0EDE8]">
            Politique de Confidentialité
          </h2>

          <Block title="8. Données collectées">
            <p>Lors de la création de votre compte, nous collectons :</p>
            <table>
              <thead>
                <tr><th>Donnée</th><th>Finalité</th><th>Stockage</th></tr>
              </thead>
              <tbody>
                <tr><td>Nom affiché</td><td>Identification dans l&apos;app</td><td>MongoDB Atlas</td></tr>
                <tr><td>Adresse email</td><td>Authentification</td><td>MongoDB Atlas</td></tr>
                <tr><td>Mot de passe (haché bcrypt)</td><td>Authentification</td><td>MongoDB Atlas — jamais en clair</td></tr>
                <tr><td>Avatar (si connexion Google)</td><td>Affichage profil</td><td>MongoDB Atlas</td></tr>
                <tr><td>Type de profil (élève/étudiant)</td><td>Personnalisation tuteur IA</td><td>MongoDB Atlas</td></tr>
                <tr><td>Acceptations légales</td><td>Version, date et confirmations faites à l&apos;inscription</td><td>MongoDB Atlas</td></tr>
              </tbody>
            </table>
            <p className="mt-3">Lors de l&apos;utilisation du service, nous stockons :</p>
            <table>
              <thead>
                <tr><th>Donnée</th><th>Finalité</th><th>Envoyée à des tiers ?</th></tr>
              </thead>
              <tbody>
                <tr><td>Notes, tags et pièces jointes</td><td>Organisation, indexation et fonctions de révision</td><td>Selon les flux détaillés au §9</td></tr>
                <tr><td>Humeur par note (facultative)</td><td>Suivi personnel du rythme d&apos;étude</td><td><strong>Non — jamais envoyée à l&apos;IA ou à des tiers</strong></td></tr>
                <tr><td>Historique de conversations</td><td>Continuité pédagogique</td><td>Oui — voir §9</td></tr>
                <tr><td>Journaux de quota IA</td><td>Provider, action, modèle et compteurs de tokens par période</td><td>MongoDB Atlas</td></tr>
                <tr><td>Préférences d&apos;affichage et hash PIN</td><td>Personnalisation et verrouillage local</td><td>Non — stockés dans le navigateur</td></tr>
              </tbody>
            </table>
            <p>
              Le code PIN masque une note dans l&apos;interface; il ne chiffre pas son contenu dans MongoDB.
              Dans la version actuelle, les notes protégées peuvent également être indexées par Voyage AI et
              apparaître dans les résultats de recherche sémantique. N&apos;utilisez pas le PIN comme un chiffrement
              ou comme une garantie que le contenu ne sera pas traité par les services IA.
            </p>
          </Block>

          <Block id="prestataires" title="9. Services tiers et transfert de données">
            <p>BinlinPad utilise les services tiers suivants :</p>
            <ul>
              <li>
                <strong>DeepSeek</strong> (tuteur et analyses pédagogiques) — reçoit les messages nécessaires
                au chat, les extraits de notes et d&apos;historique sélectionnés pour répondre, ainsi que le type
                de profil. Il traite aussi les actions de comparaison, complément, flashcards et devoirs.
                Le nom, l&apos;email et l&apos;humeur ne sont pas ajoutés aux prompts.
              </li>
              <li>
                <strong>Voyage AI</strong> — reçoit le titre, la matière et le contenu d&apos;une note lors de son
                enregistrement ou de sa modification afin de créer son embedding; il reçoit aussi les questions
                et échanges utilisés pour la recherche sémantique. L&apos;indexation d&apos;une note se déclenche avec
                son enregistrement, pas seulement lors d&apos;une question au tuteur.
              </li>
              <li>
                <strong>Qdrant</strong> — stocke les embeddings et les éléments nécessaires à la recherche
                sémantique, avec un identifiant utilisateur servant à isoler les résultats.
              </li>
              <li>
                <strong>Google Gemini</strong> — reçoit le texte, le titre et la matière lors d&apos;une correction,
                ou l&apos;image envoyée lors d&apos;une demande OCR. Ces requêtes sont déclenchées depuis l&apos;interface.
              </li>
              <li>
                <strong>Vercel</strong> — héberge l&apos;application et fournit des métriques d&apos;usage. Les régions
                de traitement et durées de conservation dépendent de la configuration de déploiement et des
                politiques de ces prestataires.
              </li>
              <li>
                <strong>MongoDB Atlas</strong> — base de données principale, hébergée en Europe (AWS).
              </li>
              <li>
                <strong>Google OAuth</strong> — le fournisseur est configuré côté serveur, mais l&apos;inscription
                Google n&apos;est pas actuellement proposée depuis le formulaire. Si elle est activée, Google
                transmettra les données de profil nécessaires, comme le nom, l&apos;email et l&apos;avatar.
              </li>
            </ul>
            <p>
              Le texte de vos notes peut contenir des informations personnelles : évitez d&apos;y inscrire des
              données sensibles qui ne sont pas nécessaires à vos études. Les traitements externes dépendent
              également des conditions et politiques de conservation de chaque prestataire.
            </p>
          </Block>

          <Block title="10. Durée de conservation">
            <ul>
              <li>Compte, notes, acceptations légales et journaux Krékré : conservés jusqu&apos;à la suppression du compte, sous réserve des copies de sauvegarde des prestataires.</li>
              <li>Vecteurs de l&apos;historique de chat : soumis à la purge automatique prévue, avec suppression également tentée lors de la suppression du compte.</li>
              <li>Sessions de conversation : conservées jusqu&apos;à leur suppression ou à la suppression du compte.</li>
              <li>Le contenu envoyé à un service IA peut être soumis à la politique de conservation de ce prestataire.</li>
            </ul>
          </Block>
        </section>

        <Divider />

        {/* ── IA ───────────────────────────────────────────────────────────────── */}
        <section id="ia" className="space-y-6">
          <h2 className="text-2xl font-bold text-[#1A1A1A] dark:text-[#F0EDE8]">Utilisation de l&apos;Intelligence Artificielle</h2>

          <Block title="11. Ce que l'IA voit et ne voit pas">
            <p>
              Les données transmises dépendent de la fonction : le tuteur reçoit les messages et les extraits
              pertinents; la correction reçoit le texte, le titre et la matière; l&apos;OCR reçoit l&apos;image
              sélectionnée. Les notes sont également envoyées à Voyage AI pour indexation lorsqu&apos;elles sont
              enregistrées ou modifiées.
            </p>
            <p>
              Les prompts n&apos;ajoutent pas votre nom, votre email ni votre humeur. Toutefois, le texte que vous
              écrivez peut lui-même contenir des informations personnelles. Le PIN masque une note dans
              l&apos;interface, mais n&apos;empêche pas son indexation sémantique ni son stockage côté serveur.
            </p>
          </Block>

          <Block title="12. Mémoire conversationnelle">
            <p>
              BinlinPad conserve une mémoire de vos échanges passés (question + réponse) sous forme vectorisée
              pour assurer la continuité pédagogique sur le long terme. Ces données sont stockées dans Qdrant,
              isolées par utilisateur, et purgées automatiquement après 12 mois.
            </p>
            <p>
              Vous pouvez supprimer tout ou partie de cet historique depuis l&apos;interface de chat.
            </p>
          </Block>

          <Block title="13. Journal d'humeur — données 100% privées">
            <p>
              Le journal d&apos;humeur est facultatif et sert uniquement à vous aider à observer votre
              rythme d&apos;étude dans le temps. Les humeurs sont enregistrées avec vos notes dans votre
              espace BinlinPad, mais ne sont jamais transmises à l&apos;IA ni à des services tiers.
              Le tableau de suivi est descriptif : aucune alerte, aucun scoring et aucun diagnostic
              n&apos;est effectué à partir de votre humeur.
            </p>
            <p>
              Vous pouvez choisir de ne pas renseigner d&apos;humeur, la modifier ou supprimer la note
              associée à tout moment.
            </p>
          </Block>

          <Block title="14. Bouton « Je veux en parler »">
            <p>
              Ce bouton est activé <strong>uniquement par votre action volontaire</strong>. Il enregistre
              une demande de contact (votre identifiant + date) sans aucun contenu de note, humeur ou
              texte libre. L&apos;application ne déclenche jamais ce bouton automatiquement.
            </p>
            <p>
              Numéro d&apos;écoute permanent : <strong>SOS Amitié Côte d&apos;Ivoire — 27 22 22 63</strong>
            </p>
          </Block>
        </section>

        <Divider />

        {/* ── Droits ───────────────────────────────────────────────────────────── */}
        <section id="droits" className="space-y-6">
          <h2 className="text-2xl font-bold text-[#1A1A1A] dark:text-[#F0EDE8]">Vos droits</h2>

          <Block title="15. Droits sur vos données">
            <p>Conformément aux réglementations applicables, vous disposez des droits suivants :</p>
            <ul>
              <li><strong>Droit d&apos;accès</strong> — consultez toutes vos données depuis l&apos;application</li>
              <li><strong>Droit de rectification</strong> — modifiez vos notes et profil à tout moment</li>
              <li><strong>Droit de suppression</strong> — supprimez vos notes et conversations depuis l&apos;UI</li>
              <li><strong>Droit à la portabilité</strong> — exportez vos notes en JSON depuis les Paramètres</li>
              <li><strong>Retrait du consentement</strong> — contactez l&apos;éditeur pour demander la cessation des traitements facultatifs par les services IA.</li>
              <li><strong>Suppression du compte</strong> — utilisez la commande de suppression dans les Paramètres; elle supprime le compte, les notes, les sessions, les demandes de contact et les journaux d&apos;usage, et demande la suppression des vecteurs Qdrant.</li>
            </ul>
            <p>
              Pour toute demande de suppression de compte ou d&apos;exercice de vos droits, contactez-nous à{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#F4A236] hover:underline">{CONTACT_EMAIL}</a>.
            </p>
          </Block>
        </section>

        <Divider />

        {/* ── Cookies ──────────────────────────────────────────────────────────── */}
        <section id="cookies" className="space-y-6">
          <h2 className="text-2xl font-bold text-[#1A1A1A]">Cookies & Analytics</h2>

          <Block title="16. Utilisation des cookies">
            <p>BinlinPad utilise uniquement :</p>
            <ul>
              <li>
                <strong>Cookie de session</strong> (NextAuth) — nécessaire à l&apos;authentification.
                Supprimé à la déconnexion.
              </li>
              <li>
                <strong>localStorage</strong> — stocke vos préférences d&apos;affichage localement.
                Jamais transmis à nos serveurs.
              </li>
              <li>
                <strong>Vercel Analytics</strong> — collecte des métriques de navigation anonymisées
                (pages vues, pays de connexion). Aucun identifiant persistant, aucun suivi inter-sessions.
              </li>
            </ul>
            <p>Aucun cookie publicitaire ou de tracking tiers n&apos;est utilisé.</p>
          </Block>
        </section>

        <Divider />

        {/* ── Contact ──────────────────────────────────────────────────────────── */}
        <section id="contact" className="space-y-4">
          <h2 className="text-2xl font-bold text-[#1A1A1A] dark:text-[#F0EDE8]">Contact</h2>
          <div className="bg-white dark:bg-[#1C1B19] border border-[#E8E4DF] dark:border-[#2E2C28] rounded-2xl p-6 space-y-2">
            <p className="text-sm text-[#1A1A1A] dark:text-[#F0EDE8]"><strong>Éditeur :</strong> David Gedene</p>
            <p className="text-sm text-[#1A1A1A] dark:text-[#F0EDE8]">
              <strong>Email :</strong>{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#F4A236] hover:underline">{CONTACT_EMAIL}</a>
            </p>
            <p className="text-sm text-[#1A1A1A] dark:text-[#F0EDE8]">
              <strong>Application :</strong>{' '}
              <a href={APP_URL} className="text-[#F4A236] hover:underline">{APP_URL}</a>
            </p>
            <p className="text-sm text-[#9B9590]">Dernière mise à jour : {LAST_UPDATED}</p>
          </div>
        </section>

        {/* Back */}
        <div className="text-center pb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[#9B9590] hover:text-[#1A1A1A] dark:hover:text-[#F0EDE8] transition-colors"
          >
            ← Retour à BinlinPad
          </Link>
        </div>

      </div>
    </div>
  );
}

// ─── Composants utilitaires ───────────────────────────────────────────────────

function Block({ title, children, id }: { title: string; children: React.ReactNode; id?: string }) {
  return (
    <div id={id} className="bg-white dark:bg-[#1C1B19] border border-[#E8E4DF] dark:border-[#2E2C28] rounded-2xl p-6 space-y-3">
      <h3 className="font-semibold text-[#1A1A1A] dark:text-[#F0EDE8] text-base">{title}</h3>
      <div className="text-sm text-[#57514C] dark:text-[#9B9590] leading-relaxed space-y-2 [&_ul]:list-none [&_ul]:space-y-1.5 [&_ul>li]:flex [&_ul>li]:gap-2 [&_ul>li]:before:content-['·'] [&_ul>li]:before:text-[#F4A236] [&_ul>li]:before:font-bold [&_table]:w-full [&_table]:text-xs [&_th]:text-left [&_th]:font-semibold [&_th]:text-[#9B9590] [&_th]:pb-2 [&_th]:border-b [&_th]:border-[#F5F3EF] dark:[&_th]:border-[#2E2C28] [&_td]:py-1.5 [&_td]:pr-4 [&_td]:border-b [&_td]:border-[#F5F3EF] dark:[&_td]:border-[#2E2C28] [&_td]:align-top">
        {children}
      </div>
    </div>
  );
}

function Divider() {
  return <hr className="border-[#E8E4DF] dark:border-[#2E2C28]" />;
}
