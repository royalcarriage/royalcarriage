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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  LineChart,
  Line,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Car,
  Users,
  MapPin,
  Calendar,
  Download,
  RefreshCw,
} from "lucide-react";

// Mock data for charts
const revenueData = [
  { name: "Jan", revenue: 45000, trips: 320, drivers: 15 },
  { name: "Feb", revenue: 52000, trips: 380, drivers: 16 },
  { name: "Mar", revenue: 48000, trips: 350, drivers: 16 },
  { name: "Apr", revenue: 61000, trips: 420, drivers: 17 },
  { name: "May", revenue: 55000, trips: 390, drivers: 17 },
  { name: "Jun", revenue: 67000, trips: 480, drivers: 18 },
  { name: "Jul", revenue: 72000, trips: 520, drivers: 18 },
  { name: "Aug", revenue: 78000, trips: 560, drivers: 19 },
  { name: "Sep", revenue: 71000, trips: 510, drivers: 19 },
  { name: "Oct", revenue: 82000, trips: 590, drivers: 20 },
  { name: "Nov", revenue: 88000, trips: 640, drivers: 21 },
  { name: "Dec", revenue: 95000, trips: 700, drivers: 22 },
];

const tripsByLocation = [
  { name: "O'Hare Airport", value: 45, color: "hsl(var(--chart-1))" },
  { name: "Midway Airport", value: 25, color: "hsl(var(--chart-2))" },
  { name: "Downtown", value: 20, color: "hsl(var(--chart-3))" },
  { name: "Suburbs", value: 10, color: "hsl(var(--chart-4))" },
];

const tripsByVehicle = [
  { name: "Sedan", trips: 320, revenue: 28000 },
  { name: "SUV", trips: 180, revenue: 25200 },
  { name: "Luxury", trips: 80, revenue: 16000 },
  { name: "Sprinter", trips: 40, revenue: 12000 },
];

const driverPerformance = [
  { name: "Week 1", avgRating: 4.7, completionRate: 95 },
  { name: "Week 2", avgRating: 4.8, completionRate: 97 },
  { name: "Week 3", avgRating: 4.6, completionRate: 94 },
  { name: "Week 4", avgRating: 4.9, completionRate: 98 },
];

export default function AnalyticsPage() {
  return (
    <>
      <SEO
        title="Analytics | Royal Carriage Admin"
        description="Business analytics and insights"
        noindex={true}
      />
      <AdminLayout
        title="Analytics"
        subtitle="Business insights and performance metrics"
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Analytics" },
        ]}
        actions={
          <div className="flex gap-2">
            <Select defaultValue="30days">
              <SelectTrigger className="w-40">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="90days">Last 90 days</SelectItem>
                <SelectItem value="year">This year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        }
      >
        {/* KPI Stats */}
        <StatsGrid columns={4} className="mb-6">
          <StatsCard
            title="Total Revenue (YTD)"
            value="$814,000"
            icon={<DollarSign className="h-4 w-4" />}
            trend={{ value: 23.5, label: "vs last year" }}
          />
          <StatsCard
            title="Total Trips (YTD)"
            value="5,860"
            icon={<MapPin className="h-4 w-4" />}
            trend={{ value: 18.2, label: "vs last year" }}
          />
          <StatsCard
            title="Average Trip Value"
            value="$138.91"
            icon={<TrendingUp className="h-4 w-4" />}
            trend={{ value: 4.5, label: "vs last year" }}
          />
          <StatsCard
            title="Driver Utilization"
            value="87%"
            icon={<Users className="h-4 w-4" />}
            trend={{ value: 5.2, label: "vs last month" }}
          />
        </StatsGrid>

        <Tabs defaultValue="revenue" className="space-y-6">
          <TabsList>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="trips">Trips</TabsTrigger>
            <TabsTrigger value="drivers">Drivers</TabsTrigger>
            <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
          </TabsList>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Revenue Trends</CardTitle>
                  <CardDescription>
                    Monthly revenue over the past year
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px]">
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
                          formatter={(value: number) => [
                            `$${value.toLocaleString()}`,
                            "Revenue",
                          ]}
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

              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Location</CardTitle>
                  <CardDescription>
                    Distribution of revenue sources
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={tripsByLocation}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {tripsByLocation.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2 mt-4">
                    {tripsByLocation.map((location) => (
                      <div
                        key={location.name}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: location.color }}
                          />
                          <span className="text-sm">{location.name}</span>
                        </div>
                        <span className="text-sm font-medium">
                          {location.value}%
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Revenue by Vehicle Type</CardTitle>
                <CardDescription>
                  Comparison of trips and revenue across vehicle categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={tripsByVehicle}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-muted"
                      />
                      <XAxis dataKey="name" className="text-xs" />
                      <YAxis yAxisId="left" className="text-xs" />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        className="text-xs"
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--popover))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar
                        yAxisId="left"
                        dataKey="trips"
                        fill="hsl(var(--chart-1))"
                        name="Trips"
                      />
                      <Bar
                        yAxisId="right"
                        dataKey="revenue"
                        fill="hsl(var(--chart-2))"
                        name="Revenue ($)"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trips Tab */}
          <TabsContent value="trips" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Trip Volume</CardTitle>
                  <CardDescription>
                    Monthly trip counts over the past year
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={revenueData}>
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
                        <Line
                          type="monotone"
                          dataKey="trips"
                          stroke="hsl(var(--chart-1))"
                          strokeWidth={2}
                          dot={{ fill: "hsl(var(--chart-1))" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Trips by Location</CardTitle>
                  <CardDescription>
                    Distribution of trip pickup locations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={tripsByLocation} layout="vertical">
                        <CartesianGrid
                          strokeDasharray="3 3"
                          className="stroke-muted"
                        />
                        <XAxis type="number" className="text-xs" />
                        <YAxis
                          dataKey="name"
                          type="category"
                          className="text-xs"
                          width={100}
                        />
                        <Tooltip />
                        <Bar dataKey="value" fill="hsl(var(--chart-1))" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Drivers Tab */}
          <TabsContent value="drivers" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Driver Growth</CardTitle>
                  <CardDescription>Active drivers over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueData}>
                        <defs>
                          <linearGradient
                            id="colorDrivers"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="hsl(var(--chart-2))"
                              stopOpacity={0.3}
                            />
                            <stop
                              offset="95%"
                              stopColor="hsl(var(--chart-2))"
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
                        <Tooltip />
                        <Area
                          type="monotone"
                          dataKey="drivers"
                          stroke="hsl(var(--chart-2))"
                          fillOpacity={1}
                          fill="url(#colorDrivers)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Driver Performance</CardTitle>
                  <CardDescription>
                    Weekly average ratings and completion rates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={driverPerformance}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          className="stroke-muted"
                        />
                        <XAxis dataKey="name" className="text-xs" />
                        <YAxis
                          yAxisId="left"
                          className="text-xs"
                          domain={[4, 5]}
                        />
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          className="text-xs"
                          domain={[90, 100]}
                        />
                        <Tooltip />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="avgRating"
                          stroke="hsl(var(--chart-1))"
                          strokeWidth={2}
                          name="Avg Rating"
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="completionRate"
                          stroke="hsl(var(--chart-2))"
                          strokeWidth={2}
                          name="Completion %"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Vehicles Tab */}
          <TabsContent value="vehicles" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Utilization</CardTitle>
                <CardDescription>
                  Trips and revenue by vehicle type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={tripsByVehicle}>
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
                      <Bar
                        dataKey="trips"
                        fill="hsl(var(--chart-1))"
                        name="Trips"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </AdminLayout>
    </>
  );
}
