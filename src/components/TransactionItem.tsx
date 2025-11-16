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
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div
          className={`h-9 w-9 sm:h-10 sm:w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
            type === "income" ? "bg-success/10" : "bg-destructive/10"
          }`}
        >
          <span className={`text-base sm:text-lg ${type === "income" ? "text-success" : "text-destructive"}`}>
            {type === "income" ? "↑" : "↓"}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground text-sm sm:text-base truncate">{description}</p>
          <p className="text-xs sm:text-sm text-muted-foreground">{category}</p>
        </div>
      </div>
      <div className="flex items-center justify-between sm:justify-end gap-3">
        <div className="text-left sm:text-right">
          <p className={`font-semibold text-sm sm:text-base ${type === "income" ? "text-success" : "text-destructive"}`}>
            {type === "income" ? "+" : "-"} {formatCurrency(Math.abs(amount))}
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground">{formatDate(date)}</p>
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
    </div>
  );
}
