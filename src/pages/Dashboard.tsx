import { useState } from "react";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/StatCard";
import { AccountCard } from "@/components/AccountCard";
import { CreditCardCard } from "@/components/CreditCardCard";
import { TransactionItem } from "@/components/TransactionItem";
import { Wallet, TrendingUp, TrendingDown, DollarSign, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Dashboard = () => {
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
  ]);

  const [cards] = useState([
    {
      id: 1,
      name: "Banco do Brasil GOLD4760",
      bank: "OUROCARD VISA INTERNATIONAL",
      used: 0,
      limit: 80000,
      color: "#FCD34D",
    },
    {
      id: 2,
      name: "Sicoob B620",
      bank: "SICOOB MASTERCARD CLÁSSICO PRO",
      used: 0,
      limit: 815000,
      color: "#3B82F6",
    },
  ]);

  const [transactions] = useState([
    {
      id: 1,
      description: "Salário Outubro",
      category: "Renda",
      date: "2025-10-01",
      amount: 5000,
      type: "income" as const,
    },
    {
      id: 2,
      description: "Mercado",
      category: "Despesas obrigatórias",
      date: "2025-10-05",
      amount: -350,
      type: "expense" as const,
    },
    {
      id: 3,
      description: "Aluguel",
      category: "Despesas obrigatórias",
      date: "2025-10-10",
      amount: -1200,
      type: "expense" as const,
    },
  ]);

  const totalBalance = 11163.95;
  const totalInvestments = 981.47;
  const totalIncome = 5000;
  const totalExpenses = 1550;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral das suas finanças</p>
        </div>
        <Button className="bg-gradient-primary hover:bg-primary-hover">
          <Plus className="mr-2 h-4 w-4" />
          Novo Lançamento
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Saldo Total"
          value={`R$ ${totalBalance.toFixed(2)}`}
          icon={Wallet}
          variant="default"
        />
        <StatCard
          title="Investimentos"
          value={`R$ ${totalInvestments.toFixed(2)}`}
          icon={TrendingUp}
          variant="success"
          trend={{ value: "12.5%", isPositive: true }}
        />
        <StatCard
          title="Receitas do Mês"
          value={`R$ ${totalIncome.toFixed(2)}`}
          icon={DollarSign}
          variant="success"
        />
        <StatCard
          title="Despesas do Mês"
          value={`R$ ${totalExpenses.toFixed(2)}`}
          icon={TrendingDown}
          variant="destructive"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Contas Bancárias</CardTitle>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {accounts.map((account) => (
              <AccountCard key={account.id} {...account} />
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Cartões de Crédito</CardTitle>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {cards.map((card) => (
              <CreditCardCard key={card.id} {...card} />
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Últimas Transações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {transactions.map((transaction) => (
            <TransactionItem key={transaction.id} {...transaction} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
