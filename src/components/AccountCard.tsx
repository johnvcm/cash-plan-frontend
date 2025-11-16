import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

interface AccountCardProps {
  name: string;
  bank: string;
  balance: string;
  investments?: string;
  color: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function AccountCard({ name, bank, balance, investments, color, onEdit, onDelete }: AccountCardProps) {
  return (
    <Card className="shadow-card hover:shadow-hover transition-shadow">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={`rounded-lg p-2 sm:p-3 flex-shrink-0`} style={{ backgroundColor: color }}>
              <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-white/30" />
            </div>
            <div className="space-y-1 flex-1 min-w-0">
              <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">{name}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">{bank}</p>
              <div className="mt-2 sm:mt-3 space-y-1">
                <div className="flex justify-between gap-4 sm:gap-8">
                  <span className="text-xs sm:text-sm text-muted-foreground">Conta corrente</span>
                  <span className="font-medium text-foreground text-xs sm:text-sm">{balance}</span>
                </div>
                {investments && (
                  <div className="flex justify-between gap-4 sm:gap-8">
                    <span className="text-xs sm:text-sm text-muted-foreground">Investimentos</span>
                    <span className="font-medium text-foreground text-xs sm:text-sm">{investments}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-1 justify-end sm:flex-col sm:gap-1">
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
