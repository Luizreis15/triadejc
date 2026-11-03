import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type ConnectionState = {
  enabled: boolean;
  base_url: string;
  instance_name: string;
  phone_e164: string;
  token_configured: boolean;
  last_status: string | null;
};

type MessageRow = {
  id: string;
  phone: string;
  name: string;
  status: string;
  attempts: number;
  last_error: string | null;
  created_at: string;
  sent_at: string | null;
};

type WhatsAppState = {
  connection: ConnectionState;
  template: string;
  messages: MessageRow[];
};

const STATUS_LABEL: Record<string, string> = {
  queued: "Na fila",
  sent: "Enviada",
  failed: "Falhou",
  skipped: "Não enviada",
};

async function callWhatsApp(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke("whatsapp-admin", { body });
  if (error) throw error;
  if (data && typeof data === "object" && "error" in data && data.error) {
    throw new Error(String(data.error));
  }
  return data as WhatsAppState & { connected?: boolean; ok?: boolean };
}

export function WhatsAppAdmin() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["whatsapp-admin"],
    queryFn: () => callWhatsApp({ action: "get" }),
  });

  const [enabled, setEnabled] = useState(false);
  const [baseUrl, setBaseUrl] = useState("https://free.uazapi.com");
  const [instanceName, setInstanceName] = useState("");
  const [phone, setPhone] = useState("");
  const [token, setToken] = useState("");
  const [template, setTemplate] = useState("");
  const [testPhone, setTestPhone] = useState("");

  useEffect(() => {
    if (!data?.connection) return;
    setEnabled(data.connection.enabled);
    setBaseUrl(data.connection.base_url || "https://free.uazapi.com");
    setInstanceName(data.connection.instance_name || "");
    setPhone(data.connection.phone_e164 || "");
    setTemplate(data.template || "");
  }, [data]);

  const saveConnection = useMutation({
    mutationFn: () => callWhatsApp({
      action: "save_connection",
      enabled,
      base_url: baseUrl,
      instance_name: instanceName,
      phone_e164: phone,
      token,
    }),
    onSuccess: async () => {
      setToken("");
      toast.success("Conexão salva");
      await queryClient.invalidateQueries({ queryKey: ["whatsapp-admin"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const checkStatus = useMutation({
    mutationFn: () => callWhatsApp({ action: "status" }),
    onSuccess: async (result) => {
      toast.success(result.connected ? "WhatsApp conectado" : "WhatsApp desconectado");
      await queryClient.invalidateQueries({ queryKey: ["whatsapp-admin"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const saveTemplate = useMutation({
    mutationFn: () => callWhatsApp({ action: "save_template", body: template }),
    onSuccess: async () => {
      toast.success("Mensagem salva");
      await queryClient.invalidateQueries({ queryKey: ["whatsapp-admin"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const sendTest = useMutation({
    mutationFn: () => callWhatsApp({ action: "send_test", phone: testPhone }),
    onSuccess: async () => {
      toast.success("Teste enviado");
      setTestPhone("");
      await queryClient.invalidateQueries({ queryKey: ["whatsapp-admin"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando WhatsApp...</p>;
  if (isError || !data) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">Não foi possível abrir o WhatsApp.</p>
        <Button variant="outline" onClick={() => void refetch()}>Tentar de novo</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="font-serif text-2xl font-semibold">WhatsApp</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Quando a compra entra, a aluna recebe o acesso neste número. O suporte também fica por aqui, e a secretaria deixa de ser a primeira porta.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Conexão</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="wa-url">URL do Uazapi</Label>
              <Input id="wa-url" value={baseUrl} onChange={(event) => setBaseUrl(event.target.value)} placeholder="https://free.uazapi.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wa-instance">Instância</Label>
              <Input id="wa-instance" value={instanceName} onChange={(event) => setInstanceName(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wa-phone">Número deste WhatsApp</Label>
              <Input id="wa-phone" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="11999999999" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="wa-token">Token</Label>
              <Input id="wa-token" type="password" value={token} onChange={(event) => setToken(event.target.value)} placeholder={data.connection.token_configured ? "Token já salvo. Cole outro só para trocar." : "Cole o token da instância"} autoComplete="off" />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={() => saveConnection.mutate()} disabled={saveConnection.isPending}>Salvar conexão</Button>
            <Button variant="outline" onClick={() => checkStatus.mutate()} disabled={checkStatus.isPending}>Testar conexão</Button>
            <span className="text-sm text-muted-foreground">
              {data.connection.last_status === "connected" ? "Conectado" : data.connection.last_status === "disconnected" ? "Desconectado" : "Ainda sem teste"}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Configurações</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4">
          <div>
            <p className="font-medium">Disparo automático</p>
            <p className="text-sm text-muted-foreground">Ligado, a compra com celular válido entra na fila. Desligado, só o e-mail segue. Salve na conexão para aplicar.</p>
          </div>
          <Switch checked={enabled} onCheckedChange={setEnabled} aria-label="Disparo automático" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Mensagem de acesso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea value={template} onChange={(event) => setTemplate(event.target.value)} className="min-h-[220px]" />
          <p className="text-xs text-muted-foreground">Use {"{nome}"}, {"{email}"} e {"{link}"}. O link cria a senha. A mensagem não leva senha.</p>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => saveTemplate.mutate()} disabled={saveTemplate.isPending}>Salvar mensagem</Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-[1fr_auto] items-end">
            <div className="space-y-2">
              <Label htmlFor="wa-test">Enviar um teste</Label>
              <Input id="wa-test" value={testPhone} onChange={(event) => setTestPhone(event.target.value)} placeholder="Seu celular com DDD" />
            </div>
            <Button variant="outline" onClick={() => sendTest.mutate()} disabled={sendTest.isPending || !testPhone.trim()}>Enviar teste</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Envios</CardTitle>
        </CardHeader>
        <CardContent>
          {data.messages.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma mensagem ainda.</p>
          ) : (
            <ul className="divide-y divide-border">
              {data.messages.map((message) => (
                <li key={message.id} className="py-3 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">{message.name || "Aluna"} · {message.phone}</p>
                    <p className="text-xs text-muted-foreground">{new Date(message.created_at).toLocaleString("pt-BR")}</p>
                    {message.last_error && <p className="text-xs text-muted-foreground mt-1">{message.last_error}</p>}
                  </div>
                  <span className="text-xs font-medium">{STATUS_LABEL[message.status] ?? message.status}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
