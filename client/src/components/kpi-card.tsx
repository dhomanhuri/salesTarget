import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { formatRupiah } from "@/lib/currency";

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  isCurrency?: boolean;
  className?: string;
}

export function KPICard({ title, value, icon: Icon, trend, isCurrency = false, className = "" }: KPICardProps) {
  const displayValue = isCurrency && typeof value === 'number' 
    ? formatRupiah(value) 
    : value;

  return (
    <Card className={className} data-testid={`card-kpi-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold" data-testid={`text-kpi-value-${title.toLowerCase().replace(/\s+/g, '-')}`}>
          {displayValue}
        </div>
        {trend && (
          <p className="text-xs text-muted-foreground mt-1">
            <span className={trend.isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}>
              {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
            </span>{" "}
            from last period
          </p>
        )}
      </CardContent>
    </Card>
  );
}
