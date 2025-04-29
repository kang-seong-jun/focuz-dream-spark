
import { MainLayout } from "@/layouts/MainLayout";
import { AuthForm } from "@/components/auth/AuthForm";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Logo from "@/components/logo/Logo";

export default function Login() {
  const navigate = useNavigate();

  return (
    <MainLayout withNavigation={false}>
      <div className="min-h-[calc(100vh-2rem)] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md p-6 bg-white/95 backdrop-blur-sm rounded-lg shadow">
          <div className="text-center mb-6">
            <Logo size="md" className="mx-auto mb-6" />
            <h1 className="text-2xl font-bold">로그인</h1>
            <p className="text-muted-foreground mt-2">
              FOCUZ 계정으로 로그인하세요
            </p>
          </div>
          
          <AuthForm isLogin={true} />
          
          <div className="mt-6 pt-6 border-t text-center">
            <p className="text-sm text-muted-foreground">
              계정이 없으신가요?{" "}
              <Button 
                variant="link" 
                className="p-0" 
                onClick={() => navigate("/register")}
              >
                가입하기
              </Button>
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
