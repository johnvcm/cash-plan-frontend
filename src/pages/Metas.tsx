import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const Metas = () => {
  const goals = [
    {
      name: "Fundo de Emergência",
      target: 30000,
      current: 18500,
      color: "#10B981",
    },
    {
      name: "Viagem para Europa",
      target: 15000,
      current: 8200,
      color: "#3B82F6",
    },
    {
      name: "Curso de Especialização",
      target: 5000,
      current: 3800,
      color: "#8B5CF6",
    },
    {
      name: "Carro Novo",
      target: 50000,
      current: 12000,
      color: "#F59E0B",
    },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const calculateProgress = (current: number, target: number) => {
    return (current / target) * 100;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Metas Financeiras</h1>
          <p className="text-muted-foreground">Defina e acompanhe suas metas</p>
        </div>
        <Button className="bg-gradient-primary hover:bg-primary-hover">
          <Plus className="mr-2 h-4 w-4" />
          Nova Meta
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="shadow-card">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Total de Metas</p>
            <p className="text-3xl font-bold text-foreground mt-2">{goals.length}</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Progresso Médio</p>
            <p className="text-3xl font-bold text-primary mt-2">
              {(
                goals.reduce((sum, goal) => sum + calculateProgress(goal.current, goal.target), 0) /
                goals.length
              ).toFixed(1)}
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
          {goals.map((goal, index) => {
            const progress = calculateProgress(goal.current, goal.target);
            const remaining = goal.target - goal.current;

            return (
              <div key={index} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-10 w-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: goal.color }}
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
                  <div className="text-right">
                    <p className="font-semibold text-foreground">{formatCurrency(goal.current)}</p>
                    <p className="text-sm text-muted-foreground">{progress.toFixed(1)}%</p>
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
          })}
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
    </div>
  );
};

export default Metas;
