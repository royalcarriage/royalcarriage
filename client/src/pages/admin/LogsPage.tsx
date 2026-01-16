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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Activity, User, FileText, Download, Clock } from "lucide-react";

const mockLogs = [
  { id: 1, timestamp: "2024-01-15 10:30:45", user: "admin@example.com", action: "Published content", entity: "SEO Article", status: "success" },
  { id: 2, timestamp: "2024-01-15 09:15:22", user: "editor@example.com", action: "Edited page", entity: "About Page", status: "success" },
  { id: 3, timestamp: "2024-01-15 08:45:12", user: "admin@example.com", action: "Imported data", entity: "Moovs CSV", status: "success" },
  { id: 4, timestamp: "2024-01-14 16:20:33", user: "admin@example.com", action: "Deployed to production", entity: "v2.4.1", status: "success" },
  { id: 5, timestamp: "2024-01-14 14:10:55", user: "editor@example.com", action: "Upload failed", entity: "Image Asset", status: "error" },
  { id: 6, timestamp: "2024-01-14 11:30:18", user: "viewer@example.com", action: "Viewed report", entity: "Analytics", status: "info" },
];

const statusColors = {
  success: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  error: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  info: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
};

export default function LogsPage() {
  return (
    <>
      <SEO
        title="Activity Logs | Royal Carriage Admin"
        description="View system activity logs"
        noindex={true}
      />
      <AdminLayout
        title="Activity Logs"
        subtitle="View and monitor system activity"
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Logs" },
        ]}
        actions={
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Logs
          </Button>
        }
      >
        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <Select defaultValue="all">
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Action Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="publish">Publish</SelectItem>
                  <SelectItem value="edit">Edit</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                  <SelectItem value="import">Import</SelectItem>
                  <SelectItem value="deploy">Deploy</SelectItem>
                </SelectContent>
              </Select>

              <Select defaultValue="all">
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="User" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>

              <Select defaultValue="all">
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Activity Log Table */}
        <Card>
          <CardHeader>
            <CardTitle>Activity Log</CardTitle>
            <CardDescription>Recent system and user activity</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        {log.timestamp}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{log.user}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{log.action}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{log.entity}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[log.status as keyof typeof statusColors]} variant="secondary">
                        {log.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </AdminLayout>
    </>
  );
}
