import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TransactionItem } from "@/components/TransactionItem";
import { Plus, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Lancamentos = () => {
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
    {
      id: 4,
      description: "Freelance",
      category: "Renda Cliente",
      date: "2025-10-15",
      amount: 2500,
      type: "income" as const,
    },
    {
      id: 5,
      description: "Conta de Luz",
      category: "Despesas obrigatórias",
      date: "2025-10-08",
      amount: -180,
      type: "expense" as const,
    },
  ]);

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const balance = totalIncome - totalExpenses;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Lançamentos</h1>
          <p className="text-muted-foreground">Gerencie suas receitas e despesas</p>
        </div>
        <Button className="bg-gradient-primary hover:bg-primary-hover">
          <Plus className="mr-2 h-4 w-4" />
          Novo Lançamento
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-card">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Receitas</p>
            <p className="text-2xl font-bold text-success mt-2">
              R$ {totalIncome.toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Despesas</p>
            <p className="text-2xl font-bold text-destructive mt-2">
              R$ {totalExpenses.toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Saldo</p>
            <p className={`text-2xl font-bold mt-2 ${balance >= 0 ? "text-success" : "text-destructive"}`}>
              R$ {balance.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Todos os Lançamentos</CardTitle>
            <div className="flex gap-2">
              <Input placeholder="Buscar..." className="w-64" />
              <Select>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="income">Receitas</SelectItem>
                  <SelectItem value="expense">Despesas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
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

export default Lancamentos;
