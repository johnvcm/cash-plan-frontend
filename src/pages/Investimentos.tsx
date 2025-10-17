import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/StatCard";

const Investimentos = () => {
  const investments = [
    {
      name: "Tesouro Selic 2029",
      type: "Renda Fixa",
      value: 5000,
      return: 12.5,
      color: "#10B981",
    },
    {
      name: "CDB Banco X",
      type: "Renda Fixa",
      value: 3000,
      return: 10.2,
      color: "#3B82F6",
    },
    {
      name: "Ações PETR4",
      type: "Renda Variável",
      value: 2500,
      return: -5.3,
      color: "#8B5CF6",
    },
    {
      name: "Fundos Imobiliários",
      type: "Renda Variável",
      value: 1500,
      return: 8.7,
      color: "#F59E0B",
    },
  ];

  const totalInvested = investments.reduce((sum, inv) => sum + inv.value, 0);
  const averageReturn = investments.reduce((sum, inv) => sum + inv.return, 0) / investments.length;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Investimentos</h1>
          <p className="text-muted-foreground">Acompanhe seus investimentos e rentabilidade</p>
        </div>
        <Button className="bg-gradient-primary hover:bg-primary-hover">
          <Plus className="mr-2 h-4 w-4" />
          Novo Investimento
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Total Investido"
          value={formatCurrency(totalInvested)}
          icon={TrendingUp}
          variant="success"
        />
        <Card className="shadow-card">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Rentabilidade Média</p>
            <p className={`text-2xl font-bold mt-2 ${averageReturn >= 0 ? "text-success" : "text-destructive"}`}>
              {averageReturn >= 0 ? "+" : ""}{averageReturn.toFixed(2)}%
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Projeção 12 meses</p>
            <p className="text-2xl font-bold text-success mt-2">
              {formatCurrency(totalInvested * 1.12)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Distribuição por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Renda Fixa</span>
                  <span className="text-sm font-medium">66.7%</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-success" style={{ width: "66.7%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Renda Variável</span>
                  <span className="text-sm font-medium">33.3%</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-primary" style={{ width: "33.3%" }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Projeção de Crescimento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[6, 12, 24, 36].map((months) => {
                const projection = totalInvested * Math.pow(1 + averageReturn / 100 / 12, months);
                return (
                  <div key={months} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium">{months} meses</span>
                    <span className="font-semibold text-success">{formatCurrency(projection)}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Meus Investimentos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {investments.map((investment, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div
                  className="h-12 w-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: investment.color }}
                >
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{investment.name}</p>
                  <p className="text-sm text-muted-foreground">{investment.type}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-foreground">{formatCurrency(investment.value)}</p>
                <p
                  className={`text-sm font-medium ${
                    investment.return >= 0 ? "text-success" : "text-destructive"
                  }`}
                >
                  {investment.return >= 0 ? "+" : ""}
                  {investment.return.toFixed(2)}%
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default Investimentos;
