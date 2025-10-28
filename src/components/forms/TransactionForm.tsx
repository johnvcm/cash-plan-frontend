import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { CurrencyInput } from "@/components/ui/currency-input";
import { useCreateTransaction, useUpdateTransaction, Transaction, useAccounts, useCategories, useCreateCategory } from "@/hooks/use-api";
import { toast } from "sonner";
import { TrendingUp, TrendingDown, Plus } from "lucide-react";
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from "@/lib/categories";

const transactionSchema = z.object({
  description: z.string().min(1, "Descrição é obrigatória"),
  category: z.string().min(1, "Categoria é obrigatória"),
  date: z.string().min(1, "Data é obrigatória"),
  amount: z.number().positive("Valor deve ser maior que zero"),
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
  const createCategory = useCreateCategory();

  const [amount, setAmount] = useState(transaction?.amount || 0);
  const [addingCustomCategory, setAddingCustomCategory] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState("");

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
      type: transaction?.type || "expense",
      account_id: transaction?.account_id,
    },
  });

  const type = watch("type");
  const selectedCategory = watch("category");

  // Buscar categorias da API
  const { data: apiCategories } = useCategories(type);

  // Mesclar categorias padrão (do código) com categorias da API
  const availableCategories = useMemo(() => {
    const defaultCategories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    const apiCategoryNames = apiCategories?.map(cat => cat.name) || [];
    
    // Mesclar e remover duplicatas
    const allCategories = new Set([...defaultCategories, ...apiCategoryNames]);
    return Array.from(allCategories).sort();
  }, [type, apiCategories]);

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
      setAmount(transaction.amount || 0);
    } else {
      reset({
        description: "",
        category: "",
        date: new Date().toISOString().split("T")[0],
        amount: 0,
        type: "expense",
        account_id: undefined,
      });
      setAmount(0);
    }
  }, [transaction, reset]);

  useEffect(() => {
    setValue("amount", amount);
  }, [amount, setValue]);

  const handleAddCustomCategory = async () => {
    if (!customCategoryInput.trim()) {
      toast.error("Digite um nome para a categoria");
      return;
    }

    try {
      // Salvar categoria na API
      await createCategory.mutateAsync({
        name: customCategoryInput.trim(),
        type: type,
      });

      // Selecionar a categoria recém-criada
      setValue("category", customCategoryInput.trim());
      setCustomCategoryInput("");
      setAddingCustomCategory(false);
      toast.success("Categoria criada com sucesso!");
    } catch (error: any) {
      // Se a categoria já existe, apenas seleciona ela
      if (error?.response?.status === 400) {
        setValue("category", customCategoryInput.trim());
        setCustomCategoryInput("");
        setAddingCustomCategory(false);
        toast.info("Categoria selecionada!");
      } else {
        toast.error("Erro ao criar categoria");
      }
    }
  };

  const onSubmit = async (data: TransactionFormData) => {
    try {
      if (isEditing) {
        await updateTransaction.mutateAsync({ id: transaction.id, data });
        toast.success("Lançamento atualizado com sucesso!");
      } else {
        await createTransaction.mutateAsync({
          description: data.description,
          category: data.category,
          date: data.date,
          amount: data.amount,
          type: data.type as "income" | "expense",
          account_id: data.account_id,
        });
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
      <DialogContent className="max-w-[95vw] sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">{isEditing ? "Editar Lançamento" : "Novo Lançamento"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Edite os detalhes do seu lançamento." : "Preencha os dados para criar um novo lançamento."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
          <div className="space-y-2">
            <Label htmlFor="type" className="text-sm font-medium">
              Tipo de Lançamento
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant={type === "income" ? "default" : "outline"}
                className="h-14 flex flex-col items-center justify-center gap-1"
                onClick={() => setValue("type", "income")}
              >
                <TrendingUp className="h-5 w-5" />
                <span className="text-xs">Receita</span>
              </Button>
              <Button
                type="button"
                variant={type === "expense" ? "default" : "outline"}
                className="h-14 flex flex-col items-center justify-center gap-1"
                onClick={() => setValue("type", "expense")}
              >
                <TrendingDown className="h-5 w-5" />
                <span className="text-xs">Despesa</span>
              </Button>
            </div>
            {errors.type && (
              <p className="text-sm text-destructive flex items-center gap-1">
                {errors.type.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-medium">
              Valor
            </Label>
            <CurrencyInput
              id="amount"
              value={amount}
              onChange={setAmount}
              placeholder="0,00"
            />
            {errors.amount && (
              <p className="text-sm text-destructive flex items-center gap-1">
                {errors.amount.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Descrição
            </Label>
            <Input
              id="description"
              placeholder={type === "income" ? "Ex: Salário, Freelance..." : "Ex: Mercado, Aluguel..."}
              className="h-11"
              autoComplete="off"
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-destructive flex items-center gap-1">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="category" className="text-sm font-medium">
                Categoria
              </Label>
              {!addingCustomCategory && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => setAddingCustomCategory(true)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Nova
                </Button>
              )}
            </div>

            {addingCustomCategory ? (
              <div className="flex gap-2">
                <Input
                  placeholder="Nome da nova categoria"
                  value={customCategoryInput}
                  onChange={(e) => setCustomCategoryInput(e.target.value)}
                  className="h-11"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCustomCategory();
                    } else if (e.key === "Escape") {
                      setAddingCustomCategory(false);
                      setCustomCategoryInput("");
                    }
                  }}
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddCustomCategory}
                  className="h-11"
                >
                  Adicionar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setAddingCustomCategory(false);
                    setCustomCategoryInput("");
                  }}
                  className="h-11"
                >
                  Cancelar
                </Button>
              </div>
            ) : (
              <Select
                value={selectedCategory}
                onValueChange={(value) => setValue("category", value)}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {errors.category && (
              <p className="text-sm text-destructive flex items-center gap-1">
                {errors.category.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm font-medium">
                Data
              </Label>
              <Input
                id="date"
                type="date"
                className="h-11"
                {...register("date")}
              />
              {errors.date && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  {errors.date.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="account_id" className="text-sm font-medium">
                Conta (opcional)
              </Label>
              <Select
                value={watch("account_id")?.toString() || "none"}
                onValueChange={(value) => setValue("account_id", value === "none" ? undefined : parseInt(value))}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Nenhuma conta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma</SelectItem>
                  {accounts?.map((account) => (
                    <SelectItem key={account.id} value={account.id.toString()}>
                      {account.name} - {account.bank}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
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


