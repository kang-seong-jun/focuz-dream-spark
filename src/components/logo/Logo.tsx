
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className, size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-5xl md:text-6xl"
  };

  return (
    <div className={cn("font-black tracking-wider", sizeClasses[size], className)}>
      <span className="bg-gradient-to-r from-electric-blue to-neon-blue bg-clip-text text-transparent drop-shadow-lg">F</span>
      <span className="bg-gradient-to-r from-neon-purple to-electric-pink bg-clip-text text-transparent drop-shadow-lg">O</span>
      <span className="bg-gradient-to-r from-electric-cyan to-neon-blue bg-clip-text text-transparent drop-shadow-lg">C</span>
      <span className="bg-gradient-to-r from-neon-yellow to-electric-orange bg-clip-text text-transparent drop-shadow-lg">U</span>
      <span className="bg-gradient-to-r from-electric-pink to-neon-purple bg-clip-text text-transparent drop-shadow-lg">Z</span>
    </div>
  );
}

export default Logo;
