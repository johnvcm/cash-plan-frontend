import { useState, useMemo, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TransactionItem } from "@/components/TransactionItem";
import { TransactionCharts } from "@/components/TransactionCharts";
import { Plus, Calendar, ChevronLeft, ChevronRight, ArrowUpDown, Search, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTransactions, useDeleteTransaction, Transaction } from "@/hooks/use-api";
import { TransactionForm } from "@/components/forms/TransactionForm";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { formatCurrency } from "@/lib/format";
import { getUniqueCategories } from "@/lib/categories";
import { toast } from "sonner";

const Lancamentos = () => {
  const { data: transactions, isLoading } = useTransactions();
  const deleteTransaction = useDeleteTransaction();
  const pageScrollPositionRef = useRef<number>(0);
  
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "highest" | "lowest">("newest");
  const [formOpen, setFormOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<number | null>(null);

  // Salvar posição do scroll da página antes de re-renderizar
  useEffect(() => {
    // Salvar posição atual antes da mudança
    pageScrollPositionRef.current = window.scrollY;
    
    // Restaurar posição após o re-render
    const timeoutId = setTimeout(() => {
      window.scrollTo({
        top: pageScrollPositionRef.current,
        behavior: 'instant' as ScrollBehavior,
      });
    }, 0);
    
    return () => clearTimeout(timeoutId);
  }, [filter, categoryFilter, sortOrder]);

  // Extrair meses únicos das transações
  const availableMonths = useMemo(() => {
    if (!transactions) return [];
    
    const monthsSet = new Set<string>();
    transactions.forEach((t) => {
      const date = new Date(t.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      monthsSet.add(monthKey);
    });
    
    return Array.from(monthsSet).sort().reverse(); // Mais recente primeiro
  }, [transactions]);

  // Extrair categorias únicas das transações
  const availableCategories = useMemo(() => {
    if (!transactions) return [];
    return getUniqueCategories(transactions);
  }, [transactions]);

  // Formatar mês para exibição
  const formatMonth = (monthKey: string) => {
    const [year, month] = monthKey.split("-");
    const date = new Date(Date.UTC(Number(year), Number(month) - 1, 1));
    return new Intl.DateTimeFormat("pt-BR", { 
      month: "long", 
      year: "numeric",
      timeZone: "UTC"
    }).format(date);
  };

  // Formatar mês curto (para botão)
  const formatMonthShort = (monthKey: string) => {
    const [year, month] = monthKey.split("-");
    const date = new Date(Date.UTC(Number(year), Number(month) - 1, 1));
    const monthName = new Intl.DateTimeFormat("pt-BR", { 
      month: "long",
      timeZone: "UTC"
    }).format(date);
    return `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`;
  };

  // Navegar entre meses
  const handlePreviousMonth = () => {
    if (selectedMonth === "all") {
      // Se está em "Todos", vai para o mês mais recente
      if (availableMonths.length > 0) {
        setSelectedMonth(availableMonths[0]);
      }
    } else {
      const currentIndex = availableMonths.indexOf(selectedMonth);
      if (currentIndex < availableMonths.length - 1) {
        setSelectedMonth(availableMonths[currentIndex + 1]);
      }
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === "all") {
      // Se está em "Todos", vai para o mês mais recente
      if (availableMonths.length > 0) {
        setSelectedMonth(availableMonths[0]);
      }
    } else {
      const currentIndex = availableMonths.indexOf(selectedMonth);
      if (currentIndex > 0) {
        setSelectedMonth(availableMonths[currentIndex - 1]);
      } else {
        // Se está no mês mais recente, não faz nada
      }
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (transactionToDelete) {
      try {
        await deleteTransaction.mutateAsync(transactionToDelete);
        toast.success("Lançamento deletado com sucesso!");
        setDeleteDialogOpen(false);
        setTransactionToDelete(null);
      } catch (error) {
        toast.error("Erro ao deletar lançamento");
      }
    }
  };

  const handleNewTransaction = () => {
    setSelectedTransaction(undefined);
    setFormOpen(true);
  };

  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];
    
    let filtered = transactions.filter((t) => {
      const matchesFilter = filter === "all" || t.type === filter;
      const matchesSearch = t.description.toLowerCase().includes(search.toLowerCase());
      
      // Filtro de mês
      let matchesMonth = true;
      if (selectedMonth !== "all") {
        const date = new Date(t.date);
        const transactionMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        matchesMonth = transactionMonth === selectedMonth;
      }
      
      // Filtro de categoria
      const matchesCategory = categoryFilter === "all" || t.category === categoryFilter;
      
      return matchesFilter && matchesSearch && matchesMonth && matchesCategory;
    });

    // Ordenar
    filtered.sort((a, b) => {
      switch (sortOrder) {
        case "newest":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "oldest":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "highest":
          return Math.abs(b.amount) - Math.abs(a.amount);
        case "lowest":
          return Math.abs(a.amount) - Math.abs(b.amount);
        default:
          return 0;
      }
    });

    return filtered;
  }, [transactions, filter, search, selectedMonth, categoryFilter, sortOrder]);

  // Calcular totais baseados nas transações filtradas
  const totalIncome = filteredTransactions
    ?.filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0) || 0;

  const totalExpenses = filteredTransactions
    ?.filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0) || 0;

  const balance = totalIncome - totalExpenses;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-muted-foreground">Carregando lançamentos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Lançamentos</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Gerencie suas receitas e despesas</p>
        </div>
        <Button
          className="bg-gradient-primary hover:bg-primary-hover w-full sm:w-auto"
          onClick={handleNewTransaction}
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Lançamento
        </Button>
      </div>

      {/* Filtro de Período - Navegação Moderna */}
      <Card className="shadow-card bg-gradient-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            {/* Lado Esquerdo: Navegação */}
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary flex-shrink-0" />
              
              {/* Botão Anterior */}
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousMonth}
                disabled={selectedMonth !== "all" && availableMonths.indexOf(selectedMonth) === availableMonths.length - 1}
                className="h-9 w-9 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {/* Mês Atual / Dropdown */}
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="h-9 w-[180px] sm:w-[200px] font-medium">
                  <SelectValue>
                    {selectedMonth === "all" ? "Todos os períodos" : formatMonthShort(selectedMonth)}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os períodos</SelectItem>
                  {availableMonths.map((month) => (
                    <SelectItem key={month} value={month} className="capitalize">
                      {formatMonthShort(month)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Botão Próximo */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextMonth}
                disabled={selectedMonth !== "all" && availableMonths.indexOf(selectedMonth) === 0}
                className="h-9 w-9 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Lado Direito: Botão Rápido "Ver Tudo" */}
            {selectedMonth !== "all" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedMonth("all")}
                className="text-xs whitespace-nowrap"
              >
                Ver tudo
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        <Card className="shadow-card">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Receitas</p>
            <p className="text-2xl font-bold text-success mt-2">
              {formatCurrency(totalIncome)}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Despesas</p>
            <p className="text-2xl font-bold text-destructive mt-2">
              {formatCurrency(totalExpenses)}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Saldo</p>
            <p className={`text-2xl font-bold mt-2 ${balance >= 0 ? "text-success" : "text-destructive"}`}>
              {formatCurrency(balance)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos de Análise */}
      {filteredTransactions && filteredTransactions.length > 0 && (
        <TransactionCharts transactions={filteredTransactions} />
      )}

      <Card className="shadow-card">
        <CardHeader className="space-y-4">
          <CardTitle className="text-lg sm:text-xl">Todos os Lançamentos</CardTitle>
          
          {/* Tabs para Tipo de Transação */}
          <Tabs value={filter} onValueChange={setFilter} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all" className="text-xs sm:text-sm">
                Todos
              </TabsTrigger>
              <TabsTrigger value="income" className="text-xs sm:text-sm">
                Receitas
              </TabsTrigger>
              <TabsTrigger value="expense" className="text-xs sm:text-sm">
                Despesas
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Linha de Filtros Compacta */}
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Campo de Busca com Ícone */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar..." 
                className="pl-9 w-full" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Filtro de Categoria */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Tag className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {availableCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Ordenação */}
            <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as "newest" | "oldest" | "highest" | "lowest")}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Ordenar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Data: Recentes</SelectItem>
                <SelectItem value="oldest">Data: Antigos</SelectItem>
                <SelectItem value="highest">Valor: Maior</SelectItem>
                <SelectItem value="lowest">Valor: Menor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="h-[500px] overflow-y-auto space-y-1 sm:space-y-2 px-4 sm:px-6">
          {filteredTransactions && filteredTransactions.length > 0 ? (
            filteredTransactions.map((transaction) => (
              <TransactionItem
                key={transaction.id}
                {...transaction}
                onEdit={() => handleEdit(transaction)}
                onDelete={() => {
                  setTransactionToDelete(transaction.id);
                  setDeleteDialogOpen(true);
                }}
              />
            ))
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-muted-foreground text-center">
                Nenhum lançamento encontrado
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <TransactionForm
        open={formOpen}
        onOpenChange={setFormOpen}
        transaction={selectedTransaction}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Deletar Lançamento"
        description="Tem certeza que deseja deletar este lançamento? Esta ação não pode ser desfeita."
        isLoading={deleteTransaction.isPending}
      />
    </div>
  );
};

export default Lancamentos;
