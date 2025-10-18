import { useState } from "react";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/StatCard";
import { AccountCard } from "@/components/AccountCard";
import { CreditCardCard } from "@/components/CreditCardCard";
import { TransactionItem } from "@/components/TransactionItem";
import { Wallet, TrendingUp, TrendingDown, DollarSign, Plus, PiggyBank } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  useAccounts, 
  useCreditCards, 
  useTransactions,
  useInvestments,
  useDeleteAccount,
  useDeleteCreditCard,
  useDeleteTransaction,
  Account,
  CreditCard,
  Transaction
} from "@/hooks/use-api";
import { AccountForm } from "@/components/forms/AccountForm";
import { CreditCardForm } from "@/components/forms/CreditCardForm";
import { TransactionForm } from "@/components/forms/TransactionForm";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { formatCurrency } from "@/lib/format";
import { toast } from "sonner";

const Dashboard = () => {
  const { data: accounts, isLoading: loadingAccounts } = useAccounts();
  const { data: cards, isLoading: loadingCards } = useCreditCards();
  const { data: transactions, isLoading: loadingTransactions } = useTransactions();
  const { data: investments, isLoading: loadingInvestments } = useInvestments();
  
  const deleteAccount = useDeleteAccount();
  const deleteCard = useDeleteCreditCard();
  const deleteTransaction = useDeleteTransaction();
  
  // Estados para formulários
  const [accountFormOpen, setAccountFormOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | undefined>();
  
  const [cardFormOpen, setCardFormOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CreditCard | undefined>();
  
  const [transactionFormOpen, setTransactionFormOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | undefined>();
  
  // Estados para delete
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<"account" | "card" | "transaction">("account");
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  
  // Handlers para Contas
  const handleEditAccount = (account: Account) => {
    setSelectedAccount(account);
    setAccountFormOpen(true);
  };
  
  const handleNewAccount = () => {
    setSelectedAccount(undefined);
    setAccountFormOpen(true);
  };
  
  // Handlers para Cartões
  const handleEditCard = (card: CreditCard) => {
    setSelectedCard(card);
    setCardFormOpen(true);
  };
  
  const handleNewCard = () => {
    setSelectedCard(undefined);
    setCardFormOpen(true);
  };
  
  // Handlers para Transações
  const handleEditTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setTransactionFormOpen(true);
  };
  
  const handleNewTransaction = () => {
    setSelectedTransaction(undefined);
    setTransactionFormOpen(true);
  };
  
  // Handler para Delete
  const handleDelete = async () => {
    if (!itemToDelete) return;
    
    try {
      if (deleteType === "account") {
        await deleteAccount.mutateAsync(itemToDelete);
        toast.success("Conta deletada com sucesso!");
      } else if (deleteType === "card") {
        await deleteCard.mutateAsync(itemToDelete);
        toast.success("Cartão deletado com sucesso!");
      } else if (deleteType === "transaction") {
        await deleteTransaction.mutateAsync(itemToDelete);
        toast.success("Lançamento deletado com sucesso!");
      }
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    } catch (error) {
      toast.error("Erro ao deletar");
    }
  };
  
  const openDeleteDialog = (id: number, type: "account" | "card" | "transaction") => {
    setItemToDelete(id);
    setDeleteType(type);
    setDeleteDialogOpen(true);
  };

  const totalBalance = accounts?.reduce((sum, acc) => sum + acc.balance, 0) || 0;
  const totalInvestmentsValue = investments?.reduce((sum, inv) => sum + inv.value, 0) || 0;
  
  const totalIncome = transactions
    ?.filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0) || 0;
  
  const totalExpenses = transactions
    ?.filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0) || 0;

  const isLoading = loadingAccounts || loadingCards || loadingTransactions || loadingInvestments;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-muted-foreground">Carregando dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Visão geral das suas finanças</p>
        </div>
        <Button 
          className="bg-gradient-primary hover:bg-primary-hover w-full sm:w-auto"
          onClick={handleNewTransaction}
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Lançamento
        </Button>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Saldo Total"
          value={formatCurrency(totalBalance)}
          icon={Wallet}
          variant="default"
        />
        <StatCard
          title="Investimentos"
          value={formatCurrency(totalInvestmentsValue)}
          icon={PiggyBank}
          variant="warning"
        />
        <StatCard
          title="Receitas do Mês"
          value={formatCurrency(totalIncome)}
          icon={TrendingUp}
          variant="success"
        />
        <StatCard
          title="Despesas do Mês"
          value={formatCurrency(totalExpenses)}
          icon={TrendingDown}
          variant="destructive"
        />
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-lg sm:text-xl">Contas Bancárias</CardTitle>
            <Button variant="outline" size="sm" onClick={handleNewAccount} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            {accounts && accounts.length > 0 ? (
              accounts.slice(0, 3).map((account) => (
                <AccountCard
                  key={account.id}
                  name={account.name}
                  bank={account.bank}
                  balance={formatCurrency(account.balance)}
                  investments={formatCurrency(account.investments)}
                  color={account.color || "#000000"}
                  onEdit={() => handleEditAccount(account)}
                  onDelete={() => openDeleteDialog(account.id, "account")}
                />
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhuma conta cadastrada
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-lg sm:text-xl">Cartões de Crédito</CardTitle>
            <Button variant="outline" size="sm" onClick={handleNewCard} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            {cards && cards.length > 0 ? (
              cards.slice(0, 3).map((card) => (
                <CreditCardCard 
                  key={card.id}
                  name={card.name}
                  bank={card.bank}
                  used={card.used / 100}
                  limit={card.limit / 100}
                  color={card.color || "#3B82F6"}
                  onEdit={() => handleEditCard(card)}
                  onDelete={() => openDeleteDialog(card.id, "card")}
                />
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum cartão cadastrado
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Últimas Transações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 sm:space-y-2">
          {transactions && transactions.length > 0 ? (
            transactions.slice(0, 5).map((transaction) => (
              <TransactionItem 
                key={transaction.id} 
                {...transaction}
                onEdit={() => handleEditTransaction(transaction)}
                onDelete={() => openDeleteDialog(transaction.id, "transaction")}
              />
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhuma transação registrada
            </p>
          )}
        </CardContent>
      </Card>
      
      {/* Formulários */}
      <AccountForm
        open={accountFormOpen}
        onOpenChange={setAccountFormOpen}
        account={selectedAccount}
      />
      
      <CreditCardForm
        open={cardFormOpen}
        onOpenChange={setCardFormOpen}
        card={selectedCard}
      />
      
      <TransactionForm
        open={transactionFormOpen}
        onOpenChange={setTransactionFormOpen}
        transaction={selectedTransaction}
      />
      
      {/* Dialog de Confirmação */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title={`Deletar ${deleteType === "account" ? "Conta" : deleteType === "card" ? "Cartão" : "Lançamento"}`}
        description="Tem certeza que deseja deletar este item? Esta ação não pode ser desfeita."
        isLoading={deleteAccount.isPending || deleteCard.isPending || deleteTransaction.isPending}
      />
    </div>
  );
};

export default Dashboard;
