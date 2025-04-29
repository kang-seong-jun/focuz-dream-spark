
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/layouts/MainLayout";
import { useAuth } from "@/context/AuthContext";

export default function History() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  // Redirect to login if no user
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    }
  }, [user, isLoading, navigate]);

  // If loading or no user, show loading
  if (isLoading || !user) {
    return <div>로딩 중...</div>;
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">히스토리 및 분석</h1>
        
        <div className="bg-white/95 backdrop-blur-sm rounded-lg p-6 text-center">
          <p className="text-lg">히스토리 페이지는 준비 중입니다.</p>
          <p className="text-muted-foreground mt-2">
            수면과 퍼포먼스 기록이 쌓이면 여기에서 트렌드와 인사이트를 확인할 수 있습니다.
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
