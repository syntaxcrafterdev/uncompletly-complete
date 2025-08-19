import { Outlet } from 'react-router-dom';
import { DashboardSidebar } from '@/components/dashboard/Sidebar';
import { DashboardHeader } from '@/components/dashboard/Header';
import { useAuth } from '@/contexts/AuthContext';

export function DashboardLayout() {
  const { user } = useAuth();

  if (!user) {
    return null; // or loading state
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <DashboardSidebar user={user} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <DashboardHeader user={user} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
