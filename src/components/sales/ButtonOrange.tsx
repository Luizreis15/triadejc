import { ArrowRight } from "lucide-react";

interface ButtonOrangeProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  size?: "default" | "large";
}

export function ButtonOrange({ children, onClick, className = "", size = "default" }: ButtonOrangeProps) {
  const sizeClasses = size === "large" ? "py-5 px-10 text-base" : "py-4 px-8 text-sm";
  
  return (
    <button
      onClick={onClick}
      className={`btn-orange ${sizeClasses} ${className}`}
    >
      {children}
      <ArrowRight className="w-5 h-5" />
    </button>
  );
}
