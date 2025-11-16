import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, Edit, Trash2, PiggyBank } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { useInvestments, useDeleteInvestment, Investment } from "@/hooks/use-api";
import { InvestmentForm } from "@/components/forms/InvestmentForm";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { formatCurrency, formatNumber } from "@/lib/format";
import { toast } from "sonner";

const Investimentos = () => {
  const { data: investments, isLoading } = useInvestments();
  const deleteInvestment = useDeleteInvestment();
  
  const [formOpen, setFormOpen] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [investmentToDelete, setInvestmentToDelete] = useState<number | null>(null);

  const handleEdit = (investment: Investment) => {
    setSelectedInvestment(investment);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (investmentToDelete) {
      try {
        await deleteInvestment.mutateAsync(investmentToDelete);
        toast.success("Investimento deletado com sucesso!");
        setDeleteDialogOpen(false);
        setInvestmentToDelete(null);
      } catch (error) {
        toast.error("Erro ao deletar investimento");
      }
    }
  };

  const handleNewInvestment = () => {
    setSelectedInvestment(undefined);
    setFormOpen(true);
  };

  const totalInvested = investments?.reduce((sum, inv) => sum + inv.value, 0) || 0;
  const averageReturn = investments && investments.length > 0
    ? investments.reduce((sum, inv) => sum + inv.return_rate, 0) / investments.length
    : 0;

  // Calcular distribuição por tipo
  const rendaFixaTotal = investments?.filter(inv => inv.type === "Renda Fixa").reduce((sum, inv) => sum + inv.value, 0) || 0;
  const rendaVariavelTotal = investments?.filter(inv => inv.type === "Renda Variável").reduce((sum, inv) => sum + inv.value, 0) || 0;
  const rendaFixaPercent = totalInvested > 0 ? (rendaFixaTotal / totalInvested) * 100 : 0;
  const rendaVariavelPercent = totalInvested > 0 ? (rendaVariavelTotal / totalInvested) * 100 : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-muted-foreground">Carregando investimentos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Investimentos</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Acompanhe seus investimentos e rentabilidade</p>
        </div>
        <Button
          className="bg-gradient-primary hover:bg-primary-hover w-full sm:w-auto"
          onClick={handleNewInvestment}
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Investimento
        </Button>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        <StatCard
          title="Total Investido"
          value={formatCurrency(totalInvested)}
          icon={PiggyBank}
          variant="warning"
        />
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1 flex-1">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Rentabilidade Média</p>
                <p className={`text-xl sm:text-2xl font-bold ${averageReturn >= 0 ? "text-success" : "text-destructive"}`}>
                  {averageReturn >= 0 ? "+" : ""}{formatNumber(averageReturn, 2)}%
                </p>
              </div>
              <div className="rounded-full p-2 sm:p-3 flex-shrink-0 bg-background/50">
                <TrendingUp className={`h-5 w-5 sm:h-6 sm:w-6 ${averageReturn >= 0 ? "text-success" : "text-destructive"}`} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1 flex-1">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Projeção 12 meses</p>
                <p className="text-xl sm:text-2xl font-bold text-foreground">
                  {formatCurrency(totalInvested * (1 + averageReturn / 100))}
                </p>
              </div>
              <div className="rounded-full p-2 sm:p-3 flex-shrink-0 bg-primary/10">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Distribuição por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            {investments && investments.length > 0 ? (
              <div className="space-y-4">
                {rendaFixaTotal > 0 && (
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Renda Fixa</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{formatCurrency(rendaFixaTotal)}</span>
                        <span className="text-sm font-medium">{formatNumber(rendaFixaPercent, 1)}%</span>
                      </div>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-green-500 to-green-600" style={{ width: `${rendaFixaPercent}%` }}></div>
                    </div>
                  </div>
                )}
                {rendaVariavelTotal > 0 && (
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Renda Variável</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{formatCurrency(rendaVariavelTotal)}</span>
                        <span className="text-sm font-medium">{formatNumber(rendaVariavelPercent, 1)}%</span>
                      </div>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-primary" style={{ width: `${rendaVariavelPercent}%` }}></div>
                    </div>
                  </div>
                )}
                {investments.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum investimento cadastrado
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum investimento cadastrado
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Projeção de Crescimento</CardTitle>
          </CardHeader>
          <CardContent>
            {totalInvested > 0 ? (
              <div className="space-y-3">
                {[6, 12, 24, 36].map((months) => {
                  const monthlyRate = averageReturn / 100 / 12;
                  const projection = totalInvested * Math.pow(1 + monthlyRate, months);
                  const gain = projection - totalInvested;
                  return (
                    <div key={months} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{months} meses</span>
                        <span className="text-xs text-muted-foreground">
                          +{formatCurrency(gain)}
                        </span>
                      </div>
                      <span className={`font-semibold ${gain >= 0 ? "text-success" : "text-destructive"}`}>
                        {formatCurrency(projection)}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Adicione investimentos para ver as projeções
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Meus Investimentos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          {investments && investments.length > 0 ? (
            investments.map((investment) => (
              <div
                key={investment.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: investment.color || "#10B981" }}
                  >
                    <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{investment.name}</p>
                    <p className="text-sm text-muted-foreground">{investment.type}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                  <div className="text-left sm:text-right">
                    <p className="font-semibold text-foreground text-sm sm:text-base">{formatCurrency(investment.value)}</p>
                    <p
                      className={`text-xs sm:text-sm font-medium ${
                        investment.return_rate >= 0 ? "text-success" : "text-destructive"
                      }`}
                    >
                      {investment.return_rate >= 0 ? "+" : ""}
                      {formatNumber(investment.return_rate, 2)}% a.a.
                    </p>
                  </div>
                  <div className="flex gap-1 sm:gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEdit(investment)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        setInvestmentToDelete(investment.id);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhum investimento cadastrado
            </p>
          )}
        </CardContent>
      </Card>

      <InvestmentForm
        open={formOpen}
        onOpenChange={setFormOpen}
        investment={selectedInvestment}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Deletar Investimento"
        description="Tem certeza que deseja deletar este investimento? Esta ação não pode ser desfeita."
        isLoading={deleteInvestment.isPending}
      />
    </div>
  );
};

export default Investimentos;
