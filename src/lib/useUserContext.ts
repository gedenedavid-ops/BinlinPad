'use client';

import { useMemo } from 'react';
import { useStore } from '@/store';
import { getSubjectConfig, ELEVE_SUBJECTS } from '@/lib/subjects';

export function useUserContext() {
  const userType        = useStore((s) => s.userType);
  const learningProfile = useStore((s) => s.learningProfile);

  return useMemo(() => {
    const isEleve    = userType === 'eleve';
    const isEtudiant = userType === 'etudiant';

    return {
      isEleve,
      isEtudiant,
      subjectConfig: getSubjectConfig(userType, learningProfile.customSubjects),
      subjectList: isEleve
        ? ELEVE_SUBJECTS
        : (learningProfile.customSubjects ?? []).map((s) => s.label),
      schoolLevel:    learningProfile.schoolLevel,
      studentField:   learningProfile.studentField,
      customSubjects: learningProfile.customSubjects ?? [],
      onboardingDone: learningProfile.onboardingDone ?? false,
    };
  }, [userType, learningProfile]);
}
