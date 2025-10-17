import { useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateInvestment, useUpdateInvestment, Investment } from "@/hooks/use-api";
import { toast } from "sonner";

const investmentSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  type: z.enum(["Renda Fixa", "Renda Variável"], { required_error: "Tipo é obrigatório" }),
  value: z.number().min(0, "Valor deve ser positivo"),
  return_rate: z.number(),
  color: z.string().optional(),
});

type InvestmentFormData = z.infer<typeof investmentSchema>;

interface InvestmentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  investment?: Investment;
}

export function InvestmentForm({ open, onOpenChange, investment }: InvestmentFormProps) {
  const isEditing = !!investment;
  const createInvestment = useCreateInvestment();
  const updateInvestment = useUpdateInvestment();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<InvestmentFormData>({
    resolver: zodResolver(investmentSchema),
    defaultValues: {
      name: investment?.name || "",
      type: investment?.type || "Renda Fixa",
      value: investment?.value || 0,
      return_rate: investment?.return_rate || 0,
      color: investment?.color || "#10B981",
    },
  });

  const type = watch("type");

  useEffect(() => {
    if (investment) {
      reset({
        name: investment.name,
        type: investment.type,
        value: investment.value,
        return_rate: investment.return_rate,
        color: investment.color || "#10B981",
      });
    } else {
      reset({
        name: "",
        type: "Renda Fixa",
        value: 0,
        return_rate: 0,
        color: "#10B981",
      });
    }
  }, [investment, reset]);

  const onSubmit = async (data: InvestmentFormData) => {
    try {
      if (isEditing) {
        await updateInvestment.mutateAsync({ id: investment.id, data });
        toast.success("Investimento atualizado com sucesso!");
      } else {
        await createInvestment.mutateAsync(data);
        toast.success("Investimento criado com sucesso!");
      }
      onOpenChange(false);
      reset();
    } catch (error) {
      toast.error(isEditing ? "Erro ao atualizar investimento" : "Erro ao criar investimento");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">{isEditing ? "Editar Investimento" : "Novo Investimento"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Edite os detalhes do seu investimento." : "Preencha os dados para criar um novo investimento."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Investimento</Label>
            <Input
              id="name"
              placeholder="Ex: Tesouro Selic 2029"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipo</Label>
            <Select
              value={type}
              onValueChange={(value) => setValue("type", value as "Renda Fixa" | "Renda Variável")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Renda Fixa">Renda Fixa</SelectItem>
                <SelectItem value="Renda Variável">Renda Variável</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-destructive">{errors.type.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="value">Valor Investido</Label>
            <Input
              id="value"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register("value", { valueAsNumber: true })}
            />
            {errors.value && (
              <p className="text-sm text-destructive">{errors.value.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="return_rate">Taxa de Retorno (%)</Label>
            <Input
              id="return_rate"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register("return_rate", { valueAsNumber: true })}
            />
            {errors.return_rate && (
              <p className="text-sm text-destructive">{errors.return_rate.message}</p>
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

