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
import { useCreateShoppingList, useUpdateShoppingList, ShoppingList } from "@/hooks/use-api";
import { toast } from "sonner";

const shoppingListSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  month: z.string().optional(),
});

type ShoppingListFormData = z.infer<typeof shoppingListSchema>;

interface ShoppingListFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  list?: ShoppingList;
}

export function ShoppingListForm({ open, onOpenChange, list }: ShoppingListFormProps) {
  const isEditing = !!list;
  const createList = useCreateShoppingList();
  const updateList = useUpdateShoppingList();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ShoppingListFormData>({
    resolver: zodResolver(shoppingListSchema),
    defaultValues: {
      name: list?.name || "",
      month: list?.month || getCurrentMonth(),
    },
  });

  useEffect(() => {
    if (list) {
      reset({
        name: list.name,
        month: list.month || getCurrentMonth(),
      });
    } else {
      reset({
        name: "",
        month: getCurrentMonth(),
      });
    }
  }, [list, reset]);

  function getCurrentMonth() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }

  const onSubmit = async (data: ShoppingListFormData) => {
    try {
      console.log("📝 Dados do formulário:", data);
      
      if (isEditing) {
        await updateList.mutateAsync({
          id: list.id,
          data: {
            name: data.name,
            month: data.month || null, // Garantir que vazio vira null
          },
        });
        toast.success("Lista atualizada com sucesso!");
      } else {
        const listData = {
          name: data.name,
          month: data.month || null, // Garantir que vazio vira null
          status: "active" as const,
          total_estimated: 0,
          total_spent: 0,
          items: [],
        };
        console.log("📤 Enviando para backend:", listData);
        await createList.mutateAsync(listData);
        toast.success("Lista criada com sucesso!");
      }
      onOpenChange(false);
      reset();
    } catch (error) {
      console.error("❌ Erro ao salvar lista:", error);
      toast.error(isEditing ? "Erro ao atualizar lista" : "Erro ao criar lista");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            {isEditing ? "Editar Lista" : "Nova Lista de Compras"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Edite o nome e mês da sua lista."
              : "Crie uma nova lista para organizar suas compras."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Nome da Lista
            </Label>
            <Input
              id="name"
              placeholder="Ex: Compras do Mês, Feira Semanal..."
              className="h-11"
              autoComplete="off"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-destructive flex items-center gap-1">
                {errors.name.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Dê um nome descritivo para sua lista
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="month" className="text-sm font-medium">
              Mês de Referência
            </Label>
            <Input
              id="month"
              type="month"
              className="h-11"
              {...register("month")}
            />
            {errors.month && (
              <p className="text-sm text-destructive flex items-center gap-1">
                {errors.month.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Opcional: para organizar listas por período
            </p>
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
                : "Criar Lista"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

