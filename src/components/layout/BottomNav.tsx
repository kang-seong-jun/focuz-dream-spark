
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  PlayCircle,
  BarChart3,
  Lightbulb,
  MoreHorizontal
} from "lucide-react";
import { cn } from '@/lib/utils';

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };
  
  const navItems = [
    { 
      name: "대시보드", 
      path: "/dashboard", 
      icon: Home 
    },
    { 
      name: "체크&게임", 
      path: "/daily", 
      icon: PlayCircle
    },
    { 
      name: "히스토리", 
      path: "/history", 
      icon: BarChart3 
    },
    { 
      name: "인사이트", 
      path: "/insights", 
      icon: Lightbulb 
    },
    { 
      name: "더보기", 
      path: "/more", 
      icon: MoreHorizontal 
    }
  ];
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t h-16 md:hidden z-10">
      <div className="grid grid-cols-5 h-full">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.name}
              className={cn(
                "flex flex-col items-center justify-center space-y-1",
                active ? "text-primary" : "text-muted-foreground"
              )}
              onClick={() => navigate(item.path)}
            >
              <item.icon size={20} />
              <span className="text-xs">{item.name}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
