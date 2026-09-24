'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2, AlertCircle } from 'lucide-react';
import { useUserContext } from '@/lib/useUserContext';
import { useStore } from '@/store';
import { EleveSteps } from './steps/EleveSteps';
import { EtudiantSteps } from './steps/EtudiantSteps';
import type { SchoolLevel, CustomSubject } from '@/types';

type EleveData    = { schoolLevel: SchoolLevel };
type EtudiantData = { studentField: string; customSubjects: CustomSubject[] };

export default function OnboardingPage() {
  const router = useRouter();
  const { update: updateSession } = useSession();
  const { isEleve } = useUserContext();
  const profileLoaded = useStore((s) => s.profileLoaded);
  const loadUserProfile = useStore((s) => s.loadUserProfile);
  const completeOnboarding = useStore((s) => s.completeOnboarding);
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState<string | null>(null);

  useEffect(() => {
    if (!profileLoaded) void loadUserProfile();
  }, [loadUserProfile, profileLoaded]);

  async function handleComplete(data: EleveData | EtudiantData) {
    setSaving(true);
    setError(null);
    try {
      await completeOnboarding(data);
      await updateSession({ onboardingDone: true });
      router.replace('/journal');
    } catch {
      setSaving(false);
      setError('Une erreur est survenue. Vérifie ta connexion et réessaie.');
    }
  }

  if (saving || !profileLoaded) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-[#F4A236]" />
        <p className="text-[#9B9590] text-sm font-medium">
          {saving ? 'Préparation de ton espace…' : 'Chargement de ton profil…'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {error && (
        <div className="mx-auto mt-4 max-w-sm flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          <AlertCircle size={16} className="flex-shrink-0" />
          {error}
        </div>
      )}
      {isEleve
        ? <EleveSteps    onComplete={(d) => handleComplete(d)} />
        : <EtudiantSteps onComplete={(d) => handleComplete(d)} />}
    </div>
  );
}

