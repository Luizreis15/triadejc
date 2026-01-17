import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Download,
  Plus,
  Search,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const statusColors: Record<string, string> = {
  completed: "bg-green-500/10 text-green-500",
  pending: "bg-yellow-500/10 text-yellow-500",
  failed: "bg-red-500/10 text-red-500",
  refunded: "bg-gray-500/10 text-gray-500",
};

const typeLabels: Record<string, string> = {
  purchase: "Compra",
  renewal: "Renovação",
  refund: "Reembolso",
};

export function FinanceAdmin() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    amount: "",
    type: "purchase",
    status: "completed",
    description: "",
    payment_method: "pix",
  });

  const { data: transactions, isLoading, refetch } = useQuery({
    queryKey: ["admin-transactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { data: profiles } = useQuery({
    queryKey: ["admin-profiles-finance"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, email");
      if (error) throw error;
      return data;
    },
  });

  const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);

  // Calculate metrics
  const totalRevenue = transactions
    ?.filter(t => t.status === "completed" && t.type !== "refund")
    .reduce((acc, t) => acc + Number(t.amount), 0) || 0;

  const thisMonthStart = startOfMonth(new Date());
  const thisMonthEnd = endOfMonth(new Date());
  const thisMonthRevenue = transactions
    ?.filter(t => {
      const date = new Date(t.created_at);
      return t.status === "completed" && 
             t.type !== "refund" &&
             date >= thisMonthStart && 
             date <= thisMonthEnd;
    })
    .reduce((acc, t) => acc + Number(t.amount), 0) || 0;

  const lastMonthStart = startOfMonth(subMonths(new Date(), 1));
  const lastMonthEnd = endOfMonth(subMonths(new Date(), 1));
  const lastMonthRevenue = transactions
    ?.filter(t => {
      const date = new Date(t.created_at);
      return t.status === "completed" && 
             t.type !== "refund" &&
             date >= lastMonthStart && 
             date <= lastMonthEnd;
    })
    .reduce((acc, t) => acc + Number(t.amount), 0) || 0;

  const pendingCount = transactions?.filter(t => t.status === "pending").length || 0;
  const refundedAmount = transactions
    ?.filter(t => t.type === "refund")
    .reduce((acc, t) => acc + Number(t.amount), 0) || 0;

  // Chart data - last 6 months
  const chartData = Array.from({ length: 6 }, (_, i) => {
    const month = subMonths(new Date(), 5 - i);
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const revenue = transactions
      ?.filter(t => {
        const date = new Date(t.created_at);
        return t.status === "completed" && 
               t.type !== "refund" &&
               date >= monthStart && 
               date <= monthEnd;
      })
      .reduce((acc, t) => acc + Number(t.amount), 0) || 0;
    
    return {
      month: format(month, "MMM", { locale: ptBR }),
      revenue,
    };
  });

  const filteredTransactions = transactions?.filter(t => {
    const profile = profilesMap.get(t.user_id);
    const matchesSearch = 
      profile?.name?.toLowerCase().includes(search.toLowerCase()) ||
      profile?.email?.toLowerCase().includes(search.toLowerCase()) ||
      t.description?.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleAddTransaction = async () => {
    try {
      const { error } = await supabase
        .from("transactions")
        .insert({
          amount: parseFloat(newTransaction.amount),
          type: newTransaction.type,
          status: newTransaction.status,
          description: newTransaction.description,
          payment_method: newTransaction.payment_method,
          user_id: null as any, // Manual transaction without user
        });

      if (error) throw error;

      toast.success("Transação adicionada com sucesso");
      setIsAddDialogOpen(false);
      setNewTransaction({
        amount: "",
        type: "purchase",
        status: "completed",
        description: "",
        payment_method: "pix",
      });
      refetch();
    } catch (error) {
      console.error("Error adding transaction:", error);
      toast.error("Erro ao adicionar transação");
    }
  };

  const handleExportCSV = () => {
    if (!transactions || transactions.length === 0) {
      toast.error("Nenhuma transação para exportar");
      return;
    }

    const headers = ["Data", "Usuário", "Email", "Tipo", "Valor", "Status", "Método"];
    const rows = transactions.map(t => {
      const profile = profilesMap.get(t.user_id);
      return [
        format(new Date(t.created_at), "dd/MM/yyyy HH:mm"),
        profile?.name || "-",
        profile?.email || "-",
        typeLabels[t.type] || t.type,
        `R$ ${Number(t.amount).toFixed(2)}`,
        t.status,
        t.payment_method || "-",
      ];
    });

    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `transacoes-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success("Relatório exportado com sucesso");
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const growthPercent = lastMonthRevenue > 0
    ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold text-foreground mb-2">
            Financeiro
          </h2>
          <p className="text-muted-foreground">
            Acompanhe receitas, transações e relatórios
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Transação
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Transação Manual</DialogTitle>
                <DialogDescription>
                  Registre uma transação manualmente no sistema.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Valor (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, amount: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select
                    value={newTransaction.type}
                    onValueChange={(v) => setNewTransaction(prev => ({ ...prev, type: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="purchase">Compra</SelectItem>
                      <SelectItem value="renewal">Renovação</SelectItem>
                      <SelectItem value="refund">Reembolso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={newTransaction.status}
                    onValueChange={(v) => setNewTransaction(prev => ({ ...prev, status: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="completed">Concluída</SelectItem>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="failed">Falhou</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Método de Pagamento</Label>
                  <Select
                    value={newTransaction.payment_method}
                    onValueChange={(v) => setNewTransaction(prev => ({ ...prev, payment_method: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pix">PIX</SelectItem>
                      <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                      <SelectItem value="boleto">Boleto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Input
                    placeholder="Descrição da transação"
                    value={newTransaction.description}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddTransaction} disabled={!newTransaction.amount}>
                  Adicionar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-full">
                <DollarSign className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Receita Total</p>
                <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Este Mês</p>
                <p className="text-2xl font-bold">{formatCurrency(thisMonthRevenue)}</p>
                {Number(growthPercent) !== 0 && (
                  <p className={`text-xs ${Number(growthPercent) > 0 ? "text-green-500" : "text-red-500"}`}>
                    {Number(growthPercent) > 0 ? "+" : ""}{growthPercent}% vs mês anterior
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-500/10 rounded-full">
                <AlertCircle className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-500/10 rounded-full">
                <RefreshCw className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Reembolsos</p>
                <p className="text-2xl font-bold">{formatCurrency(refundedAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Receita Mensal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-muted-foreground" />
                <YAxis 
                  tickFormatter={(value) => `R$ ${value}`}
                  className="text-muted-foreground"
                />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), "Receita"]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <CardTitle className="flex-1">Transações</CardTitle>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="failed">Falhou</SelectItem>
                  <SelectItem value="refunded">Reembolsado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredTransactions?.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Nenhuma transação encontrada
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions?.map((transaction) => {
                    const profile = profilesMap.get(transaction.user_id);
                    return (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          {format(new Date(transaction.created_at), "dd/MM/yyyy HH:mm", {
                            locale: ptBR,
                          })}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{profile?.name || "Manual"}</p>
                            <p className="text-sm text-muted-foreground">
                              {profile?.email || transaction.description || "-"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {typeLabels[transaction.type] || transaction.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {transaction.type === "refund" ? "-" : ""}
                          {formatCurrency(Number(transaction.amount))}
                        </TableCell>
                        <TableCell className="capitalize">
                          {transaction.payment_method || "-"}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[transaction.status] || ""}>
                            {transaction.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
