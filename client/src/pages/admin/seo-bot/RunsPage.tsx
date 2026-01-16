import { AdminLayout } from "@/components/admin/AdminLayout";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Play, Clock, CheckCircle, XCircle, Eye } from "lucide-react";

const mockRuns = [
  { id: 1, runDate: "2024-01-15 10:30 AM", topics: 5, generated: 5, failed: 0, duration: "12m 34s", status: "completed" },
  { id: 2, runDate: "2024-01-14 09:15 AM", topics: 8, generated: 7, failed: 1, duration: "18m 45s", status: "completed" },
  { id: 3, runDate: "2024-01-13 11:20 AM", topics: 3, generated: 3, failed: 0, duration: "8m 12s", status: "completed" },
  { id: 4, runDate: "2024-01-12 02:45 PM", topics: 10, generated: 0, failed: 10, duration: "5m 23s", status: "failed" },
  { id: 5, runDate: "2024-01-11 08:00 AM", topics: 6, generated: 6, failed: 0, duration: "15m 08s", status: "completed" },
];

const statusIcons = {
  completed: CheckCircle,
  failed: XCircle,
};

const statusColors = {
  completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  failed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

export default function RunsPage() {
  return (
    <>
      <SEO
        title="SEO Bot Runs | Royal Carriage Admin"
        description="View SEO bot execution history"
        noindex={true}
      />
      <AdminLayout
        title="SEO Bot Runs"
        subtitle="View history of content generation runs"
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "SEO Bot", href: "/admin/seo-bot" },
          { label: "Runs" },
        ]}
        actions={
          <Button>
            <Play className="h-4 w-4 mr-2" />
            Run Now
          </Button>
        }
      >
        <Card>
          <CardHeader>
            <CardTitle>Run History</CardTitle>
            <CardDescription>
              Historical record of SEO content generation executions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Run Date</TableHead>
                  <TableHead>Topics</TableHead>
                  <TableHead>Generated</TableHead>
                  <TableHead>Failed</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockRuns.map((run) => {
                  const StatusIcon = statusIcons[run.status as keyof typeof statusIcons];
                  return (
                    <TableRow key={run.id}>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          {run.runDate}
                        </div>
                      </TableCell>
                      <TableCell>{run.topics}</TableCell>
                      <TableCell>
                        <span className="font-medium text-green-600">{run.generated}</span>
                      </TableCell>
                      <TableCell>
                        <span className={`font-medium ${run.failed > 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
                          {run.failed}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{run.duration}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[run.status as keyof typeof statusColors]} variant="secondary">
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {run.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </AdminLayout>
    </>
  );
}
