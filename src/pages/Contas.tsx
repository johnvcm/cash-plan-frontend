import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AccountCard } from "@/components/AccountCard";
import { Plus } from "lucide-react";

const Contas = () => {
  const [accounts] = useState([
    {
      id: 1,
      name: "Banco do Brasil",
      bank: "Banco do Brasil",
      balance: "R$ 1.978,26",
      investments: "R$ 0,00",
      color: "#FCD34D",
    },
    {
      id: 2,
      name: "Sicoob",
      bank: "Sicoob",
      balance: "R$ 460,75",
      investments: "R$ 981,47",
      color: "#10B981",
    },
    {
      id: 3,
      name: "Nubank",
      bank: "Nubank",
      balance: "R$ 3.250,00",
      investments: "R$ 5.000,00",
      color: "#8B5CF6",
    },
  ]);

  const totalBalance = accounts.reduce((sum, acc) => {
    const balance = parseFloat(acc.balance.replace("R$ ", "").replace(".", "").replace(",", "."));
    return sum + balance;
  }, 0);

  const totalInvestments = accounts.reduce((sum, acc) => {
    const investments = parseFloat(
      acc.investments.replace("R$ ", "").replace(".", "").replace(",", ".")
    );
    return sum + investments;
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Minhas Contas</h1>
          <p className="text-muted-foreground">Gerencie suas contas bancárias</p>
        </div>
        <Button className="bg-gradient-primary hover:bg-primary-hover">
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Conta
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="shadow-card">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Total em contas correntes</p>
            <p className="text-3xl font-bold text-foreground mt-2">
              R$ {totalBalance.toFixed(2).replace(".", ",")}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Total em investimentos</p>
            <p className="text-3xl font-bold text-success mt-2">
              R$ {totalInvestments.toFixed(2).replace(".", ",")}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Contas Bancárias</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {accounts.map((account) => (
            <AccountCard key={account.id} {...account} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default Contas;
