import { ImageIcon } from "lucide-react";

interface PlaceholderImageProps {
  label: string;
  aspectRatio?: "1:1" | "4:5" | "4:3" | "16:9";
  className?: string;
}

export function PlaceholderImage({ label, aspectRatio = "4:5", className = "" }: PlaceholderImageProps) {
  const aspectClasses = {
    "1:1": "aspect-square",
    "4:5": "aspect-[4/5]",
    "4:3": "aspect-[4/3]",
    "16:9": "aspect-video",
  };

  return (
    <div className={`placeholder-img w-full ${aspectClasses[aspectRatio]} ${className}`}>
      <div className="flex flex-col items-center gap-2">
        <ImageIcon className="w-8 h-8 opacity-50" />
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
    </div>
  );
}
