import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AccountCard } from "@/components/AccountCard";
import { Plus } from "lucide-react";
import { useAccounts, useDeleteAccount, Account } from "@/hooks/use-api";
import { AccountForm } from "@/components/forms/AccountForm";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { toast } from "sonner";

const Contas = () => {
  const { data: accounts, isLoading, error } = useAccounts();
  const deleteAccount = useDeleteAccount();
  
  const [formOpen, setFormOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<number | null>(null);

  const handleEdit = (account: Account) => {
    setSelectedAccount(account);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (accountToDelete) {
      try {
        await deleteAccount.mutateAsync(accountToDelete);
        toast.success("Conta deletada com sucesso!");
        setDeleteDialogOpen(false);
        setAccountToDelete(null);
      } catch (error) {
        toast.error("Erro ao deletar conta");
      }
    }
  };

  const handleNewAccount = () => {
    setSelectedAccount(undefined);
    setFormOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-muted-foreground">Carregando contas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-destructive">
          Erro ao carregar contas. Verifique se o backend está rodando.
        </div>
      </div>
    );
  }

  const totalBalance = accounts?.reduce((sum, acc) => sum + acc.balance, 0) || 0;
  const totalInvestments = accounts?.reduce((sum, acc) => sum + acc.investments, 0) || 0;

  const formatBalance = (balance: number) => `R$ ${balance.toFixed(2).replace(".", ",")}`;
  const formatInvestments = (investments: number) =>
    `R$ ${investments.toFixed(2).replace(".", ",")}`;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Minhas Contas</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Gerencie suas contas bancárias</p>
        </div>
        <Button
          className="bg-gradient-primary hover:bg-primary-hover w-full sm:w-auto"
          onClick={handleNewAccount}
        >
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Conta
        </Button>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2">
        <Card className="shadow-card">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Total em contas correntes</p>
            <p className="text-3xl font-bold text-foreground mt-2">
              {formatBalance(totalBalance)}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Total em investimentos</p>
            <p className="text-3xl font-bold text-success mt-2">
              {formatBalance(totalInvestments)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Contas Bancárias</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          {accounts && accounts.length > 0 ? (
            accounts.map((account) => (
              <AccountCard
                key={account.id}
                name={account.name}
                bank={account.bank}
                balance={formatBalance(account.balance)}
                investments={formatInvestments(account.investments)}
                color={account.color || "#000000"}
                onEdit={() => handleEdit(account)}
                onDelete={() => {
                  setAccountToDelete(account.id);
                  setDeleteDialogOpen(true);
                }}
              />
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhuma conta cadastrada
            </p>
          )}
        </CardContent>
      </Card>

      <AccountForm
        open={formOpen}
        onOpenChange={setFormOpen}
        account={selectedAccount}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Deletar Conta"
        description="Tem certeza que deseja deletar esta conta? Esta ação não pode ser desfeita."
        isLoading={deleteAccount.isPending}
      />
    </div>
  );
};

export default Contas;
