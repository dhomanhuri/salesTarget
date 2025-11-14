import { Switch, Route, Redirect } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ProtectedRoute } from "@/components/protected-route";
import type { User } from "@shared/schema";

import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Users from "@/pages/users";
import Targets from "@/pages/targets";
import Customers from "@/pages/customers";
import Reports from "@/pages/reports";
import Presentation from "@/pages/presentation";

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/me"],
  });

  if (!user) return null;

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar user={user} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between p-4 border-b bg-background">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
          </header>
          <main className="flex-1 overflow-auto">
            <div className="container max-w-7xl mx-auto p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      
      <Route path="/">
        {() => <Redirect to="/dashboard" />}
      </Route>

      <Route path="/dashboard">
        {() => (
          <ProtectedRoute>
            <AuthenticatedLayout>
              <Dashboard />
            </AuthenticatedLayout>
          </ProtectedRoute>
        )}
      </Route>

      <Route path="/users">
        {() => (
          <ProtectedRoute allowedRoles={["ADMIN", "GM"]}>
            <AuthenticatedLayout>
              <Users />
            </AuthenticatedLayout>
          </ProtectedRoute>
        )}
      </Route>

      <Route path="/targets">
        {() => (
          <ProtectedRoute>
            <AuthenticatedLayout>
              <Targets />
            </AuthenticatedLayout>
          </ProtectedRoute>
        )}
      </Route>

      <Route path="/customers">
        {() => (
          <ProtectedRoute allowedRoles={["AM"]}>
            <AuthenticatedLayout>
              <Customers />
            </AuthenticatedLayout>
          </ProtectedRoute>
        )}
      </Route>

      <Route path="/reports">
        {() => (
          <ProtectedRoute>
            <AuthenticatedLayout>
              <Reports />
            </AuthenticatedLayout>
          </ProtectedRoute>
        )}
      </Route>

      <Route path="/presentation">
        {() => (
          <ProtectedRoute allowedRoles={["AM"]}>
            <Presentation />
          </ProtectedRoute>
        )}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
