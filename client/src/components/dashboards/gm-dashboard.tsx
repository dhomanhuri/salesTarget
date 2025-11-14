import { useQuery } from "@tanstack/react-query";
import { KPICard } from "@/components/kpi-card";
import { Target, TrendingUp, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { formatRupiah } from "@/lib/currency";
import type { User } from "@shared/schema";

interface GMDashboardStats {
  totalTarget: number;
  totalActual: number;
  totalAMs: number;
  amPerformance: Array<{
    name: string;
    target: number;
    actual: number;
  }>;
}

interface GMDashboardProps {
  user: User;
}

export function GMDashboard({ user }: GMDashboardProps) {
  const { data: stats, isLoading } = useQuery<GMDashboardStats>({
    queryKey: ["/api/dashboard/gm", user.id],
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  const chartData = stats?.amPerformance || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold" data-testid="text-dashboard-title">
          GM Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Overview of your department and account managers
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <KPICard
          title="Department Target"
          value={stats?.totalTarget || 0}
          icon={Target}
          isCurrency
        />
        <KPICard
          title="Total Progress"
          value={stats?.totalActual || 0}
          icon={TrendingUp}
          isCurrency
        />
        <KPICard
          title="Account Managers"
          value={stats?.totalAMs || 0}
          icon={Users}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>AM Performance: Target vs Actual</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="name" className="text-xs" />
              <YAxis className="text-xs" tickFormatter={(value) => formatRupiah(value)} />
              <Tooltip 
                formatter={(value: number) => formatRupiah(value)}
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
              />
              <Legend />
              <Bar dataKey="target" fill="hsl(var(--primary))" name="Target" />
              <Bar dataKey="actual" fill="hsl(var(--accent))" name="Actual" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
