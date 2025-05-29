
import { ReactNode } from 'react';
import { TopNav } from "@/components/layout/TopNav";
import { BottomNav } from "@/components/layout/BottomNav";

interface MainLayoutProps {
  children: ReactNode;
  withNavigation?: boolean;
}

export function MainLayout({ children, withNavigation = true }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-wellness-yellow-50 via-white to-wellness-blue-50">
      {withNavigation && <TopNav />}
      
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6 pb-20 md:pb-6">
        {children}
      </main>
      
      {withNavigation && <BottomNav />}
    </div>
  );
}
