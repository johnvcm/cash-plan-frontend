import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Target, Edit, Trash2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useGoals, useDeleteGoal, useAccounts, Goal } from "@/hooks/use-api";
import { GoalForm } from "@/components/forms/GoalForm";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { formatCurrency } from "@/lib/format";
import { toast } from "sonner";

const Metas = () => {
  const { data: goals, isLoading } = useGoals();
  const { data: accounts, isLoading: loadingAccounts } = useAccounts();
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

  // Calcular saldo total das contas (contas correntes + investimentos)
  const totalBalance = accounts?.reduce((sum, acc) => sum + acc.balance + acc.investments, 0) || 0;

  const calculateProgress = (current: number, target: number) => {
    return (current / target) * 100;
  };

  if (isLoading || loadingAccounts) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-muted-foreground">Carregando metas...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Metas Financeiras</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Defina e acompanhe suas metas</p>
        </div>
        <Button
          className="bg-gradient-primary hover:bg-primary-hover w-full sm:w-auto"
          onClick={handleNewGoal}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nova Meta
        </Button>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2">
        <Card className="shadow-card">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Total de Metas</p>
            <p className="text-3xl font-bold text-foreground mt-2">{goals?.length || 0}</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Saldo Total Disponível</p>
            <p className="text-3xl font-bold text-success mt-2">
              {formatCurrency(totalBalance)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Minhas Metas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          {goals && goals.length > 0 ? (
            goals.map((goal) => {
              // Usar saldo total das contas como valor atual
              const currentValue = totalBalance;
              const progress = calculateProgress(currentValue, goal.target);
              const remaining = goal.target - currentValue;

              return (
                <div key={goal.id} className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: goal.color || "#10B981" }}
                    >
                      <Target className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">{goal.name}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Meta: {formatCurrency(goal.target)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    <div className="text-left sm:text-right">
                      <p className="font-semibold text-foreground text-sm sm:text-base">{formatCurrency(currentValue)}</p>
                      <p className={`text-xs sm:text-sm font-medium ${progress >= 100 ? "text-success" : "text-muted-foreground"}`}>
                        {progress.toFixed(1)}%
                      </p>
                    </div>
                    <div className="flex gap-1 sm:gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEdit(goal)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
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
                  <Progress value={Math.min(progress, 100)} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {remaining > 0 
                      ? `Faltam ${formatCurrency(remaining)} para atingir a meta`
                      : `Meta atingida! Você tem ${formatCurrency(Math.abs(remaining))} a mais`
                    }
                  </p>
                </div>
              </div>
            );
            })
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
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
