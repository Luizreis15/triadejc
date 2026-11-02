const PIECES = [
  "hsl(14 76% 46%)",
  "hsl(22 80% 58%)",
  "hsl(36 70% 62%)",
  "hsl(8 55% 70%)",
  "hsl(16 68% 32%)",
];

export function CelebrateBurst({ intensity }: { intensity: "card" | "module" }) {
  const count = intensity === "module" ? 28 : 12;
  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden" aria-hidden>
      {Array.from({ length: count }, (_, index) => (
        <span
          key={index}
          className="member-confetti-piece"
          style={{
            left: `${(index * 37) % 100}%`,
            background: PIECES[index % PIECES.length],
            animationDelay: `${(index % 6) * 0.04}s`,
            ["--cx" as string]: `${(index % 2 === 0 ? -1 : 1) * (12 + (index % 5) * 10)}px`,
          }}
        />
      ))}
      <p className="absolute left-1/2 top-[18%] -translate-x-1/2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-elevated">
        {intensity === "module" ? "Módulo concluído" : "Leitura concluída"}
      </p>
    </div>
  );
}
