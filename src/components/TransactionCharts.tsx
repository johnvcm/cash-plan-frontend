import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Transaction } from "@/hooks/use-api";
import { formatCurrency } from "@/lib/format";
import { TrendingDown, TrendingUp } from "lucide-react";

interface TransactionChartsProps {
  transactions: Transaction[];
}

type PeriodFilter = "7d" | "30d" | "90d" | "12m" | "all";

const COLORS = {
  expense: ["#EF4444", "#F97316", "#F59E0B", "#EAB308", "#84CC16", "#22C55E", "#10B981", "#14B8A6", "#06B6D4", "#0EA5E9"],
  income: ["#10B981", "#22C55E", "#84CC16", "#EAB308", "#F59E0B", "#06B6D4", "#0EA5E9", "#3B82F6", "#6366F1", "#8B5CF6"],
};

export function TransactionCharts({ transactions }: TransactionChartsProps) {
  const [period, setPeriod] = useState<PeriodFilter>("30d");

  // Filtrar transações por período
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const periodMap: Record<PeriodFilter, number> = {
      "7d": 7,
      "30d": 30,
      "90d": 90,
      "12m": 365,
      "all": Infinity,
    };

    const daysAgo = periodMap[period];
    if (daysAgo === Infinity) return transactions;

    const cutoffDate = new Date(now);
    cutoffDate.setDate(cutoffDate.getDate() - daysAgo);

    return transactions.filter((t) => new Date(t.date) >= cutoffDate);
  }, [transactions, period]);

  // Agrupar despesas por categoria
  const expensesByCategory = useMemo(() => {
    const expenses = filteredTransactions.filter((t) => t.type === "expense");
    const grouped = expenses.reduce((acc, t) => {
      const category = t.category || "Outros";
      acc[category] = (acc[category] || 0) + Math.abs(t.amount);
      return acc;
    }, {} as Record<string, number>);

    const total = Object.values(grouped).reduce((sum, val) => sum + val, 0);

    return Object.entries(grouped)
      .map(([name, value]) => ({
        name,
        value,
        percentage: total > 0 ? (value / total) * 100 : 0,
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  // Agrupar receitas por categoria
  const incomesByCategory = useMemo(() => {
    const incomes = filteredTransactions.filter((t) => t.type === "income");
    const grouped = incomes.reduce((acc, t) => {
      const category = t.category || "Outros";
      acc[category] = (acc[category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    const total = Object.values(grouped).reduce((sum, val) => sum + val, 0);

    return Object.entries(grouped)
      .map(([name, value]) => ({
        name,
        value,
        percentage: total > 0 ? (value / total) * 100 : 0,
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  // Dados para o gráfico de barras empilhadas com categorias
  const stackedBarData = useMemo(() => {
    // Criar objeto com todas as categorias
    const expensesObj: Record<string, number> = {};
    expensesByCategory.forEach((cat) => {
      expensesObj[cat.name] = cat.value;
    });

    const incomesObj: Record<string, number> = {};
    incomesByCategory.forEach((cat) => {
      incomesObj[cat.name] = cat.value;
    });

    return [
      {
        type: "Receitas",
        ...incomesObj,
      },
      {
        type: "Despesas",
        ...expensesObj,
      },
    ];
  }, [expensesByCategory, incomesByCategory]);

  // Obter todas as categorias únicas para as barras
  const allCategories = useMemo(() => {
    const categories = new Set<string>();
    expensesByCategory.forEach((cat) => categories.add(cat.name));
    incomesByCategory.forEach((cat) => categories.add(cat.name));
    return Array.from(categories);
  }, [expensesByCategory, incomesByCategory]);

  const periodLabels: Record<PeriodFilter, string> = {
    "7d": "Últimos 7 dias",
    "30d": "Últimos 30 dias",
    "90d": "Últimos 90 dias",
    "12m": "Últimos 12 meses",
    "all": "Todo o período",
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-foreground">{payload[0].name}</p>
          <p className="text-sm text-muted-foreground">
            {formatCurrency(payload[0].value)}
          </p>
          <p className="text-xs text-muted-foreground">
            {payload[0].payload.percentage?.toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }: any) => {
    if (percentage < 5) return null; // Não mostrar label para fatias muito pequenas
    
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        className="text-xs font-bold"
      >
        {`${percentage.toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Filtro de Período */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-lg sm:text-xl">Análise de Lançamentos</CardTitle>
            <Select value={period} onValueChange={(value) => setPeriod(value as PeriodFilter)}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Selecione o período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">{periodLabels["7d"]}</SelectItem>
                <SelectItem value="30d">{periodLabels["30d"]}</SelectItem>
                <SelectItem value="90d">{periodLabels["90d"]}</SelectItem>
                <SelectItem value="12m">{periodLabels["12m"]}</SelectItem>
                <SelectItem value="all">{periodLabels["all"]}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Período selecionado: <span className="font-medium text-foreground">{periodLabels[period]}</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {filteredTransactions.length} transações neste período
          </p>
        </CardContent>
      </Card>

      {/* Gráfico de Barras Empilhadas com Categorias */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Receitas vs Despesas por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={stackedBarData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis dataKey="type" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend 
                wrapperStyle={{ fontSize: "12px" }}
                formatter={(value) => {
                  // Limitar tamanho do nome da categoria
                  return value.length > 15 ? value.substring(0, 12) + "..." : value;
                }}
              />
              {allCategories.map((category, index) => {
                // Usar cores de despesas para categorias de despesas, cores de receitas para receitas
                const isExpenseCategory = expensesByCategory.some(cat => cat.name === category);
                const colorArray = isExpenseCategory ? COLORS.expense : COLORS.income;
                const color = colorArray[index % colorArray.length];
                
                return (
                  <Bar
                    key={category}
                    dataKey={category}
                    stackId="a"
                    fill={color}
                  />
                );
              })}
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Gráfico de Pizza - Despesas */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-destructive" />
              Despesas por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            {expensesByCategory.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={expensesByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomLabel}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {expensesByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS.expense[index % COLORS.expense.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value, entry: any) => (
                        <span className="text-xs">
                          {value} ({entry.payload.percentage.toFixed(1)}%)
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {expensesByCategory.slice(0, 5).map((cat, index) => (
                    <div key={cat.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS.expense[index % COLORS.expense.length] }}
                        />
                        <span className="text-muted-foreground">{cat.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(cat.value)}</p>
                        <p className="text-xs text-muted-foreground">{cat.percentage.toFixed(1)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhuma despesa neste período
              </p>
            )}
          </CardContent>
        </Card>

        {/* Gráfico de Pizza - Receitas */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-success" />
              Receitas por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            {incomesByCategory.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={incomesByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomLabel}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {incomesByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS.income[index % COLORS.income.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value, entry: any) => (
                        <span className="text-xs">
                          {value} ({entry.payload.percentage.toFixed(1)}%)
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {incomesByCategory.slice(0, 5).map((cat, index) => (
                    <div key={cat.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS.income[index % COLORS.income.length] }}
                        />
                        <span className="text-muted-foreground">{cat.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(cat.value)}</p>
                        <p className="text-xs text-muted-foreground">{cat.percentage.toFixed(1)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhuma receita neste período
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

