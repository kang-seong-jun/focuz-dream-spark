
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MainLayout } from "@/layouts/MainLayout";
import { useAuth } from "@/context/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function More() {
  const navigate = useNavigate();
  const { user, isLoading, logout } = useAuth();

  // Redirect to login if no user
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    }
  }, [user, isLoading, navigate]);

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // If loading or no user, show loading
  if (isLoading || !user) {
    return <div>로딩 중...</div>;
  }

  return (
    <MainLayout>
      <div className="space-y-6 pb-16">
        <h1 className="text-2xl font-bold">설정</h1>
        
        <div className="space-y-6">
          {/* Profile section */}
          <Card>
            <CardHeader>
              <CardTitle>프로필 관리</CardTitle>
              <CardDescription>계정 정보를 관리합니다</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-muted-foreground">아이디</div>
                <div className="font-medium">{user.username}</div>
                
                <div className="text-muted-foreground">닉네임</div>
                <div className="font-medium">{user.nickname}</div>
                
                <div className="text-muted-foreground">가입일</div>
                <div className="font-medium">
                  {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Password section */}
          <Card>
            <CardHeader>
              <CardTitle>비밀번호 변경</CardTitle>
              <CardDescription>계정 비밀번호를 변경합니다</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                비밀번호 변경
              </Button>
            </CardContent>
          </Card>
          
          {/* Data management */}
          <Card>
            <CardHeader>
              <CardTitle>데이터 관리</CardTitle>
              <CardDescription>개인 데이터를 관리합니다</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full">
                데이터 내보내기
              </Button>
              
              <Separator />
              
              <Button variant="destructive" className="w-full">
                계정 삭제
              </Button>
            </CardContent>
          </Card>
          
          {/* Information */}
          <Card>
            <CardHeader>
              <CardTitle>정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="link" className="w-full justify-start p-0 h-auto">
                개인정보처리방침
              </Button>
              <Button variant="link" className="w-full justify-start p-0 h-auto">
                서비스 이용약관
              </Button>
              <Button variant="link" className="w-full justify-start p-0 h-auto">
                문의하기
              </Button>
            </CardContent>
          </Card>
          
          {/* Logout */}
          <Button 
            variant="outline" 
            className="w-full"
            onClick={handleLogout}
          >
            로그아웃
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
