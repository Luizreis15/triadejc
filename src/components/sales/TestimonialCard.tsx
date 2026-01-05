import { User } from "lucide-react";

interface TestimonialCardProps {
  name?: string;
  instagram?: string;
  testimonial?: string;
  hasImage?: boolean;
  className?: string;
}

export function TestimonialCard({ 
  name = "Nome do Cliente", 
  instagram = "@instagram", 
  testimonial = "Depoimento placeholder - texto de 2 a 4 linhas sobre a experiência com o produto.",
  hasImage = false,
  className = "" 
}: TestimonialCardProps) {
  return (
    <div className={`card-cream p-5 ${className}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[hsl(var(--sp-gold))] to-[hsl(var(--sp-gold)/0.7)] flex items-center justify-center">
          <User className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="font-semibold text-sm" style={{ fontFamily: 'var(--font-inter)' }}>{name}</p>
          <p className="text-xs opacity-70" style={{ fontFamily: 'var(--font-inter)' }}>{instagram}</p>
        </div>
      </div>
      <p className="text-sm leading-relaxed" style={{ fontFamily: 'var(--font-inter)', color: 'hsl(var(--sp-text-dark))' }}>
        "{testimonial}"
      </p>
      {hasImage && (
        <div className="mt-4 placeholder-img aspect-[4/5] text-xs">
          PRINT PLACEHOLDER
        </div>
      )}
    </div>
  );
}
