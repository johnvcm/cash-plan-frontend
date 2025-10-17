import { useState } from "react";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/StatCard";
import { AccountCard } from "@/components/AccountCard";
import { CreditCardCard } from "@/components/CreditCardCard";
import { TransactionItem } from "@/components/TransactionItem";
import { Wallet, TrendingUp, TrendingDown, DollarSign, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  useAccounts, 
  useCreditCards, 
  useTransactions,
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
import { toast } from "sonner";

const Dashboard = () => {
  const { data: accounts, isLoading: loadingAccounts } = useAccounts();
  const { data: cards, isLoading: loadingCards } = useCreditCards();
  const { data: transactions, isLoading: loadingTransactions } = useTransactions();
  
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

  const formatCurrency = (value: number) => `R$ ${value.toFixed(2).replace(".", ",")}`;

  const totalBalance = accounts?.reduce((sum, acc) => sum + acc.balance, 0) || 0;
  const totalInvestments = accounts?.reduce((sum, acc) => sum + acc.investments, 0) || 0;
  
  const totalIncome = transactions
    ?.filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0) || 0;
  
  const totalExpenses = transactions
    ?.filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0) || 0;

  const isLoading = loadingAccounts || loadingCards || loadingTransactions;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-muted-foreground">Carregando dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral das suas finanças</p>
        </div>
        <Button 
          className="bg-gradient-primary hover:bg-primary-hover"
          onClick={handleNewTransaction}
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Lançamento
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Saldo Total"
          value={formatCurrency(totalBalance)}
          icon={Wallet}
          variant="default"
        />
        <StatCard
          title="Investimentos"
          value={formatCurrency(totalInvestments)}
          icon={TrendingUp}
          variant="success"
          trend={{ value: "12.5%", isPositive: true }}
        />
        <StatCard
          title="Receitas do Mês"
          value={formatCurrency(totalIncome)}
          icon={DollarSign}
          variant="success"
        />
        <StatCard
          title="Despesas do Mês"
          value={formatCurrency(totalExpenses)}
          icon={TrendingDown}
          variant="destructive"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Contas Bancárias</CardTitle>
            <Button variant="outline" size="sm" onClick={handleNewAccount}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
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
              <p className="text-muted-foreground text-center py-4">
                Nenhuma conta cadastrada
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Cartões de Crédito</CardTitle>
            <Button variant="outline" size="sm" onClick={handleNewCard}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {cards && cards.length > 0 ? (
              cards.slice(0, 3).map((card) => (
                <CreditCardCard 
                  key={card.id} 
                  {...card}
                  onEdit={() => handleEditCard(card)}
                  onDelete={() => openDeleteDialog(card.id, "card")}
                />
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">
                Nenhum cartão cadastrado
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Últimas Transações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
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
            <p className="text-muted-foreground text-center py-4">
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
