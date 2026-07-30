import { AppHeader } from '@/components/layout/app-header';
import { MobileNavigation } from '@/components/layout/mobile-navigation';
import { DashboardClient } from '@/components/layout/dashboard-client';

export default function DashboardPage() {
  return (
    <>
      <AppHeader />
      <DashboardClient />
      <MobileNavigation />
    </>
  );
}