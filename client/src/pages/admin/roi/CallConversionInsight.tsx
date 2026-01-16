import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Phone, AlertTriangle, TrendingUp } from "lucide-react";

interface CallConversionData {
  page: string;
  device: "mobile" | "desktop";
  callClicks: number;
  bookings: number;
  conversionRate: number;
  gap: number;
  pageViews: number;
}

interface OpportunityScore {
  page: string;
  device: string;
  callClicks: number;
  bookings: number;
  gap: number;
  score: number;
  reason: string;
}

// Mock data: pages with high call clicks but low bookings
const generateMockData = (): CallConversionData[] => {
  return [
    {
      page: "/ohare-airport-limo",
      device: "mobile",
      callClicks: 156,
      bookings: 23,
      conversionRate: 14.7,
      gap: 133,
      pageViews: 2340,
    },
    {
      page: "/ohare-airport-limo",
      device: "desktop",
      callClicks: 89,
      bookings: 34,
      conversionRate: 38.2,
      gap: 55,
      pageViews: 1890,
    },
    {
      page: "/midway-airport-car-service",
      device: "mobile",
      callClicks: 142,
      bookings: 19,
      conversionRate: 13.4,
      gap: 123,
      pageViews: 1980,
    },
    {
      page: "/midway-airport-car-service",
      device: "desktop",
      callClicks: 67,
      bookings: 28,
      conversionRate: 41.8,
      gap: 39,
      pageViews: 1450,
    },
    {
      page: "/downtown-chicago-limo",
      device: "mobile",
      callClicks: 98,
      bookings: 15,
      conversionRate: 15.3,
      gap: 83,
      pageViews: 1560,
    },
    {
      page: "/downtown-chicago-limo",
      device: "desktop",
      callClicks: 54,
      bookings: 22,
      conversionRate: 40.7,
      gap: 32,
      pageViews: 1120,
    },
    {
      page: "/wedding-limo-chicago",
      device: "mobile",
      callClicks: 124,
      bookings: 12,
      conversionRate: 9.7,
      gap: 112,
      pageViews: 1750,
    },
    {
      page: "/wedding-limo-chicago",
      device: "desktop",
      callClicks: 71,
      bookings: 27,
      conversionRate: 38.0,
      gap: 44,
      pageViews: 1340,
    },
  ];
};

const calculateOpportunityScore = (
  data: CallConversionData[],
): OpportunityScore[] => {
  const opportunities: OpportunityScore[] = [];

  data.forEach((row) => {
    if (row.conversionRate < 25 && row.callClicks > 50) {
      const score =
        row.gap * 0.6 + (100 - row.conversionRate) * 0.4 + row.pageViews * 0.01;

      let reason = "";
      if (row.device === "mobile" && row.conversionRate < 20) {
        reason = "Mobile UX likely causing drop-off";
      } else if (row.callClicks > 100 && row.bookings < 30) {
        reason = "Phone line may have issues or poor follow-up";
      } else {
        reason = "Price mismatch or availability concerns";
      }

      opportunities.push({
        page: row.page,
        device: row.device,
        callClicks: row.callClicks,
        bookings: row.bookings,
        gap: row.gap,
        score: Math.round(score),
        reason,
      });
    }
  });

  return opportunities.sort((a, b) => b.score - a.score);
};

export function CallConversionInsight() {
  const [data] = useState<CallConversionData[]>(generateMockData());
  const [deviceFilter, setDeviceFilter] = useState<string>("all");

  const filteredData = data.filter(
    (row) => deviceFilter === "all" || row.device === deviceFilter,
  );

  const opportunities = calculateOpportunityScore(filteredData);

  const chartData = data.reduce(
    (acc, row) => {
      const existing = acc.find((d) => d.page === row.page);
      if (existing) {
        if (row.device === "mobile") {
          existing.mobileCallClicks = row.callClicks;
          existing.mobileBookings = row.bookings;
        } else {
          existing.desktopCallClicks = row.callClicks;
          existing.desktopBookings = row.bookings;
        }
      } else {
        acc.push({
          page: row.page.split("/")[1]?.slice(0, 20) || row.page,
          mobileCallClicks: row.device === "mobile" ? row.callClicks : 0,
          mobileBookings: row.device === "mobile" ? row.bookings : 0,
          desktopCallClicks: row.device === "desktop" ? row.callClicks : 0,
          desktopBookings: row.device === "desktop" ? row.bookings : 0,
        });
      }
      return acc;
    },
    [] as {
      page: string;
      mobileCallClicks: number;
      mobileBookings: number;
      desktopCallClicks: number;
      desktopBookings: number;
    }[],
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Call Conversion Insight</CardTitle>
              <CardDescription>
                Compare call clicks vs actual bookings by page and device.
                Identify pages with high intent but low conversion.
              </CardDescription>
            </div>
            <Select value={deviceFilter} onValueChange={setDeviceFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by device" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Devices</SelectItem>
                <SelectItem value="mobile">Mobile Only</SelectItem>
                <SelectItem value="desktop">Desktop Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-600">Total Call Clicks</p>
                    <p className="text-2xl font-bold">
                      {filteredData
                        .reduce((sum, row) => sum + row.callClicks, 0)
                        .toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-600">Total Bookings</p>
                    <p className="text-2xl font-bold">
                      {filteredData
                        .reduce((sum, row) => sum + row.bookings, 0)
                        .toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  <div>
                    <p className="text-sm text-gray-600">Conversion Gap</p>
                    <p className="text-2xl font-bold">
                      {filteredData
                        .reduce((sum, row) => sum + row.gap, 0)
                        .toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div>
                  <p className="text-sm text-gray-600">Avg Conversion Rate</p>
                  <p className="text-2xl font-bold">
                    {(
                      filteredData.reduce(
                        (sum, row) => sum + row.conversionRate,
                        0,
                      ) / filteredData.length
                    ).toFixed(1)}
                    %
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chart */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Call Clicks vs Bookings by Page</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="page"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="mobileCallClicks"
                    fill="#f59e0b"
                    name="Mobile Calls"
                  />
                  <Bar
                    dataKey="mobileBookings"
                    fill="#fbbf24"
                    name="Mobile Bookings"
                  />
                  <Bar
                    dataKey="desktopCallClicks"
                    fill="#3b82f6"
                    name="Desktop Calls"
                  />
                  <Bar
                    dataKey="desktopBookings"
                    fill="#60a5fa"
                    name="Desktop Bookings"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Detailed Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Page</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead className="text-right">Page Views</TableHead>
                    <TableHead className="text-right">Call Clicks</TableHead>
                    <TableHead className="text-right">Bookings</TableHead>
                    <TableHead className="text-right">Conv. Rate</TableHead>
                    <TableHead className="text-right">Gap</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{row.page}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            row.device === "mobile" ? "default" : "secondary"
                          }
                        >
                          {row.device}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {row.pageViews.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {row.callClicks}
                      </TableCell>
                      <TableCell className="text-right">
                        {row.bookings}
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={
                            row.conversionRate < 20
                              ? "text-red-600 font-semibold"
                              : row.conversionRate < 30
                                ? "text-yellow-600"
                                : "text-green-600"
                          }
                        >
                          {row.conversionRate.toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {row.gap > 80 ? (
                          <span className="text-red-600 font-semibold">
                            {row.gap}
                          </span>
                        ) : (
                          row.gap
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Opportunities Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            High-Priority Opportunities
          </CardTitle>
          <CardDescription>
            Pages with high call intent but low booking conversion (sorted by
            opportunity score)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {opportunities.map((opp, idx) => (
              <div
                key={idx}
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">{opp.page}</h4>
                      <Badge variant="outline">{opp.device}</Badge>
                      <Badge className="bg-yellow-500">{opp.score} pts</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-2 text-sm">
                      <div>
                        <span className="text-gray-600">Call Clicks:</span>{" "}
                        <span className="font-semibold">{opp.callClicks}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Bookings:</span>{" "}
                        <span className="font-semibold">{opp.bookings}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Gap:</span>{" "}
                        <span className="font-semibold text-red-600">
                          {opp.gap}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 italic">{opp.reason}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">
              Recommended Actions:
            </h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
              <li>Test mobile click-to-call functionality on high-gap pages</li>
              <li>
                Add trust signals (reviews, guarantees) near phone numbers
              </li>
              <li>Implement call tracking to identify abandonment reasons</li>
              <li>A/B test booking form placement after call clicks</li>
              <li>Review phone answering scripts and response times</li>
            </ul>
          </div>

          {/* TODO: Firebase Integration */}
          <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-200 text-sm text-gray-600">
            <strong>TODO:</strong> Connect to Firebase Analytics events for
            call_click and booking_completed. Track by page_path and
            device_category.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
