import { useParams, useNavigate } from "react-router-dom";
import { ReadingSession } from "@/components/member/ReadingOverlay";

export default function ReadingView() {
  const { slug, cardId } = useParams<{ slug: string; cardId: string }>();
  const navigate = useNavigate();

  if (!cardId) return null;

  return (
    <div className="-mx-4 -my-6 flex h-[calc(100dvh-4rem)] flex-col">
      <ReadingSession
        cardId={cardId}
        moduleSlug={slug}
        onClose={() => navigate(slug ? `/membros/app/modulos/${slug}` : "/membros/app/modulos")}
      />
    </div>
  );
}
