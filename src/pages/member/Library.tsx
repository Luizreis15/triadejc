import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FileDown, Heart, Filter, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function Library() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedModule, setSelectedModule] = useState<string | null>(null);

  // Fetch modules
  const { data: modules = [] } = useQuery({
    queryKey: ["modules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("modules")
        .select("*")
        .order("order_index");
      if (error) throw error;
      return data;
    },
  });

  // Fetch library items
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["library-items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("library_items")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch PDFs from all modules
  const { data: pdfs = [] } = useQuery({
    queryKey: ["all-pdfs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("module_pdfs")
        .select("*, modules(title, slug)")
        .order("order_index");
      if (error) throw error;
      return data;
    },
  });

  // Fetch user favorites
  const { data: favorites = [] } = useQuery({
    queryKey: ["favorites", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("favorites")
        .select("library_item_id")
        .eq("user_id", user.id);
      if (error) throw error;
      return data.map(f => f.library_item_id);
    },
    enabled: !!user?.id,
  });

  // Toggle favorite mutation
  const toggleFavorite = useMutation({
    mutationFn: async (itemId: string) => {
      if (!user?.id) return;
      
      const isFavorited = favorites.includes(itemId);
      
      if (isFavorited) {
        await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("library_item_id", itemId);
      } else {
        await supabase
          .from("favorites")
          .insert({
            user_id: user.id,
            library_item_id: itemId,
          });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });

  // Filter PDFs by module
  const filteredPdfs = selectedModule
    ? pdfs.filter(pdf => pdf.modules?.slug === selectedModule)
    : pdfs;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-8 w-24 rounded-full" />
          ))}
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="space-y-2">
        <h1 className="font-serif text-2xl font-semibold text-foreground">
          Biblioteca
        </h1>
        <p className="text-muted-foreground">
          Materiais de apoio para sua jornada
        </p>
      </section>

      {/* Module Filter */}
      <section className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        <Button
          variant={selectedModule === null ? "default" : "outline"}
          size="sm"
          className="rounded-full shrink-0"
          onClick={() => setSelectedModule(null)}
        >
          <Filter className="w-4 h-4 mr-1" />
          Todos
        </Button>
        {modules.map((module) => (
          <Button
            key={module.id}
            variant={selectedModule === module.slug ? "default" : "outline"}
            size="sm"
            className="rounded-full shrink-0"
            onClick={() => setSelectedModule(module.slug)}
          >
            {module.title}
          </Button>
        ))}
      </section>

      {/* PDFs Section */}
      {filteredPdfs.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-serif text-lg font-semibold text-foreground flex items-center gap-2">
            <FileDown className="w-5 h-5 text-primary" />
            PDFs e Materiais
          </h2>
          <div className="space-y-2">
            {filteredPdfs.map((pdf) => (
              <a
                key={pdf.id}
                href={pdf.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border/50 hover:border-primary/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                  <FileDown className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground truncate">{pdf.title}</h3>
                  {pdf.modules && (
                    <p className="text-xs text-muted-foreground">{pdf.modules.title}</p>
                  )}
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Library Items Section */}
      {items.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-serif text-lg font-semibold text-foreground flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Conteúdos Extras
          </h2>
          <div className="space-y-2">
            {items.map((item) => {
              const isFavorited = favorites.includes(item.id);
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border/50"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground truncate">{item.title}</h3>
                    <div className="flex gap-2 mt-1">
                      <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{item.type}</span>
                      <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{item.format}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleFavorite.mutate(item.id)}
                    className={cn(
                      "p-2 rounded-full transition-colors",
                      isFavorited ? "text-red-500" : "text-muted-foreground hover:text-red-500"
                    )}
                  >
                    <Heart className={cn("w-5 h-5", isFavorited && "fill-current")} />
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Empty State */}
      {filteredPdfs.length === 0 && items.length === 0 && (
        <div className="text-center py-12 bg-muted/30 rounded-2xl">
          <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">
            A biblioteca está sendo preparada com carinho.
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Volte em breve!
          </p>
        </div>
      )}
    </div>
  );
}
