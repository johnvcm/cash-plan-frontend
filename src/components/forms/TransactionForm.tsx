import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateTransaction, useUpdateTransaction, Transaction, useAccounts } from "@/hooks/use-api";
import { toast } from "sonner";

const transactionSchema = z.object({
  description: z.string().min(1, "Descrição é obrigatória"),
  category: z.string().min(1, "Categoria é obrigatória"),
  date: z.string().min(1, "Data é obrigatória"),
  amount: z.number().refine((val) => val !== 0, "Valor não pode ser zero"),
  type: z.enum(["income", "expense"], { required_error: "Tipo é obrigatório" }),
  account_id: z.number().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: Transaction;
}

export function TransactionForm({ open, onOpenChange, transaction }: TransactionFormProps) {
  const isEditing = !!transaction;
  const createTransaction = useCreateTransaction();
  const updateTransaction = useUpdateTransaction();
  const { data: accounts } = useAccounts();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      description: transaction?.description || "",
      category: transaction?.category || "",
      date: transaction?.date || new Date().toISOString().split("T")[0],
      amount: transaction?.amount || 0,
      type: transaction?.type || "income",
      account_id: transaction?.account_id,
    },
  });

  const type = watch("type");

  useEffect(() => {
    if (transaction) {
      reset({
        description: transaction.description,
        category: transaction.category,
        date: transaction.date,
        amount: transaction.amount,
        type: transaction.type,
        account_id: transaction.account_id,
      });
    } else {
      reset({
        description: "",
        category: "",
        date: new Date().toISOString().split("T")[0],
        amount: 0,
        type: "income",
        account_id: undefined,
      });
    }
  }, [transaction, reset]);

  const onSubmit = async (data: TransactionFormData) => {
    try {
      if (isEditing) {
        await updateTransaction.mutateAsync({ id: transaction.id, data });
        toast.success("Lançamento atualizado com sucesso!");
      } else {
        await createTransaction.mutateAsync(data);
        toast.success("Lançamento criado com sucesso!");
      }
      onOpenChange(false);
      reset();
    } catch (error) {
      toast.error(isEditing ? "Erro ao atualizar lançamento" : "Erro ao criar lançamento");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Lançamento" : "Novo Lançamento"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              placeholder="Ex: Salário, Mercado..."
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipo</Label>
            <Select
              value={type}
              onValueChange={(value) => setValue("type", value as "income" | "expense")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Receita</SelectItem>
                <SelectItem value="expense">Despesa</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-destructive">{errors.type.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Input
              id="category"
              placeholder="Ex: Renda, Alimentação, Moradia..."
              {...register("category")}
            />
            {errors.category && (
              <p className="text-sm text-destructive">{errors.category.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                {...register("date")}
              />
              {errors.date && (
                <p className="text-sm text-destructive">{errors.date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Valor</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register("amount", { valueAsNumber: true })}
              />
              {errors.amount && (
                <p className="text-sm text-destructive">{errors.amount.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="account_id">Conta (opcional)</Label>
            <Select
              value={watch("account_id")?.toString() || "none"}
              onValueChange={(value) => setValue("account_id", value === "none" ? undefined : parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Nenhuma conta selecionada" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhuma</SelectItem>
                {accounts?.map((account) => (
                  <SelectItem key={account.id} value={account.id.toString()}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Salvando..."
                : isEditing
                ? "Atualizar"
                : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

