import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  Car,
  Users,
  Truck,
  Building2,
  FileUp,
  DollarSign,
  Settings,
  Bell,
  Search,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  Moon,
  Sun,
  Menu,
  CreditCard,
  FileText,
  BarChart3,
  HelpCircle,
  MapPin,
  ChevronsUpDown,
  Check,
  Plus,
  TrendingUp,
} from "lucide-react";

// Mock organizations for the switcher
const organizations = [
  { id: "1", name: "Royal Carriage", role: "Owner", logo: "RC" },
  { id: "2", name: "Chicago Limo Co", role: "Admin", logo: "CL" },
  { id: "3", name: "O'Hare Express", role: "Member", logo: "OE" },
];

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navigation: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { title: "KPI Dashboard", href: "/admin/kpi", icon: TrendingUp, badge: "New", badgeVariant: "default" },
    ],
  },
  {
    label: "Operations",
    items: [
      { title: "Trips", href: "/admin/trips", icon: MapPin, badge: "12", badgeVariant: "secondary" },
      { title: "Drivers", href: "/admin/drivers", icon: Users },
      { title: "Vehicles", href: "/admin/vehicles", icon: Car },
      { title: "Customers", href: "/admin/customers", icon: Building2 },
    ],
  },
  {
    label: "Data Management",
    items: [
      { title: "Import Center", href: "/admin/imports", icon: FileUp, badge: "3", badgeVariant: "destructive" },
      { title: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Finance",
    items: [
      { title: "Payroll", href: "/admin/payroll", icon: DollarSign },
      { title: "Invoices", href: "/admin/invoices", icon: FileText },
      { title: "Payments", href: "/admin/payments", icon: CreditCard },
    ],
  },
  {
    label: "System",
    items: [
      { title: "Settings", href: "/admin/settings", icon: Settings },
      { title: "Help & Support", href: "/admin/help", icon: HelpCircle },
    ],
  },
];

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export function AdminLayout({
  children,
  title,
  subtitle,
  actions,
  breadcrumbs,
}: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [location] = useLocation();

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <TooltipProvider delayDuration={0}>
      <div className="min-h-screen bg-background flex">
        {/* Mobile sidebar overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-card transition-all duration-300",
            collapsed ? "w-16" : "w-64",
            mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          )}
        >
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-border">
            {!collapsed && (
              <Link href="/admin" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Car className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="font-semibold text-foreground">Royal Carriage</span>
              </Link>
            )}
            {collapsed && (
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center mx-auto">
                <Car className="h-5 w-5 text-primary-foreground" />
              </div>
            )}
          </div>

          {/* Organization Switcher */}
          <div className="p-2 border-b border-border">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-2 h-auto py-2",
                    collapsed && "justify-center px-2"
                  )}
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarFallback className="rounded-lg bg-primary/10 text-primary text-xs font-semibold">
                      RC
                    </AvatarFallback>
                  </Avatar>
                  {!collapsed && (
                    <>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium">Royal Carriage</p>
                        <p className="text-xs text-muted-foreground">Owner</p>
                      </div>
                      <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>Switch Organization</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {organizations.map((org) => (
                  <DropdownMenuItem key={org.id} className="cursor-pointer">
                    <Avatar className="h-6 w-6 rounded mr-2">
                      <AvatarFallback className="rounded text-xs bg-primary/10 text-primary">
                        {org.logo}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{org.name}</p>
                      <p className="text-xs text-muted-foreground">{org.role}</p>
                    </div>
                    {org.id === "1" && <Check className="h-4 w-4 text-primary" />}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Organization
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 py-4">
            <nav className="space-y-6 px-2">
              {navigation.map((group) => (
                <div key={group.label}>
                  {!collapsed && (
                    <h3 className="px-3 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {group.label}
                    </h3>
                  )}
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const isActive = location === item.href || (item.href !== "/admin" && location.startsWith(item.href));
                      const Icon = item.icon;
                      
                      const linkContent = (
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                            collapsed && "justify-center px-2"
                          )}
                        >
                          <Icon className="h-5 w-5 flex-shrink-0" />
                          {!collapsed && (
                            <>
                              <span className="flex-1">{item.title}</span>
                              {item.badge && (
                                <Badge
                                  variant={item.badgeVariant || "secondary"}
                                  className="h-5 min-w-5 flex items-center justify-center text-xs"
                                >
                                  {item.badge}
                                </Badge>
                              )}
                            </>
                          )}
                        </Link>
                      );

                      if (collapsed) {
                        return (
                          <Tooltip key={item.href}>
                            <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                            <TooltipContent side="right" className="flex items-center gap-2">
                              {item.title}
                              {item.badge && (
                                <Badge variant={item.badgeVariant || "secondary"} className="text-xs">
                                  {item.badge}
                                </Badge>
                              )}
                            </TooltipContent>
                          </Tooltip>
                        );
                      }

                      return <div key={item.href}>{linkContent}</div>;
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </ScrollArea>

          {/* Collapse button */}
          <div className="border-t border-border p-2 hidden md:block">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-center"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
              {!collapsed && <span className="ml-2">Collapse</span>}
            </Button>
          </div>
        </aside>

        {/* Main content */}
        <div
          className={cn(
            "flex-1 flex flex-col min-h-screen transition-all duration-300",
            collapsed ? "md:ml-16" : "md:ml-64"
          )}
        >
          {/* Top header */}
          <header className="sticky top-0 z-30 h-16 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
            <div className="flex h-full items-center justify-between px-4 gap-4">
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>

              {/* Search */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search trips, drivers, vehicles..."
                    className="pl-10 bg-background border-border"
                  />
                </div>
              </div>

              {/* Right side actions */}
              <div className="flex items-center gap-2">
                {/* Quick KPI Indicators */}
                <Link href="/admin/kpi">
                  <Button variant="ghost" size="sm" className="hidden lg:flex gap-2">
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-muted-foreground">Data:</span>
                      <span className="font-semibold">🟢</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-muted-foreground">Gates:</span>
                      <span className="font-semibold">🟢</span>
                    </div>
                  </Button>
                </Link>
                
                {/* Theme toggle */}
                <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
                  {darkMode ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </Button>

                {/* Notifications */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                      <Bell className="h-5 w-5" />
                      <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                        3
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="flex flex-col items-start gap-1 cursor-pointer">
                      <span className="font-medium">Import failed</span>
                      <span className="text-xs text-muted-foreground">
                        3 rows failed validation in trips_jan2024.csv
                      </span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex flex-col items-start gap-1 cursor-pointer">
                      <span className="font-medium">Payout pending approval</span>
                      <span className="text-xs text-muted-foreground">
                        Weekly payout batch ready for review
                      </span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex flex-col items-start gap-1 cursor-pointer">
                      <span className="font-medium">New driver onboarded</span>
                      <span className="text-xs text-muted-foreground">
                        John Smith completed verification
                      </span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-center cursor-pointer">
                      <span className="text-sm text-primary">View all notifications</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Separator orientation="vertical" className="h-8" />

                {/* User menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2 pl-2 pr-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                          AD
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden md:flex flex-col items-start">
                        <span className="text-sm font-medium">Admin User</span>
                        <span className="text-xs text-muted-foreground">Administrator</span>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 p-6">
            {/* Breadcrumbs */}
            {breadcrumbs && breadcrumbs.length > 0 && (
              <nav className="mb-4 flex items-center gap-1 text-sm text-muted-foreground">
                {breadcrumbs.map((crumb, index) => (
                  <span key={index} className="flex items-center gap-1">
                    {crumb.href ? (
                      <Link
                        href={crumb.href}
                        className="hover:text-foreground transition-colors"
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="text-foreground">{crumb.label}</span>
                    )}
                    {index < breadcrumbs.length - 1 && (
                      <span className="mx-1">/</span>
                    )}
                  </span>
                ))}
              </nav>
            )}

            {/* Page header */}
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                {subtitle && (
                  <p className="text-muted-foreground mt-1">{subtitle}</p>
                )}
              </div>
              {actions && <div className="flex items-center gap-2">{actions}</div>}
            </div>

            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
