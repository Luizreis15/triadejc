import { useQuery } from "@tanstack/react-query";
import { loadResume, resolveResume } from "@/lib/readingPlace";
import { useAuth } from "./useAuth";

export function useReadingResume() {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ["reading-resume", user?.id],
    enabled: !!user?.id,
    queryFn: () => resolveResume(user!.id),
    initialData: () => (user?.id ? loadResume(user.id) : null),
  });

  return query.data ?? null;
}
