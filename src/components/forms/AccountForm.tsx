import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { ColorPicker } from "@/components/ui/color-picker";
import { CurrencyInput } from "@/components/ui/currency-input";
import { useCreateAccount, useUpdateAccount, Account } from "@/hooks/use-api";
import { toast } from "sonner";

const accountSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  bank: z.string().min(1, "Banco é obrigatório"),
  balance: z.number().min(0, "Saldo deve ser positivo"),
  investments: z.number().min(0, "Investimentos devem ser positivos"),
  color: z.string().optional(),
});

type AccountFormData = z.infer<typeof accountSchema>;

interface AccountFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account?: Account;
}

export function AccountForm({ open, onOpenChange, account }: AccountFormProps) {
  const isEditing = !!account;
  const createAccount = useCreateAccount();
  const updateAccount = useUpdateAccount();

  const [selectedColor, setSelectedColor] = useState(account?.color || "#10B981");
  const [balance, setBalance] = useState(account?.balance || 0);
  const [investments, setInvestments] = useState(account?.investments || 0);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: account?.name || "",
      bank: account?.bank || "",
      balance: account?.balance || 0,
      investments: account?.investments || 0,
      color: account?.color || "#10B981",
    },
  });

  useEffect(() => {
    if (account) {
      reset({
        name: account.name,
        bank: account.bank,
        balance: account.balance,
        investments: account.investments,
        color: account.color || "#10B981",
      });
      setSelectedColor(account.color || "#10B981");
      setBalance(account.balance || 0);
      setInvestments(account.investments || 0);
    } else {
      reset({
        name: "",
        bank: "",
        balance: 0,
        investments: 0,
        color: "#10B981",
      });
      setSelectedColor("#10B981");
      setBalance(0);
      setInvestments(0);
    }
  }, [account, reset]);

  useEffect(() => {
    setValue("color", selectedColor);
  }, [selectedColor, setValue]);

  useEffect(() => {
    setValue("balance", balance);
  }, [balance, setValue]);

  useEffect(() => {
    setValue("investments", investments);
  }, [investments, setValue]);

  const onSubmit = async (data: AccountFormData) => {
    try {
      if (isEditing) {
        await updateAccount.mutateAsync({ id: account.id, data });
        toast.success("Conta atualizada com sucesso!");
      } else {
        await createAccount.mutateAsync(data);
        toast.success("Conta criada com sucesso!");
      }
      onOpenChange(false);
      reset();
    } catch (error) {
      toast.error(isEditing ? "Erro ao atualizar conta" : "Erro ao criar conta");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">{isEditing ? "Editar Conta" : "Nova Conta"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Edite os detalhes da sua conta." : "Preencha os dados para criar uma nova conta."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Nome da Conta
            </Label>
            <Input
              id="name"
              placeholder="Ex: Conta Corrente, Poupança..."
              className="h-11"
              autoComplete="off"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-destructive flex items-center gap-1">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bank" className="text-sm font-medium">
              Banco
            </Label>
            <Input
              id="bank"
              placeholder="Ex: Nubank, Inter, Itaú..."
              className="h-11"
              autoComplete="off"
              {...register("bank")}
            />
            {errors.bank && (
              <p className="text-sm text-destructive flex items-center gap-1">
                {errors.bank.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="balance" className="text-sm font-medium">
              Saldo Disponível
            </Label>
            <CurrencyInput
              id="balance"
              value={balance}
              onChange={setBalance}
              placeholder="0,00"
            />
            {errors.balance && (
              <p className="text-sm text-destructive flex items-center gap-1">
                {errors.balance.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="investments" className="text-sm font-medium">
              Investimentos
            </Label>
            <CurrencyInput
              id="investments"
              value={investments}
              onChange={setInvestments}
              placeholder="0,00"
            />
            {errors.investments && (
              <p className="text-sm text-destructive flex items-center gap-1">
                {errors.investments.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Valor total investido nesta conta
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Cor da Conta</Label>
            <ColorPicker value={selectedColor} onChange={setSelectedColor} />
            {errors.color && (
              <p className="text-sm text-destructive flex items-center gap-1">
                {errors.color.message}
              </p>
            )}
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

