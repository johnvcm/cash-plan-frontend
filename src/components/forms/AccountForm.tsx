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

  const {
    register,
    handleSubmit,
    reset,
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
    } else {
      reset({
        name: "",
        bank: "",
        balance: 0,
        investments: 0,
        color: "#10B981",
      });
    }
  }, [account, reset]);

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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Conta" : "Nova Conta"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Conta</Label>
            <Input
              id="name"
              placeholder="Ex: Conta Corrente"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bank">Banco</Label>
            <Input
              id="bank"
              placeholder="Ex: Banco do Brasil"
              {...register("bank")}
            />
            {errors.bank && (
              <p className="text-sm text-destructive">{errors.bank.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="balance">Saldo</Label>
            <Input
              id="balance"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register("balance", { valueAsNumber: true })}
            />
            {errors.balance && (
              <p className="text-sm text-destructive">{errors.balance.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="investments">Investimentos</Label>
            <Input
              id="investments"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register("investments", { valueAsNumber: true })}
            />
            {errors.investments && (
              <p className="text-sm text-destructive">{errors.investments.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">Cor</Label>
            <Input
              id="color"
              type="color"
              {...register("color")}
            />
            {errors.color && (
              <p className="text-sm text-destructive">{errors.color.message}</p>
            )}
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

