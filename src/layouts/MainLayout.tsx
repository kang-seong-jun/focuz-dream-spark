
import { ReactNode } from 'react';
import { TopNav } from "@/components/layout/TopNav";
import { BottomNav } from "@/components/layout/BottomNav";

interface MainLayoutProps {
  children: ReactNode;
  withNavigation?: boolean;
}

export function MainLayout({ children, withNavigation = true }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-electric-blue via-neon-purple to-electric-pink relative overflow-hidden">
      {/* Modern geometric background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-neon-yellow rounded-full blur-xl"></div>
        <div className="absolute top-1/3 right-20 w-24 h-24 bg-electric-cyan rounded-full blur-lg"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-neon-pink rounded-full blur-2xl"></div>
        <div className="absolute bottom-1/3 right-1/3 w-28 h-28 bg-neon-green rounded-full blur-xl"></div>
      </div>
      
      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 backdrop-blur-[2px] bg-white/5"></div>
      
      {withNavigation && <TopNav />}
      
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6 pb-20 md:pb-6 relative z-10">
        {children}
      </main>
      
      {withNavigation && <BottomNav />}
    </div>
  );
}
