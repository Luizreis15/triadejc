interface SectionRedProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export function SectionRed({ children, className = "", id }: SectionRedProps) {
  return (
    <section id={id} className={`section-red px-6 py-10 ${className}`}>
      {children}
    </section>
  );
}
