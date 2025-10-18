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
import { useCreateGoal, useUpdateGoal, Goal } from "@/hooks/use-api";
import { toast } from "sonner";

const goalSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  target: z.number().positive("Meta deve ser maior que zero"),
  color: z.string().default("#10B981"),
});

type GoalFormData = z.infer<typeof goalSchema>;

interface GoalFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal?: Goal;
}

export function GoalForm({ open, onOpenChange, goal }: GoalFormProps) {
  const isEditing = !!goal;
  const createGoal = useCreateGoal();
  const updateGoal = useUpdateGoal();

  const [selectedColor, setSelectedColor] = useState(goal?.color || "#10B981");
  const [target, setTarget] = useState(goal?.target || 0);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: goal?.name || "",
      target: goal?.target || 0,
      color: goal?.color || "#10B981",
    },
  });

  useEffect(() => {
    if (goal) {
      reset({
        name: goal.name,
        target: goal.target,
        color: goal.color || "#10B981",
      });
      setSelectedColor(goal.color || "#10B981");
      setTarget(goal.target || 0);
    } else {
      reset({
        name: "",
        target: 0,
        color: "#10B981",
      });
      setSelectedColor("#10B981");
      setTarget(0);
    }
  }, [goal, reset]);

  useEffect(() => {
    setValue("color", selectedColor);
  }, [selectedColor, setValue]);

  useEffect(() => {
    setValue("target", target);
  }, [target, setValue]);

  const onSubmit = async (data: GoalFormData) => {
    try {
      if (isEditing) {
        await updateGoal.mutateAsync({ 
          id: goal.id, 
          data: {
            ...data,
            current: goal.current, // Manter valor atual existente
          }
        });
        toast.success("Meta atualizada com sucesso!");
      } else {
        await createGoal.mutateAsync({
          name: data.name,
          target: data.target,
          current: 0, // Iniciar com 0, será calculado automaticamente na página
          color: data.color || "#10B981",
        });
        toast.success("Meta criada com sucesso!");
      }
      onOpenChange(false);
      reset();
    } catch (error) {
      toast.error(isEditing ? "Erro ao atualizar meta" : "Erro ao criar meta");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">{isEditing ? "Editar Meta" : "Nova Meta"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Edite os detalhes da sua meta." : "Preencha os dados para criar uma nova meta."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Nome da Meta
            </Label>
            <Input
              id="name"
              placeholder="Ex: Fundo de Emergência, Viagem..."
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
            <Label htmlFor="target" className="text-sm font-medium">
              Valor Alvo
            </Label>
            <CurrencyInput
              id="target"
              value={target}
              onChange={setTarget}
              placeholder="0,00"
            />
            {errors.target && (
              <p className="text-sm text-destructive flex items-center gap-1">
                {errors.target.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              O progresso será calculado automaticamente baseado no saldo total das suas contas
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Cor da Meta</Label>
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

