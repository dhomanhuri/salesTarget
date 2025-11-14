import { useQuery } from "@tanstack/react-query";
import { KPICard } from "@/components/kpi-card";
import { Target, TrendingUp, Users, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { formatRupiah } from "@/lib/currency";

interface DashboardStats {
  totalTarget: number;
  totalActual: number;
  totalAMs: number;
  achievementRate: number;
  amPerformance: Array<{
    name: string;
    target: number;
    actual: number;
  }>;
}

export function AdminDashboard() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/admin"],
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
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
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Overview of all departments and account managers
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Target"
          value={stats?.totalTarget || 0}
          icon={Target}
          isCurrency
        />
        <KPICard
          title="Total Actual Progress"
          value={stats?.totalActual || 0}
          icon={TrendingUp}
          isCurrency
        />
        <KPICard
          title="Total Account Managers"
          value={stats?.totalAMs || 0}
          icon={Users}
        />
        <KPICard
          title="Achievement Rate"
          value={`${stats?.achievementRate?.toFixed(1) || 0}%`}
          icon={DollarSign}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Target vs Actual by Account Manager</CardTitle>
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
