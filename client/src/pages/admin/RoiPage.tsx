import { AdminLayout } from "@/components/admin/AdminLayout";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard, StatsGrid } from "@/components/admin/StatsCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DollarSign, TrendingUp, Percent, Target } from "lucide-react";

const mockServiceData = [
  { service: "Airport Transfer", spend: 5240, revenue: 18450, roi: 252 },
  { service: "Corporate Events", spend: 3120, revenue: 12340, roi: 295 },
  { service: "Wedding Service", spend: 2450, revenue: 9280, roi: 279 },
  { service: "Party Bus", spend: 1890, revenue: 6120, roi: 224 },
];

const mockVehicleData = [
  { vehicle: "Luxury Sedan", spend: 2340, revenue: 8450, roi: 261 },
  { vehicle: "SUV", spend: 3120, revenue: 11230, roi: 260 },
  { vehicle: "Limousine", spend: 4250, revenue: 15680, roi: 269 },
  { vehicle: "Party Bus", spend: 1890, revenue: 6120, roi: 224 },
];

export default function RoiPage() {
  return (
    <>
      <SEO
        title="ROI Analysis | Royal Carriage Admin"
        description="Return on investment analysis"
        noindex={true}
      />
      <AdminLayout
        title="ROI Analysis"
        subtitle="Return on investment metrics by service and vehicle type"
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "ROI Analysis" },
        ]}
      >
        {/* ROI Summary Cards */}
        <StatsGrid columns={4} className="mb-6">
          <StatsCard
            title="Total Spend"
            value="$12,700"
            icon={<DollarSign className="h-4 w-4" />}
            trend={{ value: 8.3, label: "vs last period" }}
          />
          <StatsCard
            title="Total Revenue"
            value="$46,190"
            icon={<TrendingUp className="h-4 w-4" />}
            trend={{ value: 12.1, label: "vs last period" }}
          />
          <StatsCard
            title="Average ROI"
            value="264%"
            icon={<Percent className="h-4 w-4" />}
            trend={{ value: 5.2, label: "vs last period" }}
          />
          <StatsCard
            title="Target ROI"
            value="250%"
            icon={<Target className="h-4 w-4" />}
            description="Goal achieved"
          />
        </StatsGrid>

        <div className="grid gap-6 md:grid-cols-2">
          {/* ROI by Service */}
          <Card>
            <CardHeader>
              <CardTitle>ROI by Service Type</CardTitle>
              <CardDescription>Performance breakdown by service offering</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Spend</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>ROI</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockServiceData.map((item) => (
                    <TableRow key={item.service}>
                      <TableCell className="font-medium">{item.service}</TableCell>
                      <TableCell>${item.spend.toLocaleString()}</TableCell>
                      <TableCell>${item.revenue.toLocaleString()}</TableCell>
                      <TableCell className="font-semibold text-green-600">
                        {item.roi}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* ROI by Vehicle Type */}
          <Card>
            <CardHeader>
              <CardTitle>ROI by Vehicle Type</CardTitle>
              <CardDescription>Performance breakdown by vehicle category</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Spend</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>ROI</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockVehicleData.map((item) => (
                    <TableRow key={item.vehicle}>
                      <TableCell className="font-medium">{item.vehicle}</TableCell>
                      <TableCell>${item.spend.toLocaleString()}</TableCell>
                      <TableCell>${item.revenue.toLocaleString()}</TableCell>
                      <TableCell className="font-semibold text-green-600">
                        {item.roi}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </>
  );
}
