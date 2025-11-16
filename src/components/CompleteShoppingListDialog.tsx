import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useAccounts } from "@/hooks/use-api";
import { formatCurrency } from "@/lib/format";
import { Receipt, TrendingDown } from "lucide-react";

interface CompleteShoppingListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (createTransactions: boolean, accountId?: number) => void;
  listName: string;
  totalSpent: number;
  isLoading?: boolean;
}

export function CompleteShoppingListDialog({
  open,
  onOpenChange,
  onConfirm,
  listName,
  totalSpent,
  isLoading = false,
}: CompleteShoppingListDialogProps) {
  const [createTransactions, setCreateTransactions] = useState(true);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const { data: accounts } = useAccounts();

  const handleConfirm = () => {
    const accountId = selectedAccountId && selectedAccountId !== "none" 
      ? parseInt(selectedAccountId) 
      : undefined;
    onConfirm(createTransactions, accountId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl flex items-center gap-2">
            <Receipt className="h-5 w-5 text-success" />
            Concluir Lista de Compras
          </DialogTitle>
          <DialogDescription>
            A lista "{listName}" será marcada como concluída.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Resumo */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total gasto:</span>
              <span className="text-lg font-bold text-primary">
                {formatCurrency(totalSpent)}
              </span>
            </div>
          </div>

          {/* Opção de criar transações */}
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 border border-border rounded-lg">
              <input
                type="checkbox"
                id="create-transactions"
                checked={createTransactions}
                onChange={(e) => setCreateTransactions(e.target.checked)}
                className="mt-1 h-4 w-4 cursor-pointer"
              />
              <div className="flex-1">
                <Label htmlFor="create-transactions" className="cursor-pointer font-medium">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-destructive" />
                    Registrar como despesas
                  </div>
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Criar lançamentos automáticos agrupados por categoria
                </p>
              </div>
            </div>

            {/* Seleção de conta */}
            {createTransactions && (
              <div className="space-y-2 pl-7 animate-in fade-in slide-in-from-top-2">
                <Label htmlFor="account" className="text-sm font-medium">
                  Deduzir de qual conta? (Opcional)
                </Label>
                <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                  <SelectTrigger id="account" className="h-11">
                    <SelectValue placeholder="Nenhuma (apenas registrar)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhuma (apenas registrar)</SelectItem>
                    {accounts?.map((account) => (
                      <SelectItem key={account.id} value={account.id.toString()}>
                        {account.name} - {formatCurrency(account.balance)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {selectedAccountId && selectedAccountId !== "none"
                    ? "O saldo da conta será atualizado automaticamente"
                    : "As despesas serão apenas registradas, sem afetar contas"}
                </p>
              </div>
            )}
          </div>

          {/* Explicação */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
            <p className="text-xs text-blue-600 dark:text-blue-400">
              💡 <strong>Dica:</strong> Os itens serão agrupados por categoria e cada categoria
              virará uma despesa separada em "Lançamentos", facilitando sua análise financeira.
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className="w-full sm:w-auto bg-success hover:bg-success/90"
          >
            {isLoading ? "Concluindo..." : "Concluir Lista"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

