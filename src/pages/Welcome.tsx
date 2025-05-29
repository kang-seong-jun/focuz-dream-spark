
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MainLayout } from "@/layouts/MainLayout";
import Logo from "@/components/logo/Logo";

export default function Welcome() {
  const navigate = useNavigate();
  
  return (
    <MainLayout withNavigation={false}>
      <div className="min-h-[calc(100vh-2rem)] flex flex-col items-center justify-center p-4 text-center relative">
        <div className="space-y-8 opacity-100 animate-fade-in relative z-10">
          {/* Modern logo with glow effect */}
          <div className="relative">
            <Logo size="lg" className="mx-auto animate-pulse-glow" />
            <div className="absolute inset-0 bg-gradient-to-r from-electric-blue to-neon-purple opacity-20 blur-xl rounded-full"></div>
          </div>
          
          <div className="space-y-6">
            <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-white via-neon-blue to-white bg-clip-text text-transparent leading-tight animate-bounce-subtle">
              당신의 잠,<br />
              <span className="bg-gradient-to-r from-neon-yellow to-electric-orange bg-clip-text text-transparent">
                퍼포먼스가 되다
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/90 max-w-lg mx-auto leading-relaxed font-medium">
              어젯밤 수면이 오늘의 당신에게 어떤 영향을 미치는지,
              <span className="text-neon-yellow font-bold"> 간단한 게임</span>으로 확인하고 관리해보세요.
            </p>
          </div>
          
          {/* Enhanced CTA button */}
          <div className="pt-4">
            <Button 
              size="lg"
              className="relative overflow-hidden px-12 py-6 text-xl font-bold bg-gradient-to-r from-neon-yellow to-electric-orange hover:from-electric-orange hover:to-neon-pink text-black border-0 shadow-2xl hover:shadow-neon-yellow/50 transition-all duration-500 transform hover:scale-110 rounded-2xl group"
              onClick={() => navigate("/intro")}
            >
              <span className="relative z-10">시작하기 🚀</span>
              <div className="absolute inset-0 bg-gradient-to-r from-electric-pink to-neon-purple opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </Button>
          </div>
          
          {/* Floating elements */}
          <div className="absolute -top-10 -left-10 w-20 h-20 bg-neon-pink/30 rounded-full blur-xl animate-bounce-subtle"></div>
          <div className="absolute -bottom-10 -right-10 w-16 h-16 bg-electric-cyan/30 rounded-full blur-lg animate-pulse"></div>
        </div>
      </div>
    </MainLayout>
  );
}
