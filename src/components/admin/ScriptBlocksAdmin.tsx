import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";

interface ScriptBlock {
  id: string;
  product_id: string;
  type: string;
  text_content: string;
  goal_tags: string[] | null;
  tone_tags: string[] | null;
  awareness_tags: string[] | null;
  est_seconds: number | null;
  allow_price: boolean | null;
  is_active: boolean | null;
  usage_count: number | null;
}

interface ScriptProduct {
  id: string;
  name: string;
}

const blockTypes = [
  { value: 'headline', label: 'Gancho (Headline)' },
  { value: 'body', label: 'Corpo' },
  { value: 'offer', label: 'Oferta' },
  { value: 'cta', label: 'CTA' },
  { value: 'ps', label: 'PS' },
];

const goalTagOptions = ['vender', 'crescer', 'dm', 'engajar'];
const toneTagOptions = ['direto', 'emocional', 'autoridade', 'provocativo'];

export function ScriptBlocksAdmin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<ScriptBlock | null>(null);
  const [filterProduct, setFilterProduct] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  // Form state
  const [formData, setFormData] = useState({
    product_id: '',
    type: 'headline',
    text_content: '',
    goal_tags: [] as string[],
    tone_tags: [] as string[],
    est_seconds: '5',
    allow_price: false,
    is_active: true,
  });

  // Buscar produtos
  const { data: products } = useQuery({
    queryKey: ['admin-script-products-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('script_products')
        .select('id, name')
        .order('name');
      if (error) throw error;
      return data as ScriptProduct[];
    },
  });

  // Buscar blocos
  const { data: blocks, isLoading } = useQuery({
    queryKey: ['admin-script-blocks', filterProduct, filterType],
    queryFn: async () => {
      let query = supabase
        .from('script_blocks')
        .select('*, script_products(name)')
        .order('created_at', { ascending: false });
      
      if (filterProduct !== 'all') {
        query = query.eq('product_id', filterProduct);
      }
      if (filterType !== 'all') {
        query = query.eq('type', filterType);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Criar/Atualizar bloco
  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const blockData = {
        product_id: data.product_id,
        type: data.type,
        text_content: data.text_content,
        goal_tags: data.goal_tags,
        tone_tags: data.tone_tags,
        awareness_tags: [],
        est_seconds: parseInt(data.est_seconds) || 5,
        allow_price: data.allow_price,
        is_active: data.is_active,
      };

      if (editingBlock) {
        const { error } = await supabase
          .from('script_blocks')
          .update(blockData)
          .eq('id', editingBlock.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('script_blocks')
          .insert(blockData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-script-blocks'] });
      toast({ title: editingBlock ? "Bloco atualizado!" : "Bloco criado!" });
      resetForm();
    },
    onError: (error) => {
      toast({ 
        title: "Erro ao salvar", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  // Deletar bloco
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('script_blocks')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-script-blocks'] });
      toast({ title: "Bloco excluído!" });
    },
  });

  const resetForm = () => {
    setFormData({
      product_id: '',
      type: 'headline',
      text_content: '',
      goal_tags: [],
      tone_tags: [],
      est_seconds: '5',
      allow_price: false,
      is_active: true,
    });
    setEditingBlock(null);
    setIsOpen(false);
  };

  const openEdit = (block: ScriptBlock) => {
    setEditingBlock(block);
    setFormData({
      product_id: block.product_id,
      type: block.type,
      text_content: block.text_content,
      goal_tags: block.goal_tags || [],
      tone_tags: block.tone_tags || [],
      est_seconds: block.est_seconds?.toString() || '5',
      allow_price: block.allow_price ?? false,
      is_active: block.is_active ?? true,
    });
    setIsOpen(true);
  };

  const toggleTag = (field: 'goal_tags' | 'tone_tags', tag: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(tag)
        ? prev[field].filter(t => t !== tag)
        : [...prev[field], tag]
    }));
  };

  const typeColors: Record<string, string> = {
    headline: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
    body: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
    offer: 'bg-green-500/10 text-green-600 border-green-500/30',
    cta: 'bg-purple-500/10 text-purple-600 border-purple-500/30',
    ps: 'bg-gray-500/10 text-gray-600 border-gray-500/30',
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
        <CardTitle>Blocos de Roteiro</CardTitle>
        
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={filterProduct} onValueChange={setFilterProduct}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar produto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os produtos</SelectItem>
              {products?.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Filtrar tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              {blockTypes.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Bloco
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingBlock ? 'Editar Bloco' : 'Novo Bloco'}
                </DialogTitle>
              </DialogHeader>
              
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  saveMutation.mutate(formData);
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Produto *</Label>
                    <Select 
                      value={formData.product_id} 
                      onValueChange={(v) => setFormData(prev => ({ ...prev, product_id: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {products?.map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo *</Label>
                    <Select 
                      value={formData.type} 
                      onValueChange={(v) => setFormData(prev => ({ ...prev, type: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {blockTypes.map((t) => (
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Texto do Bloco *</Label>
                  <Textarea
                    value={formData.text_content}
                    onChange={(e) => setFormData(prev => ({ ...prev, text_content: e.target.value }))}
                    placeholder="Digite o conteúdo do bloco..."
                    rows={4}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Use placeholders: {'{produto_nome}'}, {'{preco}'}, {'{checkout_url}'}, {'{whatsapp_url}'}, {'{garantia}'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tags de Objetivo</Label>
                    <div className="flex flex-wrap gap-2">
                      {goalTagOptions.map((tag) => (
                        <Badge
                          key={tag}
                          variant={formData.goal_tags.includes(tag) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => toggleTag('goal_tags', tag)}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Tags de Tom</Label>
                    <div className="flex flex-wrap gap-2">
                      {toneTagOptions.map((tag) => (
                        <Badge
                          key={tag}
                          variant={formData.tone_tags.includes(tag) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => toggleTag('tone_tags', tag)}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Duração (segundos)</Label>
                    <Input
                      type="number"
                      value={formData.est_seconds}
                      onChange={(e) => setFormData(prev => ({ ...prev, est_seconds: e.target.value }))}
                      min="1"
                      max="60"
                    />
                  </div>
                  <div className="space-y-2 flex items-end gap-2">
                    <Switch
                      checked={formData.allow_price}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allow_price: checked }))}
                    />
                    <Label>Pode mostrar preço</Label>
                  </div>
                  <div className="space-y-2 flex items-end gap-2">
                    <Switch
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                    />
                    <Label>Ativo</Label>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={saveMutation.isPending}>
                    {saveMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {editingBlock ? 'Salvar' : 'Criar'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : blocks?.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Nenhum bloco cadastrado ainda.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead className="max-w-[300px]">Texto</TableHead>
                <TableHead>Uso</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {blocks?.map((block: any) => (
                <TableRow key={block.id}>
                  <TableCell>
                    <Badge variant="outline" className={typeColors[block.type]}>
                      {blockTypes.find(t => t.value === block.type)?.label || block.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {block.script_products?.name || '-'}
                  </TableCell>
                  <TableCell className="max-w-[300px]">
                    <p className="truncate text-sm">{block.text_content}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{block.usage_count || 0}x</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={block.is_active ? "default" : "secondary"}>
                      {block.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(block)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => {
                          if (confirm('Excluir este bloco?')) {
                            deleteMutation.mutate(block.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
