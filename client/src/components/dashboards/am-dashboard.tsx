import { useQuery } from "@tanstack/react-query";
import { KPICard } from "@/components/kpi-card";
import { Target, TrendingUp, Users, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import type { User, CustomerStatus } from "@shared/schema";

interface AMDashboardStats {
  myTarget: number;
  totalPotential: number;
  totalCustomers: number;
  statusBreakdown: Array<{
    status: CustomerStatus;
    count: number;
  }>;
}

interface AMDashboardProps {
  user: User;
}

const STATUS_COLORS: Record<CustomerStatus, string> = {
  "Prospect": "hsl(217, 91%, 60%)",
  "On Going": "hsl(45, 93%, 47%)",
  "Negotiation": "hsl(271, 81%, 56%)",
  "Closed Won": "hsl(142, 71%, 45%)",
  "Closed Lost": "hsl(0, 0%, 60%)",
};

export function AMDashboard({ user }: AMDashboardProps) {
  const { data: stats, isLoading } = useQuery<AMDashboardStats>({
    queryKey: ["/api/dashboard/am", user.id],
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

  const chartData = stats?.statusBreakdown.map(item => ({
    name: item.status,
    value: item.count,
  })) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold" data-testid="text-dashboard-title">
          AM Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Your personal targets and customer pipeline
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="My Target"
          value={stats?.myTarget || 0}
          icon={Target}
          isCurrency
        />
        <KPICard
          title="Total Potential"
          value={stats?.totalPotential || 0}
          icon={TrendingUp}
          isCurrency
        />
        <KPICard
          title="Total Customers"
          value={stats?.totalCustomers || 0}
          icon={Users}
        />
        <KPICard
          title="Progress Rate"
          value={stats?.myTarget && stats?.totalPotential 
            ? `${((stats.totalPotential / stats.myTarget) * 100).toFixed(1)}%`
            : "0%"}
          icon={AlertCircle}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Status Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name as CustomerStatus]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
