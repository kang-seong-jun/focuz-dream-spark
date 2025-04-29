
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MainLayout } from "@/layouts/MainLayout";
import Logo from "@/components/logo/Logo";
import { motion } from "framer-motion";

export default function Welcome() {
  const navigate = useNavigate();
  
  return (
    <MainLayout withNavigation={false}>
      <div className="min-h-[calc(100vh-2rem)] flex flex-col items-center justify-center p-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <Logo size="lg" className="mx-auto" />
          
          <motion.h1 
            className="text-3xl md:text-4xl font-bold mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            당신의 잠, 퍼포먼스가 되다.
          </motion.h1>
          
          <motion.p 
            className="text-lg md:text-xl text-muted-foreground max-w-md mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            어젯밤 수면이 오늘의 당신에게 어떤 영향을 미치는지, 간단한 게임으로 확인하고 관리해보세요.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <Button 
              size="lg"
              className="mt-6 px-8 py-6 text-lg"
              onClick={() => navigate("/intro")}
            >
              시작하기
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </MainLayout>
  );
}
