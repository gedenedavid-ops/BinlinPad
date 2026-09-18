import { Shell } from '@/components/layout/Shell';
import { TutorSkeleton } from '@/components/ui/feedback/Skeleton';

export default function TutorLoading() {
  return (
    <Shell>
      <TutorSkeleton />
    </Shell>
  );
}
