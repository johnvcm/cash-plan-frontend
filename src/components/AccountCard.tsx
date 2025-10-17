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
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className={`rounded-lg p-3`} style={{ backgroundColor: color }}>
              <div className="h-6 w-6 rounded-full bg-white/30" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-foreground">{name}</h3>
              <p className="text-sm text-muted-foreground">{bank}</p>
              <div className="mt-3 space-y-1">
                <div className="flex justify-between gap-8">
                  <span className="text-sm text-muted-foreground">Conta corrente</span>
                  <span className="font-medium text-foreground">{balance}</span>
                </div>
                {investments && (
                  <div className="flex justify-between gap-8">
                    <span className="text-sm text-muted-foreground">Investimentos</span>
                    <span className="font-medium text-foreground">{investments}</span>
                  </div>
                )}
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
