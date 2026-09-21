import { apiRequest } from '@/lib/api-client';
import type { CustomSubject, LearningProfile, UserType } from '@/types';

type ProfileResponse = {
  user?: {
    _id?: string;
    id?: string;
    userType?: UserType;
    learningProfile?: LearningProfile;
  };
};

const defaultLearningProfile: LearningProfile = {
  weakSubjects: [],
  studiedTopics: [],
  totalSessions: 0,
  onboardingDone: false,
  customSubjects: [],
};

export async function getProfile(): Promise<{
  userId: string | null;
  userType: UserType;
  learningProfile: LearningProfile;
}> {
  const response = await apiRequest('/api/user/profile');
  if (!response.ok) throw new Error(`Profile request failed: ${response.status}`);

  const data = await response.json() as ProfileResponse;
  return {
    userId: data.user?._id ?? data.user?.id ?? null,
    userType: data.user?.userType ?? 'eleve',
    learningProfile: data.user?.learningProfile ?? defaultLearningProfile,
  };
}

export async function updateUserType(userType: UserType): Promise<void> {
  const response = await apiRequest('/api/user/profile', {
    method: 'PATCH',
    body: JSON.stringify({ userType }),
  });
  if (!response.ok) throw new Error(`Profile update failed: ${response.status}`);
}

export async function updateProfile(patch: Partial<{
  userType: UserType;
  onboardingDone: boolean;
  schoolLevel: string;
  studentField: string;
  customSubjects: CustomSubject[];
}>): Promise<void> {
  const response = await apiRequest('/api/user/profile', {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
  if (!response.ok) throw new Error(`Profile update failed: ${response.status}`);
}
