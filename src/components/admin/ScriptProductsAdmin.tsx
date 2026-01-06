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

interface ScriptProduct {
  id: string;
  name: string;
  niche: string | null;
  promise: string | null;
  price: number | null;
  guarantee_days: number | null;
  checkout_url: string | null;
  whatsapp_url: string | null;
  tone_tags: string[] | null;
  forbidden_words: string[] | null;
  is_active: boolean | null;
}

const toneTagOptions = ['direto', 'emocional', 'autoridade', 'provocativo'];

export function ScriptProductsAdmin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ScriptProduct | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    niche: '',
    promise: '',
    price: '',
    guarantee_days: '7',
    checkout_url: '',
    whatsapp_url: '',
    tone_tags: [] as string[],
    forbidden_words: '',
    is_active: true,
  });

  // Buscar produtos
  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-script-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('script_products')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as ScriptProduct[];
    },
  });

  // Criar/Atualizar produto
  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const productData = {
        name: data.name,
        niche: data.niche || null,
        promise: data.promise || null,
        price: data.price ? parseFloat(data.price) : null,
        guarantee_days: parseInt(data.guarantee_days) || 7,
        checkout_url: data.checkout_url || null,
        whatsapp_url: data.whatsapp_url || null,
        tone_tags: data.tone_tags,
        forbidden_words: data.forbidden_words 
          ? data.forbidden_words.split(',').map(w => w.trim()).filter(Boolean)
          : [],
        is_active: data.is_active,
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('script_products')
          .update(productData)
          .eq('id', editingProduct.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('script_products')
          .insert(productData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-script-products'] });
      toast({ title: editingProduct ? "Produto atualizado!" : "Produto criado!" });
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

  // Deletar produto
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('script_products')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-script-products'] });
      toast({ title: "Produto excluído!" });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      niche: '',
      promise: '',
      price: '',
      guarantee_days: '7',
      checkout_url: '',
      whatsapp_url: '',
      tone_tags: [],
      forbidden_words: '',
      is_active: true,
    });
    setEditingProduct(null);
    setIsOpen(false);
  };

  const openEdit = (product: ScriptProduct) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      niche: product.niche || '',
      promise: product.promise || '',
      price: product.price?.toString() || '',
      guarantee_days: product.guarantee_days?.toString() || '7',
      checkout_url: product.checkout_url || '',
      whatsapp_url: product.whatsapp_url || '',
      tone_tags: product.tone_tags || [],
      forbidden_words: product.forbidden_words?.join(', ') || '',
      is_active: product.is_active ?? true,
    });
    setIsOpen(true);
  };

  const toggleToneTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tone_tags: prev.tone_tags.includes(tag)
        ? prev.tone_tags.filter(t => t !== tag)
        : [...prev.tone_tags, tag]
    }));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Produtos para Roteiros</CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Editar Produto' : 'Novo Produto'}
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
                  <Label>Nome *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Carrosséis Magnéticos"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nicho</Label>
                  <Input
                    value={formData.niche}
                    onChange={(e) => setFormData(prev => ({ ...prev, niche: e.target.value }))}
                    placeholder="Ex: Marketing Digital"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Promessa Principal</Label>
                <Textarea
                  value={formData.promise}
                  onChange={(e) => setFormData(prev => ({ ...prev, promise: e.target.value }))}
                  placeholder="Ex: Aprenda a criar carrosséis que vendem enquanto você dorme"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Preço (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="Ex: 197.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Dias de Garantia</Label>
                  <Input
                    type="number"
                    value={formData.guarantee_days}
                    onChange={(e) => setFormData(prev => ({ ...prev, guarantee_days: e.target.value }))}
                    placeholder="7"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>URL do Checkout</Label>
                  <Input
                    value={formData.checkout_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, checkout_url: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>URL do WhatsApp</Label>
                  <Input
                    value={formData.whatsapp_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, whatsapp_url: e.target.value }))}
                    placeholder="https://wa.me/..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tom de Voz</Label>
                <div className="flex flex-wrap gap-2">
                  {toneTagOptions.map((tag) => (
                    <Badge
                      key={tag}
                      variant={formData.tone_tags.includes(tag) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleToneTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Palavras Proibidas (separadas por vírgula)</Label>
                <Textarea
                  value={formData.forbidden_words}
                  onChange={(e) => setFormData(prev => ({ ...prev, forbidden_words: e.target.value }))}
                  placeholder="Ex: grátis, fácil, milagre"
                  rows={2}
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label>Produto ativo</Label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingProduct ? 'Salvar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : products?.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Nenhum produto cadastrado ainda.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Nicho</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products?.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.niche || '-'}</TableCell>
                  <TableCell>
                    {product.price 
                      ? `R$ ${product.price.toFixed(2).replace('.', ',')}`
                      : '-'
                    }
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.is_active ? "default" : "secondary"}>
                      {product.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(product)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => {
                          if (confirm('Excluir este produto?')) {
                            deleteMutation.mutate(product.id);
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
