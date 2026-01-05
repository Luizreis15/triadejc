import { Check, X, LucideIcon } from "lucide-react";

interface IconSquareProps {
  icon?: "check" | "x" | LucideIcon;
  className?: string;
}

export function IconSquare({ icon = "check", className = "" }: IconSquareProps) {
  const renderIcon = () => {
    if (icon === "check") return <Check className="w-4 h-4" />;
    if (icon === "x") return <X className="w-4 h-4" />;
    const CustomIcon = icon as LucideIcon;
    return <CustomIcon className="w-4 h-4" />;
  };

  return (
    <div className={`icon-square ${className}`}>
      {renderIcon()}
    </div>
  );
}
