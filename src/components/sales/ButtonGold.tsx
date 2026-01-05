import { ArrowRight } from "lucide-react";

interface ButtonGoldProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  size?: "default" | "large";
}

export function ButtonGold({ children, onClick, className = "", size = "default" }: ButtonGoldProps) {
  const sizeClasses = size === "large" ? "py-5 px-10 text-base" : "py-4 px-8 text-sm";
  
  return (
    <button
      onClick={onClick}
      className={`btn-gold ${sizeClasses} ${className}`}
    >
      {children}
      <ArrowRight className="w-5 h-5" />
    </button>
  );
}
