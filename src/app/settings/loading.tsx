import { Shell } from '@/components/layout/Shell';
import { SettingsSkeleton } from '@/components/ui/feedback/Skeleton';

export default function SettingsLoading() {
  return (
    <Shell>
      <SettingsSkeleton />
    </Shell>
  );
}
