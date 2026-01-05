import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, ImageIcon, Check, Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type MockupType = "library" | "structure" | "tools";

interface MockupState {
  loading: boolean;
  imageUrl: string | null;
  error: string | null;
}

const MOCKUP_CONFIG: Record<MockupType, { title: string; description: string }> = {
  library: {
    title: "Biblioteca de Formatos",
    description: "Mockup da interface de biblioteca com cards de templates de carrosséis"
  },
  structure: {
    title: "Estrutura de Uso",
    description: "Mockup da interface de módulos com progresso card a card"
  },
  tools: {
    title: "Ferramentas Extras",
    description: "Mockup do caderno digital com seções de anotações e ferramentas"
  }
};

export default function MockupGenerator() {
  const [mockups, setMockups] = useState<Record<MockupType, MockupState>>({
    library: { loading: false, imageUrl: null, error: null },
    structure: { loading: false, imageUrl: null, error: null },
    tools: { loading: false, imageUrl: null, error: null }
  });

  const generateMockup = async (type: MockupType) => {
    setMockups(prev => ({
      ...prev,
      [type]: { loading: true, imageUrl: null, error: null }
    }));

    try {
      const { data, error } = await supabase.functions.invoke('generate-mockup', {
        body: { type }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setMockups(prev => ({
        ...prev,
        [type]: { loading: false, imageUrl: data.imageUrl, error: null }
      }));

      toast.success(`Mockup "${MOCKUP_CONFIG[type].title}" gerado com sucesso!`);
    } catch (error) {
      console.error('Error generating mockup:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      setMockups(prev => ({
        ...prev,
        [type]: { loading: false, imageUrl: null, error: errorMessage }
      }));

      toast.error(`Erro ao gerar mockup: ${errorMessage}`);
    }
  };

  const generateAll = async () => {
    for (const type of ['library', 'structure', 'tools'] as MockupType[]) {
      await generateMockup(type);
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copiada!");
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Gerador de Mockups</h1>
          <p className="text-muted-foreground">
            Gere mockups com IA para as seções da página de vendas
          </p>
        </div>

        <div className="mb-6 text-center">
          <Button 
            onClick={generateAll} 
            size="lg"
            disabled={Object.values(mockups).some(m => m.loading)}
          >
            {Object.values(mockups).some(m => m.loading) ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <ImageIcon className="w-4 h-4 mr-2" />
                Gerar Todos os Mockups
              </>
            )}
          </Button>
        </div>

        <div className="grid gap-6">
          {(Object.keys(MOCKUP_CONFIG) as MockupType[]).map((type) => (
            <Card key={type}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{MOCKUP_CONFIG[type].title}</span>
                  {mockups[type].imageUrl && (
                    <Check className="w-5 h-5 text-green-500" />
                  )}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {MOCKUP_CONFIG[type].description}
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Button
                    onClick={() => generateMockup(type)}
                    disabled={mockups[type].loading}
                    variant={mockups[type].imageUrl ? "outline" : "default"}
                  >
                    {mockups[type].loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Gerando...
                      </>
                    ) : mockups[type].imageUrl ? (
                      "Regenerar"
                    ) : (
                      "Gerar Mockup"
                    )}
                  </Button>

                  {mockups[type].imageUrl && (
                    <Button
                      variant="outline"
                      onClick={() => copyUrl(mockups[type].imageUrl!)}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar URL
                    </Button>
                  )}
                </div>

                {mockups[type].error && (
                  <p className="text-sm text-destructive mt-2">
                    Erro: {mockups[type].error}
                  </p>
                )}

                {mockups[type].imageUrl && (
                  <div className="mt-4">
                    <img
                      src={mockups[type].imageUrl}
                      alt={`Mockup ${MOCKUP_CONFIG[type].title}`}
                      className="w-full max-w-md rounded-lg shadow-lg border"
                    />
                    <p className="text-xs text-muted-foreground mt-2 break-all">
                      {mockups[type].imageUrl}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 p-4 bg-muted rounded-lg">
          <h3 className="font-semibold mb-2">Como usar:</h3>
          <ol className="list-decimal list-inside text-sm space-y-1 text-muted-foreground">
            <li>Clique em "Gerar Mockup" para cada seção ou "Gerar Todos"</li>
            <li>Aguarde a IA criar a imagem (pode levar alguns segundos)</li>
            <li>As imagens são salvas automaticamente no storage</li>
            <li>Copie a URL para usar na SalesPage</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
