import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MemberErrorStateProps {
  onRetry?: () => void;
  message?: string;
}

export function MemberErrorState({ onRetry, message }: MemberErrorStateProps) {
  return (
    <div className="text-center py-12 bg-muted/30 rounded-2xl px-6">
      <h2 className="font-serif text-lg font-semibold text-foreground">Não foi possível carregar</h2>
      <p className="text-sm text-muted-foreground mt-2">
        {message ?? "A página não respondeu agora. Tente de novo em instantes."}
      </p>
      {onRetry ? (
        <Button type="button" variant="outline" className="mt-4" onClick={onRetry}>
          Tentar de novo
        </Button>
      ) : null}
    </div>
  );
}

interface MemberEmptyStateProps {
  title: string;
  body: string;
}

export function MemberEmptyState({ title, body }: MemberEmptyStateProps) {
  return (
    <div className="text-center py-12 bg-muted/30 rounded-2xl px-6">
      <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-3" aria-hidden />
      <p className="font-serif text-lg font-semibold text-foreground">{title}</p>
      <p className="text-sm text-muted-foreground mt-2">{body}</p>
    </div>
  );
}
