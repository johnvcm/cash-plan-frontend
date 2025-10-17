import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TransactionItem } from "@/components/TransactionItem";
import { Plus, Filter } from "lucide-react";
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
import { toast } from "sonner";

const Lancamentos = () => {
  const { data: transactions, isLoading } = useTransactions();
  const deleteTransaction = useDeleteTransaction();
  
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<number | null>(null);

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

  const filteredTransactions = transactions?.filter((t) => {
    const matchesFilter = filter === "all" || t.type === filter;
    const matchesSearch = t.description.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalIncome = transactions
    ?.filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0) || 0;

  const totalExpenses = transactions
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

      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        <Card className="shadow-card">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Receitas</p>
            <p className="text-2xl font-bold text-success mt-2">
              R$ {totalIncome.toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Despesas</p>
            <p className="text-2xl font-bold text-destructive mt-2">
              R$ {totalExpenses.toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Saldo</p>
            <p className={`text-2xl font-bold mt-2 ${balance >= 0 ? "text-success" : "text-destructive"}`}>
              R$ {balance.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <div className="flex flex-col gap-3">
            <CardTitle className="text-lg sm:text-xl">Todos os Lançamentos</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input 
                placeholder="Buscar..." 
                className="flex-1 sm:max-w-xs" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="income">Receitas</SelectItem>
                  <SelectItem value="expense">Despesas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-1 sm:space-y-2">
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
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhum lançamento encontrado
            </p>
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
