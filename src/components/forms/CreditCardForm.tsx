import { useEffect, useState } from "react";
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
import { ColorPicker } from "@/components/ui/color-picker";
import { CurrencyInput } from "@/components/ui/currency-input";
import { useCreateCreditCard, useUpdateCreditCard, CreditCard } from "@/hooks/use-api";
import { formatCurrency, formatNumber } from "@/lib/format";
import { toast } from "sonner";

const creditCardSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  bank: z.string().min(1, "Bandeira/Banco é obrigatório"),
  used: z.number().min(0, "Valor utilizado deve ser positivo"),
  limit: z.number().min(0, "Limite deve ser positivo").refine(
    (val) => val > 0,
    "Limite deve ser maior que zero"
  ),
  color: z.string().default("#3B82F6"),
}).refine(
  (data) => data.used <= data.limit,
  {
    message: "Valor utilizado não pode ser maior que o limite",
    path: ["used"],
  }
);

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

  const [selectedColor, setSelectedColor] = useState(card?.color || "#3B82F6");
  const [used, setUsed] = useState((card?.used || 0) / 100); // Converter de centavos para reais
  const [limit, setLimit] = useState((card?.limit || 0) / 100);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
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
      setSelectedColor(card.color || "#3B82F6");
      setUsed((card.used || 0) / 100);
      setLimit((card.limit || 0) / 100);
    } else {
      reset({
        name: "",
        bank: "",
        used: 0,
        limit: 0,
        color: "#3B82F6",
      });
      setSelectedColor("#3B82F6");
      setUsed(0);
      setLimit(0);
    }
  }, [card, reset]);

  useEffect(() => {
    setValue("color", selectedColor);
  }, [selectedColor, setValue]);

  useEffect(() => {
    setValue("used", Math.round(used * 100)); // Converter para centavos
  }, [used, setValue]);

  useEffect(() => {
    setValue("limit", Math.round(limit * 100)); // Converter para centavos
  }, [limit, setValue]);

  const onSubmit = async (data: CreditCardFormData) => {
    try {
      if (isEditing) {
        await updateCard.mutateAsync({ id: card.id, data });
        toast.success("Cartão atualizado com sucesso!");
      } else {
        await createCard.mutateAsync({
          name: data.name,
          bank: data.bank,
          used: data.used,
          limit: data.limit,
          color: data.color || "#3B82F6",
        });
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
      <DialogContent className="max-w-[95vw] sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">{isEditing ? "Editar Cartão" : "Novo Cartão"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Edite os detalhes do seu cartão de crédito." : "Preencha os dados para criar um novo cartão de crédito."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Nome do Cartão
            </Label>
            <Input
              id="name"
              placeholder="Ex: Nubank Black, C6 Carbon..."
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
              Bandeira/Banco
            </Label>
            <Input
              id="bank"
              placeholder="Ex: Mastercard, Visa, Elo..."
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
            <Label htmlFor="limit" className="text-sm font-medium">
              Limite Total
            </Label>
            <CurrencyInput
              id="limit"
              value={limit}
              onChange={setLimit}
              placeholder="0,00"
            />
            {errors.limit && (
              <p className="text-sm text-destructive flex items-center gap-1">
                {errors.limit.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Limite total disponível no cartão
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="used" className="text-sm font-medium">
              Valor Utilizado
            </Label>
            <CurrencyInput
              id="used"
              value={used}
              onChange={setUsed}
              placeholder="0,00"
            />
            {errors.used && (
              <p className="text-sm text-destructive flex items-center gap-1">
                {errors.used.message}
              </p>
            )}
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                Disponível: {formatCurrency(limit - used)}
              </span>
              <span className={used > limit ? "text-destructive font-medium" : "text-muted-foreground"}>
                {formatNumber((used / limit) * 100, 0)}% utilizado
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Cor do Cartão</Label>
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

