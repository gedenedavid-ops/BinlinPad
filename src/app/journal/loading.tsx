import { Shell } from '@/components/layout/Shell';
import { JournalSkeleton } from '@/components/ui/feedback/Skeleton';

export default function JournalLoading() {
  return (
    <Shell>
      <JournalSkeleton />
    </Shell>
  );
}
