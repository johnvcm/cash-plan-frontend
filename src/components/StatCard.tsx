import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  variant?: "default" | "success" | "warning" | "destructive";
}

export function StatCard({ title, value, icon: Icon, trend, variant = "default" }: StatCardProps) {
  const variantClasses = {
    default: "bg-gradient-card",
    success: "bg-gradient-success",
    warning: "bg-gradient-to-br from-warning/10 to-warning/5",
    destructive: "bg-gradient-to-br from-destructive/10 to-destructive/5",
  };

  const iconVariants = {
    default: "text-primary",
    success: "text-success",
    warning: "text-warning",
    destructive: "text-destructive",
  };

  return (
    <Card className={`${variantClasses[variant]} shadow-card hover:shadow-hover transition-shadow`}>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1 flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-xl sm:text-2xl font-bold text-foreground truncate">{value}</p>
            {trend && (
              <p className={`text-xs ${trend.isPositive ? "text-success" : "text-destructive"}`}>
                {trend.isPositive ? "↑" : "↓"} {trend.value}
              </p>
            )}
          </div>
          <div className={`rounded-full p-2 sm:p-3 flex-shrink-0 ${variant === "default" ? "bg-primary/10" : "bg-background/50"}`}>
            <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${iconVariants[variant]}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
