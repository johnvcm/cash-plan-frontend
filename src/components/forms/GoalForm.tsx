import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { useCreateGoal, useUpdateGoal, Goal } from "@/hooks/use-api";
import { toast } from "sonner";

const goalSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  target: z.number().min(0, "Meta deve ser positiva"),
  current: z.number().min(0, "Valor atual deve ser positivo"),
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

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: goal?.name || "",
      target: goal?.target || 0,
      current: goal?.current || 0,
      color: goal?.color || "#10B981",
    },
  });

  useEffect(() => {
    if (goal) {
      reset({
        name: goal.name,
        target: goal.target,
        current: goal.current,
        color: goal.color || "#10B981",
      });
    } else {
      reset({
        name: "",
        target: 0,
        current: 0,
        color: "#10B981",
      });
    }
  }, [goal, reset]);

  const onSubmit = async (data: GoalFormData) => {
    try {
      if (isEditing) {
        await updateGoal.mutateAsync({ id: goal.id, data });
        toast.success("Meta atualizada com sucesso!");
      } else {
        await createGoal.mutateAsync({
          name: data.name,
          target: data.target,
          current: data.current,
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Meta" : "Nova Meta"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Meta</Label>
            <Input
              id="name"
              placeholder="Ex: Fundo de Emergência"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="target">Valor Alvo</Label>
            <Input
              id="target"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register("target", { valueAsNumber: true })}
            />
            {errors.target && (
              <p className="text-sm text-destructive">{errors.target.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="current">Valor Atual</Label>
            <Input
              id="current"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register("current", { valueAsNumber: true })}
            />
            {errors.current && (
              <p className="text-sm text-destructive">{errors.current.message}</p>
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

