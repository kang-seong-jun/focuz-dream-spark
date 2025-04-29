
import { MainLayout } from "@/layouts/MainLayout";
import { AuthForm } from "@/components/auth/AuthForm";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Logo from "@/components/logo/Logo";

export default function Register() {
  const navigate = useNavigate();

  return (
    <MainLayout withNavigation={false}>
      <div className="min-h-[calc(100vh-2rem)] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md p-6 bg-white/95 backdrop-blur-sm rounded-lg shadow">
          <div className="text-center mb-6">
            <Logo size="md" className="mx-auto mb-6" />
            <h1 className="text-2xl font-bold">꾸준한 기록을 위한 계정 만들기</h1>
            <p className="text-muted-foreground mt-2">
              간단한 정보만으로 FOCUZ를 시작하세요
            </p>
          </div>
          
          <AuthForm isLogin={false} />
          
          <div className="mt-6 pt-6 border-t text-center">
            <p className="text-sm text-muted-foreground">
              이미 계정이 있으신가요?{" "}
              <Button 
                variant="link" 
                className="p-0" 
                onClick={() => navigate("/login")}
              >
                로그인
              </Button>
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
