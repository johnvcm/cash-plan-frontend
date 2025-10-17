import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Target, Edit, Trash2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useGoals, useDeleteGoal, Goal } from "@/hooks/use-api";
import { GoalForm } from "@/components/forms/GoalForm";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { toast } from "sonner";

const Metas = () => {
  const { data: goals, isLoading } = useGoals();
  const deleteGoal = useDeleteGoal();
  
  const [formOpen, setFormOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<number | null>(null);

  const handleEdit = (goal: Goal) => {
    setSelectedGoal(goal);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (goalToDelete) {
      try {
        await deleteGoal.mutateAsync(goalToDelete);
        toast.success("Meta deletada com sucesso!");
        setDeleteDialogOpen(false);
        setGoalToDelete(null);
      } catch (error) {
        toast.error("Erro ao deletar meta");
      }
    }
  };

  const handleNewGoal = () => {
    setSelectedGoal(undefined);
    setFormOpen(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const calculateProgress = (current: number, target: number) => {
    return (current / target) * 100;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-muted-foreground">Carregando metas...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Metas Financeiras</h1>
          <p className="text-muted-foreground">Defina e acompanhe suas metas</p>
        </div>
        <Button
          className="bg-gradient-primary hover:bg-primary-hover"
          onClick={handleNewGoal}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nova Meta
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="shadow-card">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Total de Metas</p>
            <p className="text-3xl font-bold text-foreground mt-2">{goals?.length || 0}</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Progresso Médio</p>
            <p className="text-3xl font-bold text-primary mt-2">
              {goals && goals.length > 0
                ? (
                    goals.reduce((sum, goal) => sum + calculateProgress(goal.current, goal.target), 0) /
                    goals.length
                  ).toFixed(1)
                : "0.0"}
              %
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Minhas Metas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {goals && goals.length > 0 ? (
            goals.map((goal) => {
              const progress = calculateProgress(goal.current, goal.target);
              const remaining = goal.target - goal.current;

              return (
                <div key={goal.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-10 w-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: goal.color || "#10B981" }}
                    >
                      <Target className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{goal.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Meta: {formatCurrency(goal.target)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold text-foreground">{formatCurrency(goal.current)}</p>
                      <p className="text-sm text-muted-foreground">{progress.toFixed(1)}%</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(goal)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setGoalToDelete(goal.id);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    Faltam {formatCurrency(remaining)} para atingir a meta
                  </p>
                </div>
              </div>
            );
            })
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Nenhuma meta cadastrada
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-card bg-gradient-card">
        <CardHeader>
          <CardTitle>Dica para suas Metas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Para atingir suas metas mais rapidamente, considere aplicar uma porcentagem fixa do seu
            salário mensalmente. Com disciplina e planejamento, você pode realizar seus sonhos!
          </p>
        </CardContent>
      </Card>

      <GoalForm
        open={formOpen}
        onOpenChange={setFormOpen}
        goal={selectedGoal}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Deletar Meta"
        description="Tem certeza que deseja deletar esta meta? Esta ação não pode ser desfeita."
        isLoading={deleteGoal.isPending}
      />
    </div>
  );
};

export default Metas;
