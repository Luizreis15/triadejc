interface CardCreamProps {
  children: React.ReactNode;
  className?: string;
}

export function CardCream({ children, className = "" }: CardCreamProps) {
  return (
    <div className={`card-cream p-5 ${className}`}>
      {children}
    </div>
  );
}
