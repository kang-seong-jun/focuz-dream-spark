
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import Logo from "@/components/logo/Logo";
import { useAuth } from "@/context/AuthContext";

export function TopNav() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <header className="hidden md:flex items-center justify-between p-4 border-b bg-white/95 backdrop-blur-sm">
      <div className="flex items-center">
        <Logo size="md" />
      </div>
      
      <nav className="flex-1 flex justify-center">
        <ul className="flex space-x-8">
          <li>
            <Button 
              variant="link" 
              className="text-foreground hover:text-primary"
              onClick={() => navigate('/dashboard')}
            >
              대시보드
            </Button>
          </li>
          <li>
            <Button 
              variant="link" 
              className="text-foreground hover:text-primary"
              onClick={() => navigate('/daily')}
            >
              체크&게임
            </Button>
          </li>
          <li>
            <Button 
              variant="link" 
              className="text-foreground hover:text-primary"
              onClick={() => navigate('/history')}
            >
              히스토리
            </Button>
          </li>
          <li>
            <Button 
              variant="link" 
              className="text-foreground hover:text-primary"
              onClick={() => navigate('/insights')}
            >
              인사이트
            </Button>
          </li>
        </ul>
      </nav>
      
      <div className="flex items-center space-x-4">
        {user ? (
          <>
            <span className="text-sm font-medium">{user.nickname}</span>
            <Button
              variant="outline" 
              size="sm"
              onClick={() => navigate('/more')}
            >
              설정
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                logout();
                navigate('/');
              }}
            >
              로그아웃
            </Button>
          </>
        ) : (
          <>
            <Button 
              variant="outline"
              onClick={() => navigate('/login')}
            >
              로그인
            </Button>
            <Button 
              onClick={() => navigate('/register')}
            >
              가입하기
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
