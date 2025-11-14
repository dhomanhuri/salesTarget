import { LayoutDashboard, Target, Users, FileText, Settings, UserCircle, Presentation } from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import type { User } from "@shared/schema";

interface AppSidebarProps {
  user: User;
}

export function AppSidebar({ user }: AppSidebarProps) {
  const [location] = useLocation();

  const mainMenuItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      roles: ["ADMIN", "GM", "AM"],
    },
    {
      title: "Targets",
      url: "/targets",
      icon: Target,
      roles: ["ADMIN", "GM", "AM"],
    },
    {
      title: "Customers",
      url: "/customers",
      icon: Users,
      roles: ["AM"],
    },
    {
      title: "Reports",
      url: "/reports",
      icon: FileText,
      roles: ["ADMIN", "GM", "AM"],
    },
    {
      title: "Presentation",
      url: "/presentation",
      icon: Presentation,
      roles: ["AM"],
    },
  ];

  const adminMenuItems = [
    {
      title: "User Management",
      url: "/users",
      icon: Settings,
      roles: ["ADMIN", "GM"],
    },
  ];

  const filteredMainMenu = mainMenuItems.filter(item => 
    item.roles.includes(user.role)
  );

  const filteredAdminMenu = adminMenuItems.filter(item => 
    item.roles.includes(user.role)
  );

  return (
    <Sidebar data-testid="sidebar-main">
      <SidebarContent>
        <SidebarGroup>
          <div className="px-4 py-6">
            <h1 className="text-xl font-bold text-primary" data-testid="text-logo">
              QuotaTrackr
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Sales Target & Progress
            </p>
          </div>
          <Separator />
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMainMenu.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url}>
                    <Link href={item.url} data-testid={`link-${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {filteredAdminMenu.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredAdminMenu.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={location === item.url}>
                      <Link href={item.url} data-testid={`link-${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <div className="flex items-center gap-2 cursor-default">
                <UserCircle className="h-4 w-4" />
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-sm font-medium truncate" data-testid="text-user-name">
                    {user.name}
                  </span>
                  <span className="text-xs text-muted-foreground" data-testid="text-user-role">
                    {user.role}
                  </span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
