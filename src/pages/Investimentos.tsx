import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, Edit, Trash2 } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { useInvestments, useDeleteInvestment, Investment } from "@/hooks/use-api";
import { InvestmentForm } from "@/components/forms/InvestmentForm";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-muted-foreground">Carregando investimentos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Investimentos</h1>
          <p className="text-muted-foreground">Acompanhe seus investimentos e rentabilidade</p>
        </div>
        <Button
          className="bg-gradient-primary hover:bg-primary-hover"
          onClick={handleNewInvestment}
        >
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
          {investments && investments.length > 0 ? (
            investments.map((investment) => (
              <div
                key={investment.id}
                className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="h-12 w-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: investment.color || "#10B981" }}
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
                      investment.return_rate >= 0 ? "text-success" : "text-destructive"
                    }`}
                  >
                    {investment.return_rate >= 0 ? "+" : ""}
                    {investment.return_rate.toFixed(2)}%
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEdit(investment)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      setInvestmentToDelete(investment.id);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-center py-8">
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
