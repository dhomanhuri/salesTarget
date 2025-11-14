import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";
import { AdminDashboard } from "@/components/dashboards/admin-dashboard";
import { GMDashboard } from "@/components/dashboards/gm-dashboard";
import { AMDashboard } from "@/components/dashboards/am-dashboard";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/auth/me"],
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

  if (!user) return null;

  return (
    <div>
      {user.role === "ADMIN" && <AdminDashboard />}
      {user.role === "GM" && <GMDashboard user={user} />}
      {user.role === "AM" && <AMDashboard user={user} />}
    </div>
  );
}
