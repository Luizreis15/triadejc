import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PenLine, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { normalizeBreaks } from "@/components/member/MarkdownPreview";

const OPEN_QUESTION = "O que esta leitura falou com você?";
const MARKER = /reflex[ãa]o\s+(escrita|para\s+a\s+jornada)|perguntas?\s+(para|de)\s+reflex|para\s+refletir|^\W*reflita\b|pr[áa]tica\s+sel[áa]/i;
// O marcador é um título curto. Frase longa que só cita "para refletir" é texto corrido.
const MARKER_MAX = 60;

/** Perguntas que o texto traz depois de "Reflexão escrita". Sem elas, sobra um campo livre. */
export function reflectionQuestions(content: string | null | undefined): string[] {
  if (!content) return [OPEN_QUESTION];
  const lines = normalizeBreaks(content).split("\n");
  const start = lines.findIndex((line) => line.trim().length <= MARKER_MAX && MARKER.test(line));
  if (start < 0) return [OPEN_QUESTION];
  const questions = lines
    .slice(start + 1)
    .map((line) => line.replace(/^[\s>*\-•\d.)]+/, "").replace(/[*_]+/g, "").trim())
    .filter((line) => line.endsWith("?"));
  return questions.length > 0 ? questions : [OPEN_QUESTION];
}

type Saved = { question: string; answer: string }[];

type Props = {
  cardId: string;
  cardTitle: string;
  moduleSlug?: string;
  content: string | null;
};

/** Campo de resposta dentro da própria leitura. Grava no Caderno, em Histórico. */
export function ReadingReflection({ cardId, cardTitle, moduleSlug, content }: Props) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const questions = reflectionQuestions(content);
  const [answers, setAnswers] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const { data: entry } = useQuery({
    queryKey: ["reading-reflection", user?.id, cardId],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notebook_entries")
        .select("id, content_md")
        .eq("user_id", user!.id)
        .eq("section", "reading_reflection")
        .eq("exercise_type", cardId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    let saved: Saved = [];
    try {
      const parsed = entry?.content_md ? JSON.parse(entry.content_md) : [];
      if (Array.isArray(parsed)) saved = parsed;
    } catch {
      saved = [];
    }
    setAnswers(questions.map((question, index) => saved.find((item) => item.question === question)?.answer ?? saved[index]?.answer ?? ""));
    // As perguntas só mudam quando a leitura muda.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry?.content_md, cardId]);

  const hasText = answers.some((answer) => answer.trim().length > 0);

  const save = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      const payload = JSON.stringify(questions.map((question, index) => ({ question, answer: answers[index] ?? "" })));
      const { error } = entry?.id
        ? await supabase
            .from("notebook_entries")
            .update({ content_md: payload, updated_at: new Date().toISOString() })
            .eq("id", entry.id)
        : await supabase.from("notebook_entries").insert({
            user_id: user.id,
            section: "reading_reflection",
            exercise_type: cardId,
            title: cardTitle,
            module_slug: moduleSlug ?? null,
            content_md: payload,
          });
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ["reading-reflection", user.id, cardId] });
      void queryClient.invalidateQueries({ queryKey: ["notebook-entries"] });
      toast({ title: "Reflexão salva ✨", description: "Ela fica guardada no seu Caderno, em Histórico." });
    } catch {
      toast({
        title: "Não foi possível salvar",
        description: "O que você escreveu continua na tela. Tente de novo em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <section id="reading-reflection" className="mb-10 space-y-4 rounded-2xl border border-border/60 bg-card p-5">
      <div className="flex items-center gap-2">
        <PenLine className="h-5 w-5 text-primary" />
        <h2 className="font-serif text-lg font-semibold text-foreground">Escreva sua reflexão</h2>
      </div>
      {questions.map((question, index) => (
        <div key={question} className="space-y-2">
          <label htmlFor={`reflection-${index}`} className="block text-sm font-medium text-foreground">
            {question}
          </label>
          <Textarea
            id={`reflection-${index}`}
            value={answers[index] ?? ""}
            onChange={(event) => {
              const next = [...answers];
              next[index] = event.target.value;
              setAnswers(next);
            }}
            placeholder="Escreva sua resposta aqui..."
            className="min-h-[100px] resize-none rounded-xl bg-background"
          />
        </div>
      ))}
      <Button variant="outline" className="h-11 w-full" onClick={() => { void save(); }} disabled={!hasText || saving}>
        <Save className="mr-2 h-4 w-4" />
        {saving ? "Salvando..." : entry?.id ? "Atualizar reflexão" : "Salvar reflexão"}
      </Button>
    </section>
  );
}
