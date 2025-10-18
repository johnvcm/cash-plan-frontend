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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ColorPicker } from "@/components/ui/color-picker";
import { CurrencyInput } from "@/components/ui/currency-input";
import { useCreateInvestment, useUpdateInvestment, Investment } from "@/hooks/use-api";
import { toast } from "sonner";
import { TrendingUp, LineChart } from "lucide-react";

const investmentSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  type: z.enum(["Renda Fixa", "Renda Variável"], { required_error: "Tipo é obrigatório" }),
  value: z.number().positive("Valor deve ser maior que zero"),
  return_rate: z.number().min(-100, "Taxa não pode ser menor que -100%").max(1000, "Taxa não pode ser maior que 1000%"),
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

  const [selectedColor, setSelectedColor] = useState(investment?.color || "#10B981");
  const [value, setValue_] = useState(investment?.value || 0);
  const [returnRate, setReturnRate] = useState(investment?.return_rate || 0);

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
      setSelectedColor(investment.color || "#10B981");
      setValue_(investment.value || 0);
      setReturnRate(investment.return_rate || 0);
    } else {
      reset({
        name: "",
        type: "Renda Fixa",
        value: 0,
        return_rate: 0,
        color: "#10B981",
      });
      setSelectedColor("#10B981");
      setValue_(0);
      setReturnRate(0);
    }
  }, [investment, reset]);

  useEffect(() => {
    setValue("color", selectedColor);
  }, [selectedColor, setValue]);

  useEffect(() => {
    setValue("value", value);
  }, [value, setValue]);

  useEffect(() => {
    setValue("return_rate", returnRate);
  }, [returnRate, setValue]);

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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Nome do Investimento
            </Label>
            <Input
              id="name"
              placeholder="Ex: Tesouro Selic, Ações Petrobras..."
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
            <Label htmlFor="type" className="text-sm font-medium">
              Tipo de Investimento
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant={type === "Renda Fixa" ? "default" : "outline"}
                className="h-14 flex flex-col items-center justify-center gap-1"
                onClick={() => setValue("type", "Renda Fixa")}
              >
                <TrendingUp className="h-5 w-5" />
                <span className="text-xs">Renda Fixa</span>
              </Button>
              <Button
                type="button"
                variant={type === "Renda Variável" ? "default" : "outline"}
                className="h-14 flex flex-col items-center justify-center gap-1"
                onClick={() => setValue("type", "Renda Variável")}
              >
                <LineChart className="h-5 w-5" />
                <span className="text-xs">Renda Variável</span>
              </Button>
            </div>
            {errors.type && (
              <p className="text-sm text-destructive flex items-center gap-1">
                {errors.type.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="value" className="text-sm font-medium">
              Valor Investido
            </Label>
            <CurrencyInput
              id="value"
              value={value}
              onChange={setValue_}
              placeholder="0,00"
            />
            {errors.value && (
              <p className="text-sm text-destructive flex items-center gap-1">
                {errors.value.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="return_rate" className="text-sm font-medium">
              Taxa de Retorno (% ao ano)
            </Label>
            <div className="relative">
              <Input
                id="return_rate"
                type="number"
                inputMode="decimal"
                step="0.01"
                placeholder="0,00"
                className="h-11 pr-8"
                value={returnRate === 0 ? "" : returnRate}
                onChange={(e) => setReturnRate(parseFloat(e.target.value) || 0)}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                %
              </span>
            </div>
            {errors.return_rate && (
              <p className="text-sm text-destructive flex items-center gap-1">
                {errors.return_rate.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Rendimento anual esperado ou histórico
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Cor do Investimento</Label>
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

