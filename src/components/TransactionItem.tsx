import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

interface TransactionItemProps {
  description: string;
  category: string;
  date: string;
  amount: number;
  type: "income" | "expense";
  onEdit?: () => void;
  onDelete?: () => void;
}

export function TransactionItem({
  description,
  category,
  date,
  amount,
  type,
  onEdit,
  onDelete,
}: TransactionItemProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-4 flex-1">
        <div
          className={`h-10 w-10 rounded-full flex items-center justify-center ${
            type === "income" ? "bg-success/10" : "bg-destructive/10"
          }`}
        >
          <span className={`text-lg ${type === "income" ? "text-success" : "text-destructive"}`}>
            {type === "income" ? "↑" : "↓"}
          </span>
        </div>
        <div className="flex-1">
          <p className="font-medium text-foreground">{description}</p>
          <p className="text-sm text-muted-foreground">{category}</p>
        </div>
        <div className="text-right">
          <p className={`font-semibold ${type === "income" ? "text-success" : "text-destructive"}`}>
            {type === "income" ? "+" : "-"} {formatCurrency(Math.abs(amount))}
          </p>
          <p className="text-sm text-muted-foreground">{formatDate(date)}</p>
        </div>
      </div>
      <div className="flex gap-1 ml-4">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
          <Edit className="h-4 w-4 text-muted-foreground" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onDelete}>
          <Trash2 className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>
    </div>
  );
}
