
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className, size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-4xl"
  };

  return (
    <div className={cn("font-bold", sizeClasses[size], className)}>
      <span className="text-focus-blue">F</span>
      <span className="text-focus-purple">O</span>
      <span className="text-focus-blue">C</span>
      <span className="text-focus-purple">U</span>
      <span className="text-focus-blue">Z</span>
    </div>
  );
}

export default Logo;
