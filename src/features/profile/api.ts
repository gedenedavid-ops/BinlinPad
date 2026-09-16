import { apiRequest } from '@/lib/api-client';
import type { LearningProfile, UserType } from '@/types';

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
