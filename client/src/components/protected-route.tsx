import { useQuery } from "@tanstack/react-query";
import { Redirect } from "wouter";
import type { User } from "@shared/schema";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<"ADMIN" | "GM" | "AM">;
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/auth/me"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Redirect to="/dashboard" />;
  }

  return <>{children}</>;
}
