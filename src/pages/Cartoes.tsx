import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCardCard } from "@/components/CreditCardCard";
import { Plus } from "lucide-react";

const Cartoes = () => {
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
    {
      id: 3,
      name: "Itaú BLACK2898",
      bank: "ITAÚ MASTERCARD BLACK",
      used: 15000,
      limit: 50000,
      color: "#F97316",
    },
  ]);

  const totalUsed = cards.reduce((sum, card) => sum + card.used, 0);
  const totalLimit = cards.reduce((sum, card) => sum + card.limit, 0);
  const availableLimit = totalLimit - totalUsed;

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
          <h1 className="text-3xl font-bold text-foreground">Cartões de Crédito</h1>
          <p className="text-muted-foreground">Gerencie seus cartões e limites</p>
        </div>
        <Button className="bg-gradient-primary hover:bg-primary-hover">
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Cartão
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-card">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Total utilizado</p>
            <p className="text-2xl font-bold text-foreground mt-2">
              {formatCurrency(totalUsed / 100)}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Limite total</p>
            <p className="text-2xl font-bold text-foreground mt-2">
              {formatCurrency(totalLimit / 100)}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Limite disponível</p>
            <p className="text-2xl font-bold text-success mt-2">
              {formatCurrency(availableLimit / 100)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Meus Cartões</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {cards.map((card) => (
            <CreditCardCard key={card.id} {...card} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default Cartoes;
