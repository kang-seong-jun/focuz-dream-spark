
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MainLayout } from "@/layouts/MainLayout";
import Logo from "@/components/logo/Logo";

export default function Welcome() {
  const navigate = useNavigate();
  
  return (
    <MainLayout withNavigation={false}>
      <div className="min-h-[calc(100vh-2rem)] flex flex-col items-center justify-center p-4 text-center">
        <div className="space-y-6 opacity-100 animate-fade-in">
          <Logo size="lg" className="mx-auto" />
          
          <h1 className="text-3xl md:text-4xl font-bold mt-6 opacity-100 animate-fade-in text-wellness-blue-800">
            당신의 잠, 퍼포먼스가 되다.
          </h1>
          
          <p className="text-lg md:text-xl text-wellness-blue-600 max-w-md mx-auto opacity-100 animate-fade-in">
            어젯밤 수면이 오늘의 당신에게 어떤 영향을 미치는지, 간단한 게임으로 확인하고 관리해보세요.
          </p>
          
          <div className="opacity-100 animate-fade-in">
            <Button 
              size="lg"
              className="mt-6 px-8 py-6 text-lg bg-gradient-to-r from-wellness-blue-500 to-wellness-blue-600 hover:from-wellness-blue-600 hover:to-wellness-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => navigate("/intro")}
            >
              시작하기
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
