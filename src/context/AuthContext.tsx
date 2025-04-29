
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { toast } from "@/components/ui/use-toast";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (userId: string, password: string) => Promise<boolean>;
  register: (username: string, password: string, nickname: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing user session on load
  useEffect(() => {
    const storedUser = localStorage.getItem('focuz_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user data:', error);
      }
    }
    setIsLoading(false);
  }, []);

  // Mock login function - in a real app, this would call an API
  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // This is a mock authentication - in a real app, this would be a server call
      const mockUser = localStorage.getItem('focuz_user_' + username);
      
      if (!mockUser) {
        toast({
          title: "로그인 실패",
          description: "아이디 또는 비밀번호가 일치하지 않습니다.",
          variant: "destructive",
        });
        return false;
      }
      
      const user = JSON.parse(mockUser);
      
      // Simple password check - this would be done properly on the server
      if (user.password !== password) {
        toast({
          title: "로그인 실패",
          description: "아이디 또는 비밀번호가 일치하지 않습니다.",
          variant: "destructive",
        });
        return false;
      }
      
      // Remove password before storing in state
      const { password: _, ...userWithoutPassword } = user;
      
      setUser(userWithoutPassword);
      localStorage.setItem('focuz_user', JSON.stringify(userWithoutPassword));
      
      toast({
        title: "로그인 성공",
        description: `${userWithoutPassword.nickname}님, 환영합니다!`,
      });
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "로그인 오류",
        description: "로그인 중 문제가 발생했습니다. 다시 시도해 주세요.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Mock register function
  const register = async (username: string, password: string, nickname: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Check if user already exists
      const existingUser = localStorage.getItem('focuz_user_' + username);
      if (existingUser) {
        toast({
          title: "가입 실패",
          description: "이미 사용 중인 아이디입니다.",
          variant: "destructive",
        });
        return false;
      }

      // Create new user
      const newUser = {
        id: Date.now().toString(),
        username,
        password, // In a real app, we would never store plain text passwords
        nickname,
        createdAt: new Date().toISOString()
      };

      // Save user with password for login verification
      localStorage.setItem('focuz_user_' + username, JSON.stringify(newUser));
      
      // Save user without password to current session
      const { password: _, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword);
      localStorage.setItem('focuz_user', JSON.stringify(userWithoutPassword));
      
      toast({
        title: "가입 성공",
        description: `${nickname}님, 환영합니다!`,
      });
      
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "가입 오류",
        description: "가입 중 문제가 발생했습니다. 다시 시도해 주세요.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('focuz_user');
    toast({
      title: "로그아웃 되었습니다",
    });
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('focuz_user', JSON.stringify(updatedUser));
      
      // Also update the stored user with password
      const storedUser = localStorage.getItem('focuz_user_' + user.username);
      if (storedUser) {
        const parsedStoredUser = JSON.parse(storedUser);
        const updatedStoredUser = { ...parsedStoredUser, ...userData };
        localStorage.setItem('focuz_user_' + user.username, JSON.stringify(updatedStoredUser));
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
