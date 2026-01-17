import { useState, ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth, isAdmin } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Brain,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
} from "lucide-react";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navigation = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      roles: ["user", "admin", "super_admin"],
    },
    {
      name: "Page Analyzer",
      href: "/admin/analyze",
      icon: Brain,
      roles: ["admin", "super_admin"],
    },
    {
      name: "User Management",
      href: "/admin/users",
      icon: Users,
      roles: ["admin", "super_admin"],
    },
    {
      name: "Analytics",
      href: "/admin/analytics",
      icon: BarChart3,
      roles: ["admin", "super_admin"],
    },
    {
      name: "Settings",
      href: "/admin/settings",
      icon: Settings,
      roles: ["super_admin"],
    },
  ];

  const visibleNavigation = navigation.filter(
    (item) => user && item.roles.includes(user.role),
  );

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "super_admin":
        return "bg-red-100 text-red-800";
      case "admin":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? "w-64" : "w-20"} bg-slate-900 text-white transition-all duration-300 flex flex-col`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          {sidebarOpen && (
            <div>
              <h2 className="text-xl font-bold text-amber-500">
                Royal Carriage
              </h2>
              <p className="text-xs text-slate-400">Admin Dashboard</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-slate-400 hover:text-white hover:bg-slate-800"
          >
            {sidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-slate-800">
          {sidebarOpen ? (
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {user?.username}
                  </p>
                  <Badge
                    className={`text-xs ${getRoleBadgeColor(user?.role || "user")}`}
                  >
                    {user?.role.replace("_", " ")}
                  </Badge>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {visibleNavigation.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={`w-full ${sidebarOpen ? "justify-start" : "justify-center"} ${
                    isActive
                      ? "bg-amber-500 text-white hover:bg-amber-600"
                      : "text-slate-300 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <Icon className={`h-5 w-5 ${sidebarOpen ? "mr-3" : ""}`} />
                  {sidebarOpen && item.name}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-slate-800">
          <Button
            variant="ghost"
            className={`w-full ${sidebarOpen ? "justify-start" : "justify-center"} text-red-400 hover:text-red-300 hover:bg-slate-800`}
            onClick={() => logout()}
          >
            <LogOut className={`h-5 w-5 ${sidebarOpen ? "mr-3" : ""}`} />
            {sidebarOpen && "Logout"}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
