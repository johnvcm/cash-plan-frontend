import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, CreditCard } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface CreditCardCardProps {
  name: string;
  bank: string;
  used: number;
  limit: number;
  color: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function CreditCardCard({ name, bank, used, limit, color, onEdit, onDelete }: CreditCardCardProps) {
  const usagePercentage = (used / limit) * 100;
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <Card className="shadow-card hover:shadow-hover transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className={`rounded-lg p-3`} style={{ backgroundColor: color }}>
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <div className="space-y-3 flex-1">
              <div>
                <h3 className="font-semibold text-foreground">{name}</h3>
                <p className="text-sm text-muted-foreground">{bank}</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {formatCurrency(used)} ({usagePercentage.toFixed(0)}%)
                  </span>
                  <span className="font-medium text-foreground">{formatCurrency(limit)}</span>
                </div>
                <Progress value={usagePercentage} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  Limite disponível: {formatCurrency(limit - used)}
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
              <Edit className="h-4 w-4 text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onDelete}>
              <Trash2 className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
