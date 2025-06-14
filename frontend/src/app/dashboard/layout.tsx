import type { ReactNode } from 'react';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { useAuth } from '@/contexts/AuthContext'; // Ensure this client component can be used if needed for checks

export default function DashboardLayout({ children }: { children: ReactNode }) {
  // Potentially useAuth here if conditional rendering based on auth state is needed within layout itself
  // For now, AuthProvider in RootLayout handles redirects

  return (
    <div className="flex min-h-screen w-full flex-col">
      <DashboardSidebar />
      <div className="flex flex-1 flex-col transition-all duration-300 ease-in-out data-[collapsed=true]:md:pl-16 md:pl-64"> {/* Adjust pl based on sidebar state */}
        <DashboardHeader />
        <main className="flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 bg-secondary/30">
          {children}
        </main>
         <footer className="border-t bg-background p-4 text-center text-sm text-muted-foreground">
          EduAssistant &copy; {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  );
}
