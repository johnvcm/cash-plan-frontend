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
import { useCreateCreditCard, useUpdateCreditCard, CreditCard } from "@/hooks/use-api";
import { toast } from "sonner";

const creditCardSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  bank: z.string().min(1, "Bandeira/Banco é obrigatório"),
  used: z.number().min(0, "Valor utilizado deve ser positivo"),
  limit: z.number().min(0, "Limite deve ser positivo"),
  color: z.string().optional(),
});

type CreditCardFormData = z.infer<typeof creditCardSchema>;

interface CreditCardFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card?: CreditCard;
}

export function CreditCardForm({ open, onOpenChange, card }: CreditCardFormProps) {
  const isEditing = !!card;
  const createCard = useCreateCreditCard();
  const updateCard = useUpdateCreditCard();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreditCardFormData>({
    resolver: zodResolver(creditCardSchema),
    defaultValues: {
      name: card?.name || "",
      bank: card?.bank || "",
      used: card?.used || 0,
      limit: card?.limit || 0,
      color: card?.color || "#3B82F6",
    },
  });

  useEffect(() => {
    if (card) {
      reset({
        name: card.name,
        bank: card.bank,
        used: card.used,
        limit: card.limit,
        color: card.color || "#3B82F6",
      });
    } else {
      reset({
        name: "",
        bank: "",
        used: 0,
        limit: 0,
        color: "#3B82F6",
      });
    }
  }, [card, reset]);

  const onSubmit = async (data: CreditCardFormData) => {
    try {
      if (isEditing) {
        await updateCard.mutateAsync({ id: card.id, data });
        toast.success("Cartão atualizado com sucesso!");
      } else {
        await createCard.mutateAsync(data);
        toast.success("Cartão criado com sucesso!");
      }
      onOpenChange(false);
      reset();
    } catch (error) {
      toast.error(isEditing ? "Erro ao atualizar cartão" : "Erro ao criar cartão");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Cartão" : "Novo Cartão"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Cartão</Label>
            <Input
              id="name"
              placeholder="Ex: Nubank 1234"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bank">Bandeira/Banco</Label>
            <Input
              id="bank"
              placeholder="Ex: Mastercard, Visa"
              {...register("bank")}
            />
            {errors.bank && (
              <p className="text-sm text-destructive">{errors.bank.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="limit">Limite (em centavos)</Label>
            <Input
              id="limit"
              type="number"
              placeholder="Ex: 100000 = R$ 1.000,00"
              {...register("limit", { valueAsNumber: true })}
            />
            {errors.limit && (
              <p className="text-sm text-destructive">{errors.limit.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Digite o valor em centavos (ex: 100000 = R$ 1.000,00)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="used">Utilizado (em centavos)</Label>
            <Input
              id="used"
              type="number"
              placeholder="Ex: 50000 = R$ 500,00"
              {...register("used", { valueAsNumber: true })}
            />
            {errors.used && (
              <p className="text-sm text-destructive">{errors.used.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Digite o valor em centavos (ex: 50000 = R$ 500,00)
            </p>
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

