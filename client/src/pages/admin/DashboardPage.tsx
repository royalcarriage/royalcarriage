import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatsCard, StatsGrid } from "@/components/admin/StatsCard";
import { SEO } from "@/components/SEO";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  DollarSign,
  Car,
  Users,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle,
  FileUp,
  ArrowRight,
  Calendar,
  MapPin,
  CreditCard,
  Wallet,
} from "lucide-react";
import { Link } from "wouter";

// Mock data for charts
const revenueData = [
  { name: "Jan", revenue: 45000, trips: 320 },
  { name: "Feb", revenue: 52000, trips: 380 },
  { name: "Mar", revenue: 48000, trips: 350 },
  { name: "Apr", revenue: 61000, trips: 420 },
  { name: "May", revenue: 55000, trips: 390 },
  { name: "Jun", revenue: 67000, trips: 480 },
  { name: "Jul", revenue: 72000, trips: 520 },
];

const tripsByType = [
  { name: "Airport Transfer", value: 45, color: "hsl(var(--chart-1))" },
  { name: "Point to Point", value: 30, color: "hsl(var(--chart-2))" },
  { name: "Hourly", value: 15, color: "hsl(var(--chart-3))" },
  { name: "Corporate", value: 10, color: "hsl(var(--chart-4))" },
];

const recentActivity = [
  {
    id: 1,
    type: "trip_completed",
    title: "Trip #4521 completed",
    description: "O'Hare Airport → Downtown Chicago",
    time: "5 minutes ago",
    icon: CheckCircle,
    iconColor: "text-green-500",
  },
  {
    id: 2,
    type: "import_failed",
    title: "Import failed: 3 rows",
    description: "trips_jan2024.csv - validation errors",
    time: "12 minutes ago",
    icon: AlertTriangle,
    iconColor: "text-amber-500",
  },
  {
    id: 3,
    type: "driver_added",
    title: "New driver onboarded",
    description: "Michael Johnson completed verification",
    time: "1 hour ago",
    icon: Users,
    iconColor: "text-blue-500",
  },
  {
    id: 4,
    type: "payout_sent",
    title: "Weekly payout processed",
    description: "$12,450 sent to 15 drivers",
    time: "3 hours ago",
    icon: Wallet,
    iconColor: "text-purple-500",
  },
  {
    id: 5,
    type: "trip_booked",
    title: "Trip #4522 booked",
    description: "Midway Airport → Naperville",
    time: "4 hours ago",
    icon: Calendar,
    iconColor: "text-cyan-500",
  },
];

const actionItems = [
  {
    id: 1,
    type: "warning",
    title: "3 imports require attention",
    description: "Failed validation - review and retry",
    action: "Review Imports",
    href: "/admin/imports",
    priority: "high",
  },
  {
    id: 2,
    type: "info",
    title: "Weekly payout pending approval",
    description: "$18,230 for 22 drivers ready for review",
    action: "Review Payout",
    href: "/admin/payroll",
    priority: "medium",
  },
  {
    id: 3,
    type: "warning",
    title: "2 drivers pending verification",
    description: "Documents submitted, awaiting review",
    action: "Verify Drivers",
    href: "/admin/drivers",
    priority: "medium",
  },
  {
    id: 4,
    type: "info",
    title: "Vehicle inspection due",
    description: "3 vehicles need inspection renewal",
    action: "View Vehicles",
    href: "/admin/vehicles",
    priority: "low",
  },
];

const topDrivers = [
  { id: 1, name: "John Smith", trips: 48, revenue: 3240, rating: 4.9 },
  { id: 2, name: "Sarah Johnson", trips: 42, revenue: 2890, rating: 4.8 },
  { id: 3, name: "Mike Williams", trips: 38, revenue: 2650, rating: 4.9 },
  { id: 4, name: "Emily Brown", trips: 35, revenue: 2420, rating: 4.7 },
  { id: 5, name: "David Lee", trips: 32, revenue: 2180, rating: 4.8 },
];

export default function DashboardPage() {
  return (
    <>
      <SEO
        title="Dashboard | Royal Carriage Admin"
        description="Enterprise admin dashboard for Royal Carriage"
        noindex={true}
      />
      <AdminLayout
        title="Dashboard"
        subtitle="Welcome back! Here's what's happening with your business today."
        actions={
          <div className="flex gap-2">
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              This Week
            </Button>
            <Button>
              <FileUp className="h-4 w-4 mr-2" />
              Import Data
            </Button>
          </div>
        }
      >
        {/* KPI Stats */}
        <StatsGrid columns={4} className="mb-6">
          <StatsCard
            title="Total Revenue"
            value="$72,450"
            icon={<DollarSign className="h-4 w-4" />}
            trend={{ value: 12.5, label: "from last month" }}
          />
          <StatsCard
            title="Active Trips"
            value="24"
            icon={<MapPin className="h-4 w-4" />}
            trend={{ value: 8, label: "from yesterday" }}
          />
          <StatsCard
            title="Active Drivers"
            value="18"
            icon={<Users className="h-4 w-4" />}
            trend={{ value: 2, label: "new this week" }}
          />
          <StatsCard
            title="Pending Payouts"
            value="$18,230"
            icon={<CreditCard className="h-4 w-4" />}
            description="22 drivers pending"
          />
        </StatsGrid>

        {/* Main Dashboard Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Revenue Chart - Takes 2 columns */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Revenue Overview</CardTitle>
                  <CardDescription>
                    Monthly revenue and trip trends
                  </CardDescription>
                </div>
                <Tabs defaultValue="revenue">
                  <TabsList>
                    <TabsTrigger value="revenue">Revenue</TabsTrigger>
                    <TabsTrigger value="trips">Trips</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient
                        id="colorRevenue"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="hsl(var(--chart-1))"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="hsl(var(--chart-1))"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-muted"
                    />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="hsl(var(--chart-1))"
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Action Required Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Action Required
              </CardTitle>
              <CardDescription>Items that need your attention</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[300px]">
                <div className="space-y-1 p-4 pt-0">
                  {actionItems.map((item) => (
                    <Link key={item.id} href={item.href}>
                      <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group">
                        <div
                          className={`h-2 w-2 rounded-full mt-2 ${
                            item.priority === "high"
                              ? "bg-red-500"
                              : item.priority === "medium"
                                ? "bg-amber-500"
                                : "bg-blue-500"
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{item.title}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {item.description}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </Link>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Second Row */}
        <div className="grid gap-6 lg:grid-cols-3 mt-6">
          {/* Recent Activity */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Latest updates across the system
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[280px]">
                <div className="space-y-4">
                  {recentActivity.map((activity) => {
                    const Icon = activity.icon;
                    return (
                      <div key={activity.id} className="flex items-start gap-4">
                        <div
                          className={`h-9 w-9 rounded-full bg-muted flex items-center justify-center ${activity.iconColor}`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium">
                            {activity.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {activity.description}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {activity.time}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Trips by Type */}
          <Card>
            <CardHeader>
              <CardTitle>Trips by Type</CardTitle>
              <CardDescription>Distribution of trip categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={tripsByType}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {tripsByType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {tripsByType.map((type) => (
                  <div key={type.name} className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: type.color }}
                    />
                    <span className="text-xs text-muted-foreground truncate">
                      {type.name}
                    </span>
                    <span className="text-xs font-medium ml-auto">
                      {type.value}%
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Third Row */}
        <div className="grid gap-6 lg:grid-cols-2 mt-6">
          {/* Top Drivers */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Top Drivers</CardTitle>
                  <CardDescription>Best performers this month</CardDescription>
                </div>
                <Link href="/admin/drivers">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topDrivers.map((driver, index) => (
                  <div key={driver.id} className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-6 text-sm font-medium text-muted-foreground">
                      {index + 1}
                    </div>
                    <Avatar className="h-9 w-9">
                      <AvatarFallback>
                        {driver.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{driver.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {driver.trips} trips • ⭐ {driver.rating}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        ${driver.revenue.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">revenue</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and operations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/admin/trips">
                  <Button
                    variant="outline"
                    className="w-full h-auto py-4 flex flex-col gap-2"
                  >
                    <MapPin className="h-5 w-5" />
                    <span>New Trip</span>
                  </Button>
                </Link>
                <Link href="/admin/drivers">
                  <Button
                    variant="outline"
                    className="w-full h-auto py-4 flex flex-col gap-2"
                  >
                    <Users className="h-5 w-5" />
                    <span>Add Driver</span>
                  </Button>
                </Link>
                <Link href="/admin/imports">
                  <Button
                    variant="outline"
                    className="w-full h-auto py-4 flex flex-col gap-2"
                  >
                    <FileUp className="h-5 w-5" />
                    <span>Import Data</span>
                  </Button>
                </Link>
                <Link href="/admin/payroll">
                  <Button
                    variant="outline"
                    className="w-full h-auto py-4 flex flex-col gap-2"
                  >
                    <Wallet className="h-5 w-5" />
                    <span>Run Payroll</span>
                  </Button>
                </Link>
              </div>

              {/* System Health */}
              <div className="mt-6 pt-6 border-t">
                <h4 className="text-sm font-medium mb-4">System Status</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      API Status
                    </span>
                    <Badge
                      variant="default"
                      className="bg-green-500/10 text-green-500 hover:bg-green-500/20"
                    >
                      Operational
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Data Sync
                    </span>
                    <Badge
                      variant="default"
                      className="bg-green-500/10 text-green-500 hover:bg-green-500/20"
                    >
                      Up to date
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Last Backup
                    </span>
                    <span className="text-sm text-muted-foreground">
                      2 hours ago
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </>
  );
}
